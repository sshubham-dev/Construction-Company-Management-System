const express = require('express');
const Journal = express.Router();
const {   createJournal,
  updateJournal,
  deleteJournal,
  getJournals,
  getJournalById,
  getJournalByVoucherNo,
  postJournal,
  cancelJournal, } = require('../controller/journal.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Journal Routes
Journal.post('/', userAuth, createJournal);
Journal.get('/', userAuth, getJournals);
Journal.get('/:id', userAuth, getJournalById);
Journal.put('/post/:id', userAuth, postJournal);
Journal.put('/cancel/:id', userAuth, cancelJournal);
Journal.put('/:voucherNo', userAuth, updateJournal);
Journal.delete('/:id', userAuth, deleteJournal);
// Journal.get("/next-voucher", getNextJournalNo);
// Stock Journal Routes
// router.post('/stock-journals', stockcreateStockJournal);
// router.get('/stock-journals', stockgetAllStockJournals);
// router.get('/stock-journals/:voucherNumber', stockgetStockJournalByVoucherNumber);
// router.put('/stock-journals/:voucherNumber', stockupdateStockJournal);
// router.delete('/stock-journals/:voucherNumber', stockdeleteStockJournal);

module.exports = Journal;
