const receiptService = require("../services/ERP/receipt.service");
// const { postVoucher, cancelVoucher } = require("../services/ERP/posting.service");
const {
  postVoucher,
  cancelVoucher,
} = require("../services/ERP/voucher/voucher.service.js");

/* CREATE */
// ✅
const createReceipt = async (req, res) => {
  try {
    const voucher = await receiptService.createReceiptVoucher(req.body, req.user);
    res.status(201).json(voucher);
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
  }
};

/* UPDATE */
const updateReceipt = async (req, res) => {
  try {
    const voucher = await receiptService.updateReceiptVoucher(req.params.id, req.body);
    res.json(voucher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* GET ALL */
// ✅
const getAllReceipts = async (req, res) => {
  try {
    const data = await receiptService.getAllReceipts(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* GET ONE */
const getReceiptById = async (req, res) => {
  try {
    const data = await receiptService.getReceiptById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/* DELETE */
// ✅
const deleteReceipt = async (req, res) => {
  try {
    await receiptService.deleteReceiptVoucher(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* POST */
const postReceipt = async (req, res) => {
  try {
    const voucher = await postVoucher(req.params.id, req.user);
    res.json({ message: "Posted successfully", voucher });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* CANCEL */
const cancelReceipt = async (req, res) => {
  try {
    const voucher = await cancelVoucher(req.params.id, req.user);
    res.json({ message: "Cancelled successfully", voucher });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createReceipt,
  updateReceipt,
  getAllReceipts,
  getReceiptById,
  deleteReceipt,
  postReceipt,
  cancelReceipt,
};