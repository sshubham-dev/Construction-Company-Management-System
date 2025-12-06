const mongoose = require("mongoose");
const { syncLedger } = require("../utils/ledgerSync");

const contractorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, unique: true, lowercase: true, trim: true },

    phone: { type: Number, required: true },

    whatsapp: { type: Number },

    address: { type: String },

    addhar: { type: String },

    panNo: { type: String },

    bank: { type: String },

    jobWork: { type: String },

    gstNo: { type: String },

    isUser: Boolean,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Blacklisted"],
      default: "Active",
    },

    adminApprove: {
      type: String,
      default: "Pending",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
    },

    checklist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Checklist",
      },
    ],

    extraWork: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Extra_Work",
      },
    ],

    bill: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill",
      },
    ],

    site: [
      {
        name: String,
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
      },
    ],

    workOrder: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Work_Order",
      },
    ],

    ledger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
    },

    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],

    // ----------------------------
    // PROJECT-WISE TRACKING
    // ----------------------------
    projects: [
      {
        site: {
          name: String,
          id: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
        },
        workOrderValue: Number,
        billsGenerated: Number,
        paid: Number,
        due: Number,
      },
    ],

    totalBilled: { type: Number, default: 0 }, // Sum of PO invoice amounts
    totalPaid: { type: Number, default: 0 }, // From payment vouchers
    totalDue: { type: Number, default: 0 }, // Auto: billed - paid - returns
  },
  { timestamps: true }
);

// ============================================================
// 📌 CALCULATE CONTRACTOR FINANCES
// ============================================================
async function recalcContractorFinance(contractor) {
  if (!contractor) return;

  contractor.totalBilled = contractor.totalBilled || 0;
  contractor.totalPaid = contractor.totalPaid || 0;

  contractor.totalDue =
    contractor.totalBilled - contractor.totalPaid;

  if (contractor.totalDue < 0) contractor.totalDue = 0; // safety
}


// ============================================================
// 🔄 PRE-SAVE MIDDLEWARE
// ============================================================
contractorSchema.pre("save", async function (next) {
  try {
    await recalcContractorFinance(this);

    const ledgerId = await syncLedger({
      doc: this,
      type: "Contractor",
      under: "Sundry Creditors",
      getAddress: (doc) => ({
        name: doc.name,
        address: doc.address || "",
      }),
      getTaxDetails: (doc) => ({
        gstNo: doc.gstNo || "",
        panNo: doc.panNo || "",
      }),
    });

    if (ledgerId) this.ledger = ledgerId;

    next();
  } catch (err) {
    console.error("Error in contractor pre-save:", err);
    next(err);
  }
});

// ============================================================
// 🔄 PRE UPDATE MIDDLEWARE
// ============================================================
contractorSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const contractor = await this.model.findOne(this.getQuery());
    if (!contractor) return next();

    const update = this.getUpdate() || {};

    // Merge updates into contractor document
    if (update.$set) {
      Object.assign(contractor, update.$set);
    }
    Object.assign(contractor, update);

    // Recalculate finance totals
    await recalcContractorFinance(contractor);

    // Sync ledger
    const ledgerId = await syncLedger({
      doc: contractor,
      type: "Contractor",
      under: "Sundry Creditors",
      getAddress: (doc) => ({
        name: doc.name,
        address: doc.address || "",
      }),
      getTaxDetails: (doc) => ({
        gstNo: doc.gstNo || "",
        panNo: doc.panNo || "",
      }),
    });

    if (!update.$set) update.$set = {};

    update.$set.ledger = ledgerId;

    // FIXED: remove optional chaining
    update.$set.totalDue = contractor.totalDue || 0;

    this.setUpdate(update);
    next();
  } catch (err) {
    console.error("Error updating contractor:", err);
    next(err);
  }
});

const Contractor = mongoose.model("Contractor", contractorSchema);
module.exports = Contractor;
