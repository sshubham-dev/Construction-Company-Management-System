const Purchase = require('../models/purchase.models'); // Import the Purchase model
const User = require('../models/user.models'); // Assuming you have a User model

// Create a new purchase
const createPurchase = async (req, res) => {
  try {
    const { voucherNumber, date, supplierName, supplierAccount, items, paymentMode, narration, createdBy } = req.body;
    const newPurchase = new Purchase({
      voucherNumber,
      date,
      supplierName,
      supplierAccount,
      items,
      paymentMode,
      narration,
      // createdBy
    });
    await newPurchase.save();
    res.status(201).json({ message: 'Purchase created successfully', data: newPurchase });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error creating purchase', error: error.message });
  }
};

// Get all purchases
const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate('supplierAccount createdBy');
    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchases', error: error.message });
  }
};

// Get purchase by ID
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate('supplierAccount createdBy');
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchase', error: error.message });
  }
};

// Update purchase by ID
const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    res.status(200).json({ message: 'Purchase updated successfully', data: purchase });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error updating purchase', error: error.message });
  }
};

// Delete purchase by ID
const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    res.status(200).json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error deleting purchase', error: error.message });
  }
};

module.exports = {
  createPurchase, getAllPurchases, getPurchaseById, updatePurchase, deletePurchase
}