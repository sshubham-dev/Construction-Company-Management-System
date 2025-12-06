const mongoose = require("mongoose");

const workDetailSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Unique globally; adjust if needed
    index: true,
  },
  description: [
    {
      work: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
});

const WorkDetails = mongoose.model("Work_Detail", workDetailSchema);

module.exports = WorkDetails;
