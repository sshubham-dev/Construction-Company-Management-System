const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    gstNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    panNo: {
      type: String,
      uppercase: true,
    },

    address: {
      street: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
    },

    phone: String,
    email: String,

    bankAccounts: [
      {
        name: String,
        number: String,
        ifsc: String,
        branch: String,
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
