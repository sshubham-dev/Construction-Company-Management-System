const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  voucherNumber: { type: String, required: true, unique: true }, // Unique identifier for the purchase voucher
  date: { type: Date, required: true }, // Purchase date
  supplierName: { type: String, required: true }, // Name of the supplier/vendor
  supplierAccount: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AccountMaster', 
    required: true 
  }, // Supplier's account reference
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemMaster', required: true }, // Reference to the ItemMaster model
    description: { type: String }, // Optional item description
    quantity: { type: Number, required: true }, // Quantity purchased
    rate: { type: Number, required: true }, // Unit price of the item
    amount: { type: Number, required: true }, // Total amount (quantity * rate)
    tax: { type: Number, default: 0 }, // Applicable tax on the item
  }],
  totalAmount: { type: Number, required: true }, // Total amount for all items
  taxAmount: { type: Number, required: true }, // Total tax amount
  grandTotal: { type: Number, required: true }, // Total payable (totalAmount + taxAmount)
  paymentMode: { type: String, enum: ['Cash', 'Bank', 'Credit'], required: true }, // Payment mode
  narration: { type: String }, // Optional remarks
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who created the voucher
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

purchaseSchema.pre('save', function () {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
    this.taxAmount = this.items.reduce((sum, item) => sum + item.tax, 0);
    this.grandTotal = this.totalAmount + this.taxAmount;
  });
  

const Purchase = mongoose.model('Purchase', purchaseSchema);
module.exports = Purchase;
