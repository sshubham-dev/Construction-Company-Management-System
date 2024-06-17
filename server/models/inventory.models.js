const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;