const express = require('express');
const Journal = express.Router();
const journalController = require('../controller/journal.controller');
const { createJournal, getJournals, getJournalByVoucherNo, updateJournal, deleteJournal, getNextJournalNo } = require('../controller/journal.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Journal Routes
Journal.post('/', createJournal);
Journal.get('/', getJournals);
// Journal.get('/:voucherNo', getJournalByVoucherNo);
Journal.put('/:voucherNo', updateJournal);
Journal.delete('/:voucherNo', deleteJournal);
Journal.get("/next-voucher", getNextJournalNo);
// Stock Journal Routes
// router.post('/stock-journals', stockcreateStockJournal);
// router.get('/stock-journals', stockgetAllStockJournals);
// router.get('/stock-journals/:voucherNumber', stockgetStockJournalByVoucherNumber);
// router.put('/stock-journals/:voucherNumber', stockupdateStockJournal);
// router.delete('/stock-journals/:voucherNumber', stockdeleteStockJournal);

module.exports = Journal;
