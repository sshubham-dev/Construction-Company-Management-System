// const receipt = await Receipt.findById(receiptId);
// if (receipt.invoice.type === 'Invoice') {
//   const invoice = await Invoice.findById(receipt.invoice.id);
//   // Do something with the Invoice
// } else if (receipt.invoice.type === 'Bill') {
//   const bill = await Bill.findById(receipt.invoice.id);
//   // Do something with the Bill
// }

const { Ledger } = require("../models/ledger.models");
const Receipt = require('../models/receipt.models');  // Adjust path as needed
const Bill = require('../models/bill.models');
const ExtraWork = require('../models/extrawork.models');
const PaymentSchedule = require('../models/paymentschedule.models');
// Add others as needed

const getReceiptWithInvoices = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

    // Resolve invoice references manually
    const populatedInvoices = await Promise.all(receipt.invoice.map(async (inv) => {
      let data = null;
      switch (inv.type) {
        case 'Bill':
          data = await Bill.findById(inv.id);
          break;
        case 'Extra_Work':
          data = await ExtraWork.findById(inv.id);
          break;
        case 'Payment_Schedule':
          data = await PaymentSchedule.findById(inv.id);
          break;
        // Add Invoice, Return_Order, etc.
        default:
          break;
      }

      return {
        ...inv.toObject?.() || inv,
        details: data || null
      };
    }));

    res.json({ ...receipt.toObject(), invoiceDetails: populatedInvoices });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateLedgersAndModels = async (receipt, mode = "add") => {
  const multiplier = mode === "add" ? 1 : -1;
  const amount = parseFloat(receipt.amount);

  const fromLedger = await Ledger.findById(receipt.from.id);
  const toLedger = await Ledger.findById(receipt.to.id);

  if (fromLedger) {
    fromLedger.receivable = (fromLedger.receivable || 0) + multiplier * amount;
    fromLedger.received = (fromLedger.received || 0) + multiplier * amount;
    fromLedger.currentBalance = (fromLedger.currentBalance || 0) + multiplier * amount;
    fromLedger.transaction.push({ id: receipt._id, type: "Receipt", amount });
    await fromLedger.save();
  }

  if (toLedger) {
    toLedger.received = (toLedger.received || 0) + multiplier * amount;
    toLedger.currentBalance = (toLedger.currentBalance || 0) + multiplier * amount;
    toLedger.transaction.push({ id: receipt._id, type: "Receipt", amount });
    await toLedger.save();
  }

  // Update related models (PaymentSchedule, Client, Site)
  if (receipt.invoice?.length > 0) {
    for (const inv of receipt.invoice) {
      if (inv.type === "Payment_Schedule") {
        const schedule = await PaymentSchedule.findById(inv.id);
        if (schedule) {
          const amountPaid = schedule.amountPaid || 0;
          schedule.amountPaid = amountPaid + multiplier * amount;
          schedule.amountdue = Math.max(0, (schedule.totalValue || 0) - schedule.amountPaid);
          await schedule.save();
        }
      }
    }
  }
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
      invoiceType,
      invoice,
    } = req.body;

    // Create receipt document
    const receipt = new Receipt({
      receiptNo,
      date,
      from: { id: from, name: (await Ledger.findById(from))?.name },
      to: { id: to, name: (await Ledger.findById(to))?.name },
      referenceNo,
      amount,
      description,
      invoiceType,
      invoice,
    });

    await receipt.save();

    // Update ledger balances
    await updateLedgersAndModels(receipt, "add");

    res.status(201).json(receipt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all receipts
const getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find();
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
    const { receiptNo, date, from, to, receiptDetails, amount, description, invoice } = req.body;

    const updatedReceipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      {
        receiptNo,
        date,
        from,
        to,
        receiptDetails,
        amount,
        description,
        invoice
      },
      { new: true } // Return updated document
    );

    if (!updatedReceipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.status(200).json({ message: 'Receipt updated successfully', receipt: updatedReceipt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating receipt', error: error.message });
  }
};

// Delete a receipt
const deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.status(200).json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting receipt', error: error.message });
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

module.exports = { createReceipt, getAllReceipts, getReceiptById, updateReceipt, deleteReceipt, generateReceiptNo }