const { Ledger, CostCenter } = require("../models/ledger.models"); // ✅ Fix import
const Expenses = require("../models/expenses.models"); // ✅ your expense schema
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary"); // ✅ adjust as needed
const Employee = require("../models/employee.models");
const {
  sendApproveByAdmin,
  sendApproveByAccountant,
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
const  getFinancialYear = require("../utils/getFinancialYear.js");
const { generateVoucherNo } = require("../utils/voucherNoGenerator.js");

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
    const { date, amount, narration, expenseCategory } = req.body;
    const user = req.user;
    const files = req.files || (req.file ? [req.file] : []);
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("STEP 1: Start");

    if (!req.body.expenseLedger) {
      return res.status(400).json({ message: "Required ledger missing" });
    }
    console.log("Required fields present, proceeding...");
    console.log("STEP 2: Resolve paidBy");
    const paidByLedger = await Ledger.findById(user.ledger);
    if (!paidByLedger) {
      return res.status(400).json({ message: "PaidBy ledger not found" });
    }
    console.log("STEP 3: Resolve expense ledgers");
    console.log("Expense Ledger ID:", req.body.expenseLedger);
    const expenseLedger = await Ledger.findById(req.body.expenseLedger);
    let expenseFor = null;
    const expenseForId =
      req.body.expenseFor === "null" || !req.body.expenseFor
        ? null
        : req.body.expenseFor;
    if (expenseForId) {
      console.log("finding expense for", req.body.expenseFor)
      expenseFor = await CostCenter.findById(req.body.expenseFor);
      console.log("found expense for")
    }
    console.log("Expense For Ledger ID:", req.body.expenseFor);

    if (!expenseLedger) {
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
      expenseCategory,
      expenseLedger: expenseLedger._id,
      paidByLedger: paidByLedger._id,
      expenseFor: expenseFor?._id || null,
      attachments, // ✅ keep this
      status: "Draft",
      createdBy: req.user._id,
    });
    console.log("STEP 6: Created expense");
    res.status(201).json(expense);
    const employee = await User.find({ role: "Employee" });
    if (employee.length > 0) {
      for (let emp of employee) {
        sendPushNotification(
          emp._id,
          `${amount} paid by ${user.userName} for ${expenseLedger.name} expense of ${narration}.`,
        );
      }
    }

    const newExpense = await Expenses.findById(expense._id)
      .populate("paidByLedger")
      .populate("expenseLedger")
      .populate("expenseFor")
      .lean();
    console.log(newExpense)
    sendApproveByAdmin(newExpense, "Expense", user._id);
    sendApproveByAccountant(newExpense, "Expense", user._id);

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
      type: "JOURNAL",
      date: expense.date,
      companyId: expense.companyId,
      narration: expense.narration,

      reference: "Expense",
      referenceId: expense._id,

      costCenterId: expense.expenseFor._id || null,

      entries: [
        {
          ledgerId: expense.expenseLedger._id,
          type: "DEBIT",
          amount: expense.amount,
        },
        {
          ledgerId: expense.paidByLedger._id,
          type: "CREDIT",
          amount: expense.amount,
        },
      ],
      status: "DRAFT",
      createdBy: req.user._id,
    });

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
    const { userId, employeeId, month, year, type, status, approval } = req.query;

    // console.log(req.query)
    let query = {};

    /* -----------------------------
       Resolve employee → user
    ------------------------------ */

    let finalUserId = null;
    if (userId) {
      query.createdBy = userId;
    }

    // console.log("Initalizating ")
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
      query["expenseLedger"] = type || null;
    }

    /* -----------------------------
       Status
    ------------------------------ */

    if (status) query.status = status;

    if (approval) query.isApproved = approval;

    /* -----------------------------
       Fetch Expenses
    ------------------------------ */
    // console.log("finding ")
    const expenses = await Expenses.find(query)
      .populate("expenseLedger")
      .populate("paidByLedger")
      .populate("expenseFor")
      .sort({ date: -1 })
      .exec();

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    // console.log(expenses)
    // console.log("Found")
    res.json({
      totalAmount,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

const getExpenseById = async (req, res) => {
  const expense = await Expenses.findById(req.params.id)
    .populate("expenseLedger")
    .populate("paidByLedger")
    .populate("expenseFor")
    .exec();
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

    // if (expense.createdBy !== user._id){
    //   return res.status(410).json("Permission deined");
    // }

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

    const { date, amount, narration, remarks, expenseCategory } = req.body;

    /* ----------------------------------
       LEDGER VALIDATION (IF CHANGED)
    ---------------------------------- */
    let expenseLedger;
    if (req.body.expenseLedger) {
      expenseLedger = await Ledger.findById(req.body.expenseLedger);
      if (!expenseLedger) {
        return res.status(400).json({ message: "Invalid expense ledger" });
      }

      expense.expenseLedger = expenseLedger._id || expense.expenseLedger;
    }

    const isValidObjectId = (val) =>
      val && val !== "null" && val !== "undefined";

    let expenseFor;
    if (isValidObjectId(req.body.expenseFor)) {
      expenseFor = await CostCenter.findById(req.body.expenseFor);

      if (!expenseFor) {
        return res.status(400).json({ message: "Invalid expense-for" });
      }

      expense.expenseFor = expenseFor._id;
    }

    const paidByLedger = await Ledger.findById(user.ledger);
    if (!paidByLedger) {
      return res.status(400).json({ message: "PaidBy ledger not found" });
    }

    /* ----------------------------------
       BASIC FIELD UPDATES
    ---------------------------------- */
    if (date) expense.date = date;
    if (amount !== undefined) expense.amount = Number(amount);
    if (narration !== undefined) expense.narration = narration;
    if (remarks !== undefined) expense.remarks = remarks || expense?.remarks;
    expense.companyId = user.companyId || expense?.companyId;
    expense.paidByLedger = paidByLedger || expense?.paidByLedger;
    expense.createdBy = user._id || expense?.createdBy;
    expense.expenseCategory = expenseCategory;

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
          `${amount} paid by ${user.userName} for ${expense?.expenseLedger.name} expense of ${expense?.narration}.`,
        );
      }
    }

    const updateExpense = await Expenses.findById(expense._id)
      .populate("paidByLedger")
      .populate("expenseLedger")
      .populate("expenseFor")
      .lean();
    console.log(updateExpense)
    sendApproveByAdmin(updateExpense, "Expense", user._id);
    sendApproveByAccountant(updateExpense, "Expense", user._id);

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
  const expense = await Expenses.findByIdAndDelete(req.params.id);
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  if (
    expense.status !== "Draft" &&
    (expense.isApproved !== "Approved" || expense.isApproved !== "Rejected")
  ) {
    return res
      .status(400)
      .json({ message: "Only Draft expense can be deleted" });
  }

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
