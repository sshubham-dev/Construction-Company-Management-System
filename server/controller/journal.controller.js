const journalService = require("../services/ERP/journal.service");
const { postVoucher, cancelVoucher } = require("../services/ERP/posting.service");

/* ======================
   CREATE
====================== */
const createJournal = async (req, res) => {
  try {
    const voucher = await journalService.createJournalVoucher(req.body, req.user);
    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ======================
   UPDATE
====================== */
const updateJournal = async (req, res) => {
  try {
    const voucher = await journalService.updateJournalVoucher(req.params.id, req.body);
    res.json(voucher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ======================
   DELETE
====================== */
const deleteJournal = async (req, res) => {
  try {
    await journalService.deleteJournalVoucher(req.params.id);
    res.json({ message: "Journal deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ======================
   GET ALL
====================== */
const getJournals = async (req, res) => {
  try {
    const data = await journalService.getAllJournals(req.query);
    res.json(data);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};

/* ======================
   GET ONE
====================== */
const getJournalById = async (req, res) => {
  try {
    const data = await journalService.getJournalById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/* ======================
   GET BY VOUCHER NO
====================== */
const getJournalByVoucherNo = async (req, res) => {
  try {
    const data = await journalService.getJournalByVoucherNo(req.params.voucherNo);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/* ======================
   POST
====================== */
const postJournal = async (req, res) => {
  try {
    const voucher = await postVoucher(req.params.id, req.user);
    res.json({ message: "Journal posted successfully", voucher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ======================
   CANCEL
====================== */
const cancelJournal = async (req, res) => {
  try {
    const voucher = await cancelVoucher(req.params.id, req.user);
    res.json({ message: "Journal cancelled successfully", voucher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createJournal,
  updateJournal,
  deleteJournal,
  getJournals,
  getJournalById,
  getJournalByVoucherNo,
  postJournal,
  cancelJournal,
};