const mongoose = require('mongoose');

const workDetailSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true,  // Unique globally; adjust if needed
    index: true,
  },
  description: [{
    work: {
      type: String,
      required: true,
      trim: true,
      unique: true,  // Unique within the array; adjust if needed
    },
  }],
});

const WorkDetails = mongoose.model('Work_Detail', workDetailSchema);

module.exports = WorkDetails;
