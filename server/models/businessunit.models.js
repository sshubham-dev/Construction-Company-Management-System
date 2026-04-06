const mongoose = require("mongoose");

const businessUnitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    code: { type: String, unique: true, trim: true },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    address: {
      city: String,
      district: String,
    },

    phone: String,
    email: String,

    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

businessUnitSchema.pre("save", async function () {
  try {
    if (!this.isNew || this.code) return;

    const count = await mongoose.model("BusinessUnit").countDocuments();

    const cityCode = this.address?.city?.substring(0, 3).toUpperCase() || "GEN";

    const sequence = String(count + 1).padStart(3, "0");

    this.code = `BU-${cityCode}-${sequence}`;
  } catch (err) {
    return err;
  }
});

const BusinessUnit =
  mongoose.models.BusinessUnit ||
  mongoose.model("BusinessUnit", businessUnitSchema);

module.exports = BusinessUnit;
