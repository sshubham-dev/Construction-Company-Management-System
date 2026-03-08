const { Ledger } = require("../models/ledger.models");
const Receipt = require('../models/receipt.models');  // Adjust path as needed
const Bill = require('../models/bill.models');
const ExtraWork = require('../models/extrawork.models');
const PaymentSchedule = require('../models/paymentschedule.models');
const {sendPushNotification, notifyRole} = require("../utils/pushNotification.js");

const getReceiptWithInvoices = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).lean();
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    const invoiceDetails = await Promise.all(
      (receipt.invoice || []).map(async (inv) => {
        let details = null;

        switch (inv.invoiceType) {
          case "Bill":
            details = await Bill.findById(inv.invoiceId).lean();
            break;
          case "ExtraWork":
            details = await ExtraWork.findById(inv.invoiceId).lean();
            break;
          case "PaymentSchedule":
            details = await PaymentSchedule.findById(inv.invoiceId).lean();
            break;
          default:
            break;
        }

        return { ...inv, details };
      })
    );

    res.json({ ...receipt, invoiceDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const applyReceiptToLedgers = async (receipt, mode = "add") => {
  const multiplier = mode === "add" ? 1 : -1;
  const amount = Number(receipt.amount);

  const partyLedger = await Ledger.findById(receipt.from.id);
  const cashLedger = await Ledger.findById(receipt.to.id);

  if (!partyLedger || !cashLedger) {
    throw new Error("Ledger not found");
  }

  // Party ledger (Credit)
  partyLedger.currentBalance -= multiplier * amount;
  partyLedger.receivable = (partyLedger.receivable || 0) - multiplier * amount;

  // Cash / Bank ledger (Debit)
  cashLedger.currentBalance += multiplier * amount;
  cashLedger.received = (cashLedger.received || 0) + multiplier * amount;

  await partyLedger.save();
  await cashLedger.save();
};


// Create a new receipt
const createReceipt = async (req, res) => {
  try {
    const {
      receiptNo,
      date,
      from,
      to,
      referenceNo,
      amount,
      description,
      invoice,
      costCenter,
    } = req.body;

    const fromLedger = await Ledger.findById(from);
    const toLedger = await Ledger.findById(to);

    if (!fromLedger || !toLedger) {
      return res.status(400).json({ error: "Invalid ledger selected" });
    }

    const receipt = await Receipt.create({
      receiptNo,
      date,
      from: { id: fromLedger._id, name: fromLedger.name },
      to: { id: toLedger._id, name: toLedger.name },
      referenceNo,
      amount: Number(amount),
      description,
      invoice: invoice || [],
      costCenter,
      status: "Draft",
    });

    res.status(201).json(receipt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const postReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    if (receipt.status !== "Draft") {
      return res.status(400).json({ error: "Only Draft receipt can be posted" });
    }

    await applyReceiptToLedgers(receipt, "add");

    receipt.status = "Posted";
    await receipt.save();

    res.json({ message: "Receipt posted successfully", receipt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const cancelReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    if (receipt.status !== "Posted") {
      return res.status(400).json({ error: "Only Posted receipt can be cancelled" });
    }

    await applyReceiptToLedgers(receipt, "subtract");

    receipt.status = "Cancelled";
    await receipt.save();

    res.json({ message: "Receipt cancelled successfully", receipt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Get all receipts
const getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({createdAt: -1});
    console.log(receipts)
    res.status(200).json(receipts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching receipts', error: error.message });
  }
};

// Get a receipt by ID
const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.status(200).json(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching receipt', error: error.message });
  }
};

// Update a receipt
const updateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    if (receipt.status !== "Draft") {
      return res.status(400).json({
        message: "Only Draft receipts can be edited",
      });
    }

    const {
      receiptNo,
      date,
      from,
      to,
      amount,
      description,
      invoice,
      costCenter,
    } = req.body;

    const fromLedger = await Ledger.findById(from);
    const toLedger = await Ledger.findById(to);

    if (!fromLedger || !toLedger) {
      return res.status(400).json({ error: "Invalid ledger" });
    }

    receipt.receiptNo = receiptNo;
    receipt.date = date;
    receipt.from = { id: fromLedger._id, name: fromLedger.name };
    receipt.to = { id: toLedger._id, name: toLedger.name };
    receipt.amount = Number(amount);
    receipt.description = description;
    receipt.invoice = invoice || [];
    receipt.costCenter = costCenter;

    await receipt.save();

    res.json({ message: "Receipt updated successfully", receipt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete a receipt
const deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    if (receipt.status !== "Draft") {
      return res.status(400).json({
        message: "Only Draft receipts can be deleted",
      });
    }

    await receipt.deleteOne();
    res.json({ message: "Receipt deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const generateReceiptNo = async (req, res) => {
  try {
    const latest = await Receipt.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;
    if (latest?.receiptNo) {
      const match = latest.receiptNo.match(/\d+$/); // Extract trailing number
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    const padded = String(nextNumber).padStart(4, '0');
    const receiptNo = `RCPT-${padded}`;

    res.json({ receiptNo });
  } catch (error) {
    console.error("Error generating receipt number:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createReceipt, getAllReceipts, getReceiptById, updateReceipt, deleteReceipt, generateReceiptNo, getReceiptWithInvoices, postReceipt, cancelReceipt };