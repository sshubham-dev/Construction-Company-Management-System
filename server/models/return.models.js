const mongoose = require("mongoose");

const returnableSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
  },
  receivedQuantity: {
    type: Number,
  },
  unit: {
    type: String,
  },
  remarks: String,
  rate: {
    type: Number,
  },
  amount: {
    type: Number,
  },
});

const returnSchema = new mongoose.Schema(
  {
    site: {
      name: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site",
      },
    },
    salesInvoice: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalesInvoice",
        required: true,
      },
      invoiceNo: String,
    },
    materialType: {
      type: String,
      required: true,
      enum: ["New", "Used", "Scrap"],
    },
    date: Date,
    returnDate: Date,
    returnable: [returnableSchema],
    status: [
      {
        name: String,
        date: Date,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Return = mongoose.model("Return", returnSchema);
module.exports = Return;
