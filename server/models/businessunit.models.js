const mongoose = require("mongoose");

const businessUnitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    code: { type: String, unique: true, trim: true },

    address: {
      street: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
    },

    geo: { lat: Number, lng: Number },

    phone: String,
    email: String,

    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    gstNo: String,
    panNo: String,

    ledgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
    },

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
  { timestamps: true }
);


businessUnitSchema.pre("save", async function (next) {
  try {
    if (!this.isNew || this.code) return next();

    const count = await mongoose.model("BusinessUnit").countDocuments();

    const cityCode =
      this.address?.city?.substring(0, 3).toUpperCase() || "GEN";

    const sequence = String(count + 1).padStart(3, "0");

    this.code = `BU-${cityCode}-${sequence}`;

    next();
  } catch (err) {
    next(err);
  }
});


const BusinessUnit =
  mongoose.models.BusinessUnit ||
  mongoose.model("BusinessUnit", businessUnitSchema);
  
module.exports = BusinessUnit;
