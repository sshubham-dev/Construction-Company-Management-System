const {
  createContraVoucher,
  updateContraVoucher,
  deleteContraVoucher,
  getAllContras,
  getContraById,
  getContraByVoucherNo,
  postContraVoucher,
  cancelContraVoucher,
} = require("../services/ERP/contra.service.js");

const { postVoucher, cancelVoucher } = require("../services/ERP/posting.service.js");

/* ======================
   CREATE
====================== */
const createContra = async (req, res) => {
  try {
    const voucher = await createContraVoucher(req.body, req.user);
    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ======================
   UPDATE
====================== */
const updateContra = async (req, res) => {
  try {
    const voucher = await updateContraVoucher(
      req.params.id,
      req.body,
    );
    res.json(voucher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ======================
   DELETE
====================== */
const deleteContra = async (req, res) => {
  try {
    await deleteContraVoucher(req.params.id);
    res.json({ message: "Contra deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ======================
   GET ALL
====================== */
const getAllContra = async (req, res) => {
  try {
    const data = await getAllContras(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ======================
   GET ONE
====================== */
const getContra = async (req, res) => {
  try {
    const data = await getContraById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/* ======================
   GET BY VOUCHER NO
====================== */
const getContraByVoucher = async (req, res) => {
  try {
    const data = await contraService.getContraByVoucherNo(req.params.voucherNo);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/* ======================
   POST
====================== */
const postContra = async (req, res) => {
  try {
    const voucher = await postVoucher(req.params.id, req.user);
    res.json({ message: "Voucher posted successfully", voucher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ======================
   CANCEL
====================== */
const cancelContra = async (req, res) => {
  try {
    const voucher = await cancelVoucher(req.params.id, req.user);
    res.json({ message: "Voucher cancelled successfully", voucher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// const getNextContraNo = async (req, res) => {
//   try {
//     console.log("Fetching latest Contra...");
//     const latest = await Contra.findOne().sort({ createdAt: -1 });
//     console.log("Latest Contra:", latest);

//     let nextNumber = 1;
//     if (latest && latest.voucherNo) {
//       const match = latest.voucherNo.match(/\d+$/);
//       if (match) {
//         const lastNumber = parseInt(match[0], 10);
//         nextNumber = lastNumber + 1;
//       }
//     }

//     const padded = String(nextNumber).padStart(4, "0");
//     const nextVoucherNo = `CTRA-${padded}`;

//     res.json({ voucherNo: nextVoucherNo });
//   } catch (error) {
//     console.error("Error in getNextContraNo:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

module.exports = {
  createContra,
  updateContra,
  deleteContra,
  getAllContra,
  getContra,
  getContraByVoucher,
  postContra,
  cancelContra,
  // getNextContraNo,
};

// Create Contra voucher
// const createContra = async (req, res) => {
//   try {
//     const { voucherNo, date, from, to, amount, description } = req.body;

//     if (!from || !to || !amount) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     if (from === to) {
//       return res.status(400).json({ message: "From and To ledger cannot be same" });
//     }

//     const fromLedger = await Ledger.findById(from);
//     const toLedger = await Ledger.findById(to);

//     if (!fromLedger || !toLedger) {
//       return res.status(404).json({ message: "Ledger not found" });
//     }

//     const contra = await Contra.create({
//       voucherNo,
//       date,
//       from: { id: fromLedger._id, name: fromLedger.name },
//       to: { id: toLedger._id, name: toLedger.name },
//       amount: Number(amount),
//       description,
//       status: "Draft",
//       createdBy: req.user._id,
//     });

//     res.status(201).json(contra);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// const applyContraToLedgers = async (contra, mode = "add") => {
//   const multiplier = mode === "add" ? 1 : -1;
//   const amount = Number(contra.amount);

//   const fromLedger = await Ledger.findById(contra.from.id);
//   const toLedger = await Ledger.findById(contra.to.id);

//   if (!fromLedger || !toLedger) {
//     throw new Error("Ledger not found");
//   }

//   // From ledger → Credit
//   fromLedger.currentBalance -= multiplier * amount;

//   // To ledger → Debit
//   toLedger.currentBalance += multiplier * amount;

//   await fromLedger.save();
//   await toLedger.save();
// };
// const postContra = async (req, res) => {
//   try {
//     const contra = await Contra.findById(req.params.id);
//     if (!contra) {
//       return res.status(404).json({ message: "Contra not found" });
//     }

//     if (contra.status !== "Draft") {
//       return res.status(400).json({ message: "Only Draft contra can be posted" });
//     }

//     await applyContraToLedgers(contra, "add");

//     contra.status = "Posted";
//     await contra.save();

//     res.json({ message: "Contra posted successfully", contra });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// const cancelContra = async (req, res) => {
//   try {
//     const contra = await Contra.findById(req.params.id);
//     if (!contra) {
//       return res.status(404).json({ message: "Contra not found" });
//     }

//     if (contra.status !== "Posted") {
//       return res.status(400).json({ message: "Only Posted contra can be cancelled" });
//     }

//     await applyContraToLedgers(contra, "subtract");

//     contra.status = "Cancelled";
//     await contra.save();

//     res.json({ message: "Contra cancelled successfully", contra });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
