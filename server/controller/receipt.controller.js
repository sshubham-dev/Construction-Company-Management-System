// const receipt = await Receipt.findById(receiptId);
// if (receipt.invoice.type === 'Invoice') {
//   const invoice = await Invoice.findById(receipt.invoice.id);
//   // Do something with the Invoice
// } else if (receipt.invoice.type === 'Bill') {
//   const bill = await Bill.findById(receipt.invoice.id);
//   // Do something with the Bill
// }


const Receipt = require('../models/Receipt');  // Adjust path as needed

// Create a new receipt
exports.createReceipt = async (req, res) => {
  try {
    const { receiptNo, date, from, to, receiptDetails, amount, description, invoice } = req.body;
    
    const newReceipt = new Receipt({
      receiptNo,
      date,
      from,
      to,
      receiptDetails,
      amount,
      description,
      invoice
    });
    
    await newReceipt.save();
    res.status(201).json({ message: 'Receipt created successfully', receipt: newReceipt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating receipt', error: error.message });
  }
};

// Get all receipts
exports.getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find();
    res.status(200).json(receipts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching receipts', error: error.message });
  }
};

// Get a receipt by ID
exports.getReceiptById = async (req, res) => {
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
exports.updateReceipt = async (req, res) => {
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
exports.deleteReceipt = async (req, res) => {
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
