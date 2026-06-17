const paymentService = require("../services/ERP/payment.service");
// const { postVoucher, cancelVoucher } = require("../services/ERP/posting.service");
const {
  postVoucher,
  cancelVoucher,
} = require("../services/ERP/voucher/voucher.service.js");

/* CREATE */
const createPayment = async (req, res) => {
  try {
    const voucher = await paymentService.createPaymentVoucher(req.body, req.user);
    res.status(201).json(voucher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* UPDATE */
const updatePayment = async (req, res) => {
  try {
    const voucher = await paymentService.updatePaymentVoucher(req.params.id, req.body);
    res.json(voucher);
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
  }
};

/* GET ALL */
const getPayments = async (req, res) => {
  try {
    const data = await paymentService.getAllPayments(req.query);
    res.json(data);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
};

/* GET ONE */
const getPaymentById = async (req, res) => {
  try {
    const data = await paymentService.getPaymentById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/* DELETE */
const deletePayment = async (req, res) => {
  try {
    await paymentService.deletePaymentVoucher(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


/* POST */
const postPayment = async (req, res) => {
  try {
    const voucher = await postVoucher(req.params.id, req.user);
    res.json({ message: "Posted successfully", voucher });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* CANCEL */
const cancelPayment = async (req, res) => {
  try {
    const voucher = await cancelVoucher(req.params.id, req.user);
    res.json({ message: "Cancelled successfully", voucher });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createPayment,
  updatePayment,
  getPayments,
  getPaymentById,
  deletePayment,
  postPayment,
  cancelPayment,
};