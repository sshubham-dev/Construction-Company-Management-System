const { Journal } = require("../models/journal.models");
const Ledger = require("../models/ledger.models");
const {sendPushNotification, notifyRole} = require("../utils/pushNotification.js");

// Utility to update ledger transactions
const applyJournalToLedgers = async (journal, mode = "add") => {
  const multiplier = mode === "add" ? 1 : -1;

  for (const entry of journal.entries) {
    const ledger = await Ledger.findById(entry.account.id);
    if (!ledger) continue;

    if (entry.type === "Debit") {
      ledger.currentBalance += multiplier * entry.amount;
    } else {
      ledger.currentBalance -= multiplier * entry.amount;
    }

    await ledger.save();
  }
};


// 👉 Create Journal Entry
const createJournal = async (req, res) => {
  try {
    const { voucherNo, date, narration, entries, costCenter } = req.body;

    if (!entries || entries.length < 2) {
      return res.status(400).json({ error: "Minimum two entries required" });
    }

    let debit = 0;
    let credit = 0;

    for (const e of entries) {
      if (e.type === "Debit") debit += e.amount;
      if (e.type === "Credit") credit += e.amount;
    }

    if (debit !== credit) {
      return res.status(400).json({ error: "Debit and Credit must match" });
    }

    const journal = await Journal.create({
      voucherNo,
      date,
      narration,
      entries,
      totalDebit: debit,
      totalCredit: credit,
      costCenter,
      createdBy: req.user._id,
      status: "Draft",
    });

    res.status(201).json(journal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const postJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) {
      return res.status(404).json({ error: "Journal not found" });
    }

    if (journal.status !== "Draft") {
      return res.status(400).json({
        error: "Only Draft journal can be posted",
      });
    }

    await applyJournalToLedgers(journal, "add");

    journal.status = "Posted";
    await journal.save();

    res.json({ message: "Journal posted successfully", journal });
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
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ error: "Not found" });

    if (journal.status !== "Draft") {
      return res.status(400).json({
        error: "Posted or cancelled journal cannot be edited",
      });
    }

    Object.assign(journal, req.body);
    await journal.save();

    res.json({ message: "Journal updated", journal });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const cancelJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) {
      return res.status(404).json({ error: "Journal not found" });
    }

    if (journal.status !== "Posted") {
      return res.status(400).json({
        error: "Only Posted journal can be cancelled",
      });
    }

    await applyJournalToLedgers(journal, "subtract");

    journal.status = "Cancelled";
    await journal.save();

    res.json({ message: "Journal cancelled successfully", journal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 👉 Delete Journal
const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ error: "Not found" });

    if (journal.status !== "Draft") {
      return res.status(400).json({
        error: "Only Draft journal can be deleted",
      });
    }

    await journal.deleteOne();
    res.json({ message: "Journal deleted" });
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
  cancelJournal,
  postJournal,
  updateJournal,
  deleteJournal,
  getNextJournalNo
};
