const { Ledger, CostCenter } = require("../models/ledger.models"); // ✅ Fix import
const Expenses = require("../models/expenses.models"); // ✅ your expense schema
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary"); // ✅ adjust as needed
const Employee = require("../models/employee.models");
const {
  sendApproveByAdmin,
  sendApproveByAccountHead,
} = require("./approval.controller.js");
const User = require("../models/user.models");
const {
  sendPushNotification,
  notifyRole,
} = require("../utils/pushNotification.js");
const {
  createVoucher,
  postVoucher,
  cancelVoucher,
  updateVoucher,
} = require("../services/ERP/voucher/voucher.service.js");

const resolvePaidByLedger = async (userId) => {
  const employee = await Employee.findOne({ userId });
  if (!employee) throw new Error("Employee not found");

  const ledger = await Ledger.findById(employee.ledger);
  if (!ledger) throw new Error("Employee ledger not found");

  return ledger;
};

/* ======================================================
   CREATE EXPENSE (DRAFT)
====================================================== */
const createExpense = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("STEP 1: Start");
    const { date, amount, narration } = req.body;
    const user = req.user;
    const files = req.files || (req.file ? [req.file] : []);

    if (!req.body.expenseLedger || !req.body.expenseForLedger) {
      return res.status(400).json({ message: "Required ledger missing" });
    }
    console.log("Required fields present, proceeding...");
    console.log("STEP 2: Resolve paidBy");
    const paidByLedger = await await Ledger.findById(user.ledger);
    if (!paidByLedger) {
      return res.status(400).json({ message: "PaidBy ledger not found" });
    }
    console.log("STEP 3: Resolve expense ledgers");
    console.log("Expense Ledger ID:", req.body.expenseLedger);
    console.log("Expense For Ledger ID:", req.body.expenseForLedger);
    const expenseLedger = await Ledger.findById(req.body.expenseLedger);
    const expenseForLedger = await CostCenter.findById(
      req.body.expenseForLedger,
    );

    if (!expenseLedger || !expenseForLedger) {
      return res.status(400).json({ message: "Invalid ledger selected" });
    }
    console.log("STEP 3: Fetched ledgers");

    let attachments = [];
    console.log("STEP 4: Uploading files");
    for (const file of files) {
      console.log("Uploading file:", file.originalname);
      const upload = await uploadOnCloudinary(file.buffer, {
        folder: "expenses",
        public_id: `${req.user.userName}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      });

      console.log("Upload result:", upload);

      if (!upload?.secure_url) continue;

      attachments.push({
        url: upload.secure_url,
        public_id: upload.public_id,
        fileType: file.mimetype === "application/pdf" ? "pdf" : "image",
      });
    }

    console.log("STEP 5: Creating expense");
    const expense = await Expenses.create({
      date,
      amount: Number(amount),
      narration,
      companyId: user.companyId,
      expenseLedger: expenseLedger._id,
      paidByLedger: paidByLedger._id,
      expenseForLedger: expenseForLedger._id,
      attachments, // ✅ keep this
      status: "Draft",
      createdBy: req.user._id,
    });
    console.log("STEP 6: Created expense");
    const employee = await User.find({ role: "Employee" });
    if (employee.length > 0) {
      for (let emp of employee) {
        sendPushNotification(
          emp._id,
          `${amount} paid by ${user.userName} for ${expenseLedger.name} expense of ${expenseForLedger.name}.`,
        );
      }
    }
    sendApproveByAdmin(expense, "Expense", user._id);

    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   POST EXPENSE (ACCOUNTING ENTRY)
====================================================== */
const postExpense = async (req, res) => {
  try {
    const expense = await Expenses.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (expense.status === "Posted" && expense.isApproved !== "Approved") {
      return res
        .status(400)
        .json({ message: "Only Draft expense can be posted" });
    }

    // 🔥 Create voucher
    const voucher = await createVoucher({
      companyId: expense.companyId,
      type: "JOURNAL",
      date: expense.date,
      narration: expense.narration,

      reference: "Expense" + " " + expense.expenseNo,
      referenceId: expense._id,

      costCenterId: expense.expenseForLedger.id,

      entries: [
        {
          ledgerId: expense.expenseLedger.id,
          type: "DEBIT",
          amount: expense.amount,
        },
        {
          ledgerId: expense.paidByLedger.id,
          type: "CREDIT",
          amount: expense.amount,
        },
      ],

      // createdBy: user._id,
    });

    await postVoucher(voucher._id);

    // 🔗 link back
    expense.voucherId = voucher._id;
    expense.status = "Posted";
    await expense.save();

    res.json({ message: "Expense posted successfully", expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   CANCEL EXPENSE (REVERSAL)
====================================================== */
const cancelExpense = async (req, res) => {
  try {
    const expense = await Expenses.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (expense.status !== "Posted" && expense.isApproved !== "Approved") {
      return res
        .status(400)
        .json({ message: "Only Posted expense can be cancelled" });
    }

    await cancelVoucher(expense.voucherId);

    expense.status = "Cancelled";
    await expense.save();

    for (const att of expense.attachments) {
      await deleteFromCloudinary(att.public_id);
    }

    res.json({ message: "Expense cancelled successfully", expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET EXPENSES
====================================================== */
const getExpenses = async (req, res) => {
  try {
    const { employeeId, month, year, type, status, approval } = req.query;

    let query = {};

    /* -----------------------------
       Resolve employee → user
    ------------------------------ */

    let finalUserId = null;

    if (employeeId) {
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      finalUserId = employee.userId;
    }

    if (finalUserId) {
      query.createdBy = finalUserId;
    }

    /* -----------------------------
       Date Filter
    ------------------------------ */

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);

      query.date = { $gte: start, $lt: end };
    }

    /* -----------------------------
       Expense Type
    ------------------------------ */

    if (type) {
      query["expenseLedger.id"] = type || null;
    }

    /* -----------------------------
       Status
    ------------------------------ */

    if (status) query.status = status;

    if (approval) query.isApproved = approval;

    /* -----------------------------
       Fetch Expenses
    ------------------------------ */

    const expenses = await Expenses.find(query).sort({ date: -1 });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      totalAmount,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExpenseById = async (req, res) => {
  const expense = await Expenses.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  res.json(expense);
};

/* ======================================================
   UPDATE EXPENSE (DRAFT ONLY)
====================================================== */
const updateExpense = async (req, res) => {
  try {
    const user = req.user;
    const expense = await Expenses.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    /* ----------------------------------
       EDIT PERMISSION CHECK
    ---------------------------------- */
    // if (
    //   expense.status === "Posted"
    //   && expense.isApproved === "Approved"
    // ) {
    //   console.log(expense.status, expense.isApproved);
    //   return res.status(400).json({
    //     message: "Only Draft & unapproved expenses can be edited",
    //   });
    // }

    const { date, amount, narration, remarks } = req.body;

    /* ----------------------------------
       LEDGER VALIDATION (IF CHANGED)
    ---------------------------------- */
    if (req.body.expenseLedger) {
      const expenseLedger = await Ledger.findById(req.body.expenseLedger);
      if (!expenseLedger) {
        return res.status(400).json({ message: "Invalid expense ledger" });
      }

      expense.expenseLedger = expenseLedger._id;
    }

    if (req.body.expenseFor) {
      const expenseFor = await CostCenter.findById(req.body.expenseFor);
      if (!expenseFor) {
        return res.status(400).json({ message: "Invalid expense-for ledger" });
      }

      expense.expenseFor = expenseFor._id;
    }

    /* ----------------------------------
       BASIC FIELD UPDATES
    ---------------------------------- */
    if (date) expense.date = date;
    if (amount !== undefined) expense.amount = Number(amount);
    if (expenseCategory !== undefined)
      expense.expenseCategory = expenseCategory;
    if (narration !== undefined) expense.narration = narration;
    if (remarks !== undefined) expense.remarks = remarks;

    /* ----------------------------------
       ATTACHMENTS (APPEND ONLY)
    ---------------------------------- */

    const files = req.files || (req.file ? [req.file] : []);
    // console.log("first", req.files)

    for (const file of files) {
      const upload = await uploadOnCloudinary(file.buffer, {
        folder: "expenses",
        public_id: `${req.user.userName}-${Date.now()}`,
      });
      if (!upload?.secure_url) continue;

      expense.attachments.push({
        url: upload.secure_url,
        public_id: upload.public_id,
        fileType: file.mimetype.includes("pdf") ? "pdf" : "image",
      });
    }

    await expense.save();

    const employee = await User.find({ role: "Employee" });
    if (employee.length > 0) {
      for (let emp of employee) {
        sendPushNotification(
          emp._id,
          `${amount} paid by ${user.userName} for ${expense?.expenseLedger.name} expense of ${expense?.expenseForLedger.name}.`,
        );
      }
    }
    sendApproveByAdmin(expense, "Expense", user._id);

    // await updateVoucher(expense.voucherId);

    res.json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (err) {
    console.error("Update Expense Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   DELETE EXPENSE (DRAFT ONLY)
====================================================== */
const deleteExpense = async (req, res) => {
  const expense = await Expenses.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  if (
    expense.status !== "Draft" &&
    (expense.isApproved !== "Approved" || expense.isApproved !== "Rejected")
  ) {
    return res
      .status(400)
      .json({ message: "Only Draft expense can be deleted" });
  }

  await expense.deleteOne();

  for (const att of expense.attachments) {
    await deleteFromCloudinary(att.public_id);
  }
  res.json({ message: "Expense deleted" });
};

module.exports = {
  createExpense,
  postExpense,
  cancelExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenses,
};
