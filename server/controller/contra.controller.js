const {
  createContraVoucher,
  updateContraVoucher,
  deleteContraVoucher,
  getAllContras,
  getContraById,
  getContraDetail,
  getContraByVoucherNo,
} = require("../services/ERP/contra.service.js");

// const { postVoucher, cancelVoucher } = require("../services/ERP/posting.service.js");
const {
  createVoucher,
  postVoucher,
  cancelVoucher,
} = require("../services/ERP/voucher/voucher.service.js");

/* ======================
   CREATE
====================== */
const createContra = async (req, res) => {
  try {
    const voucher = await createContraVoucher(req.body, req.user);
    res.status(201).json(voucher);
  } catch (error) {
    console.log(error)
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

const getContraDetailByID = async (req, res) => {
  try {
    const data = await getContraDetail(req.params.id);
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

module.exports = {
  createContra,
  updateContra,
  deleteContra,
  getAllContra,
  getContra,
  getContraDetailByID,
  getContraByVoucher,
  postContra,
  cancelContra,
};
