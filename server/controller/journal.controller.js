const { Journal, StockJournal } = require('../models/journal.models');

// Create a new journal entry
const createJournal = async (req, res) => {
    try {
        const { voucherNo, date, narration, entries, createdBy } = req.body;
        const newJournal = new Journal({
            voucherNo,
            date,
            narration,
            entries,
            createdBy
        });

        await newJournal.save();
        res.status(201).json({ message: 'Journal entry created successfully', journal: newJournal });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all journals
const getAllJournals = async (req, res) => {
    try {
        const journals = await Journal.find().populate('createdBy', 'name');
        res.status(200).json({ journals });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a specific journal by voucherNo
const getJournalByVoucherNo = async (req, res) => {
    try {
        const journal = await Journal.findOne({ voucherNo: req.params.voucherNo }).populate('createdBy', 'name');
        if (!journal) {
            return res.status(404).json({ message: 'Journal not found' });
        }
        res.status(200).json({ journal });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a journal entry
const updateJournal = async (req, res) => {
    try {
        const updatedJournal = await Journal.findOneAndUpdate(
            { voucherNo: req.params.voucherNo },
            req.body,
            { new: true }
        );
        if (!updatedJournal) {
            return res.status(404).json({ message: 'Journal not found' });
        }
        res.status(200).json({ message: 'Journal updated successfully', journal: updatedJournal });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a journal entry
const deleteJournal = async (req, res) => {
    try {
        const deletedJournal = await Journal.findOneAndDelete({ voucherNo: req.params.voucherNo });
        if (!deletedJournal) {
            return res.status(404).json({ message: 'Journal not found' });
        }
        res.status(200).json({ message: 'Journal deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Create a new stock journal entry
const createStockJournal = async (req, res) => {
    try {
        const { voucherNumber, date, items, narration, createdBy } = req.body;
        const newStockJournal = new StockJournal({
            voucherNumber,
            date,
            items,
            narration,
            createdBy
        });

        await newStockJournal.save();
        res.status(201).json({ message: 'Stock journal created successfully', stockJournal: newStockJournal });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all stock journals
const getAllStockJournals = async (req, res) => {
    try {
        const stockJournals = await StockJournal.find().populate('createdBy', 'name');
        res.status(200).json({ stockJournals });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a specific stock journal by voucherNumber
const getStockJournalByVoucherNumber = async (req, res) => {
    try {
        const stockJournal = await StockJournal.findOne({ voucherNumber: req.params.voucherNumber }).populate('createdBy', 'name');
        if (!stockJournal) {
            return res.status(404).json({ message: 'Stock journal not found' });
        }
        res.status(200).json({ stockJournal });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a stock journal entry
const updateStockJournal = async (req, res) => {
    try {
        const updatedStockJournal = await StockJournal.findOneAndUpdate(
            { voucherNumber: req.params.voucherNumber },
            req.body,
            { new: true }
        );
        if (!updatedStockJournal) {
            return res.status(404).json({ message: 'Stock journal not found' });
        }
        res.status(200).json({ message: 'Stock journal updated successfully', stockJournal: updatedStockJournal });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a stock journal entry
const deleteStockJournal = async (req, res) => {
    try {
        const deletedStockJournal = await StockJournal.findOneAndDelete({ voucherNumber: req.params.voucherNumber });
        if (!deletedStockJournal) {
            return res.status(404).json({ message: 'Stock journal not found' });
        }
        res.status(200).json({ message: 'Stock journal deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createJournal, getAllJournals, getJournalByVoucherNo, updateJournal, deleteJournal }