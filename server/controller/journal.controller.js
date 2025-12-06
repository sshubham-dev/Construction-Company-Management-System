const { Journal } = require("../models/journal.models");
const Ledger = require("../models/ledger.models");
const { sendNotification } = require("./notification.controller.js");

// Utility to update ledger transactions
const updateLedgerBalances = async (entries, mode = "add") => {
  for (const entry of entries) {
    const ledger = await Ledger.findById(entry.account.id);
    if (!ledger) continue;

    const amount = parseFloat(entry.debit || entry.credit || 0);

    if (entry.debit) {
      ledger.receivable = (ledger.receivable || 0) + (mode === "add" ? amount : -amount);
    } else if (entry.credit) {
      ledger.payable = (ledger.payable || 0) + (mode === "add" ? amount : -amount);
    }

    ledger.transaction.push({
      id: entry._id,
      type: "Journal",
      amount: amount,
    });

    await ledger.save();
  }
};

// 👉 Create Journal Entry
const createJournal = async (req, res) => {
  try {
    const { voucherNo, date, narration, entries, createdBy } = req.body;

    // Auto sum debit/credit
    const totalDebit = entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);

    if (totalDebit !== totalCredit) {
      return res.status(400).json({ error: "Debit and Credit amounts must be equal." });
    }

    const journal = new Journal({
      voucherNo,
      date,
      narration,
      entries,
      totalDebit,
      totalCredit,
      createdBy,
    });

    await journal.save();
    await updateLedgerBalances(entries, "add");

    res.status(201).json(journal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Get All Journal Entries
const getJournals = async (req, res) => {
  try {
    const journals = await Journal.find().sort({ date: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Get Journal by ID
const getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ error: "Journal not found." });
    res.json(journal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Update Journal Entry
const updateJournal = async (req, res) => {
  try {
    const existing = await Journal.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Journal not found." });

    // Revert previous balances
    await updateLedgerBalances(existing.entries, "subtract");

    const { voucherNo, date, narration, entries, createdBy } = req.body;

    const totalDebit = entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);

    if (totalDebit !== totalCredit) {
      return res.status(400).json({ error: "Debit and Credit must match." });
    }

    existing.voucherNo = voucherNo;
    existing.date = date;
    existing.narration = narration;
    existing.entries = entries;
    existing.totalDebit = totalDebit;
    existing.totalCredit = totalCredit;
    existing.createdBy = createdBy;

    await existing.save();
    await updateLedgerBalances(entries, "add");

    res.json(existing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Delete Journal
const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ error: "Journal not found." });

    await updateLedgerBalances(journal.entries, "subtract");
    await journal.deleteOne();

    res.json({ message: "Journal deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNextJournalNo = async (req, res) => {
  try {
    const latest = await Journal.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;

    if (latest && latest.voucherNo) {
      const match = latest.voucherNo.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    const padded = nextNumber.toString().padStart(4, '0');
    const nextVoucherNo = `JRNL-${padded}`;

    res.json({ voucherNo: nextVoucherNo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
  getNextJournalNo
};
