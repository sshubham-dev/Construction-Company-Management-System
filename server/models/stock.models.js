const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({}, { timestamps: true });

const Stock = mongoose.model('Stock', stockSchema);
module.exports = Stock;