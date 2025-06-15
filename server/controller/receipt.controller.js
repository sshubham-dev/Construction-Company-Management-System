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

// Create a new receipt
const createReceipt = async (req, res) => {
  try {
    const { receiptNo, date, from, to, receiptDetails, amount, description } = req.body;

    const existingFrom = await Ledger.findById(from);
    const existingTo = await Ledger.findById(to);

    const newReceipt = new Receipt({
      receiptNo,
      date,
      from:{
        name: existingFrom.name,
        id: existingFrom._id,
        // type: existingFrom?.refrenceType,
      },
      to:{
        name: existingTo.name,
        id: existingTo._id,
      },
      receiptDetails,
      amount,
      description,
    });

    await newReceipt.save();
    res.status(201).json({ message: 'Receipt created successfully', receipt: newReceipt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating receipt', error: error.message });
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

module.exports = { createReceipt, getAllReceipts, getReceiptById, updateReceipt, deleteReceipt }