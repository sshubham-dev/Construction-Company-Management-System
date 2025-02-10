const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const stockJournalController = require('../controllers/stockJournalController');

// Journal Routes
router.post('/journals', journalController.createJournal);
router.get('/journals', journalController.getAllJournals);
router.get('/journals/:voucherNo', journalController.getJournalByVoucherNo);
router.put('/journals/:voucherNo', journalController.updateJournal);
router.delete('/journals/:voucherNo', journalController.deleteJournal);

// Stock Journal Routes
router.post('/stock-journals', stockJournalController.createStockJournal);
router.get('/stock-journals', stockJournalController.getAllStockJournals);
router.get('/stock-journals/:voucherNumber', stockJournalController.getStockJournalByVoucherNumber);
router.put('/stock-journals/:voucherNumber', stockJournalController.updateStockJournal);
router.delete('/stock-journals/:voucherNumber', stockJournalController.deleteStockJournal);

module.exports = router;
