const mongoose = require("mongoose");
const { syncLedger } = require("../utils/ledgerSync");

const siteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    client: {
      name: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
    },

    siteId: {
      type: String,
      unique: true,
    },

    projectType: {
      type: String,
      default: "Residential",
      index: true,
    },

    structureType: String,
    floors: [
      {
        name: String,
        area: Number,
        unit: String,
        dim: { l: Number, w: Number, h: Number },
      },
    ],

    address: {
      type: String,
    },

    incharge: {
      name: String,
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    qualityEngineer: {
      name: String,
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    supervisor: {
      name: String,
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    status: {
      type: String,
      enum: ["Ongoing", "Completed", "On Hold", "Cancelled"],
      default: "Ongoing",
    },

    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
    },

    // Ledger (ERP Link)
    ledger: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" },

    // Project contractual data
    agreement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agreement",
    },

    // ERP Linked Modules
    checklist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Checklist" }],
    bill: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bill" }],
    workOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: "Work_Order" }],
    purchaseOrder: [
      { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder" },
    ],
    purchaseRequest: [
      { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseRequest" },
    ],
    paymentSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment_Schedule",
    },
    qualitySchedule: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Quality_Schedule" },
    ],
    projectSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project_Schedule",
    },
    extraWork: [{ type: mongoose.Schema.Types.ObjectId, ref: "Extra_Work" }],
    contractor: [
      {
        name: String,
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Contractor" },
      },
    ],

    // ===============================
    // FINANCIAL TRACKING STRUCTURE
    // ===============================

    // Detailed income from clients, banks, outside work etc.
    incomeBreakdown: [
      {
        source: String,
        amount: Number,
        date: Date,
        receiptId: { type: mongoose.Schema.Types.ObjectId, ref: "Receipt" },
        remarks: String,
      },
    ],

    // Detailed material usage + cost
    materialExpenses: [
      {
        category: String,
        item: String,
        quantity: Number,
        unit: String,
        rate: Number,
        amount: Number,
        supplier: {
          name: String,
          id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
        },
        date: Date,
        remarks: String,
      },
    ],

    // Labour payment tracking
    labourPayments: [
      {
        category: String,
        labourName: String,
        amount: Number,
        date: Date,
        contractor: {
          name: String,
          id: { type: mongoose.Schema.Types.ObjectId, ref: "Contractor" },
        },
        remarks: String,
      },
    ],

    // Automatic distribution of profit after income update
    profitDistribution: {
      totalProfit: Number,
      forMarketing: Number,
      forTax: Number,
      forOffice: Number,
      forSalary: Number,
      forInvestment: Number,
      others: Number,
    },

    // Site-level accounting metrics updated by accounting engine
    accountSummary: {
      totalIncome: { type: Number, default: 0 },
      totalExpenses: { type: Number, default: 0 },
      materialCost: { type: Number, default: 0 },
      labourCost: { type: Number, default: 0 },
      salary: { type: Number, default: 0 },
      office: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      investment: { type: Number, default: 0 },
      marketing: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
      profit: { type: Number, default: 0 },
    },

    // High level summary for dashboards
    totalReceived: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ===============================
// AUTO SITE ID + LEDGER MANAGEMENT
// ===============================

// Auto-generate siteId
siteSchema.pre("save", async function (next) {
  try {
    if (!this.siteId) {
      const cleaned = this.name
        .trim()
        .split(" ")[0]
        .replace(/[^a-zA-Z0-9]/g, "");
      const prefix = cleaned.substring(0, 3).toUpperCase();
      const regex = new RegExp(`^${prefix}-\\d{3}$`, "i");
      const existingCount = await mongoose
        .model("Site")
        .countDocuments({ siteId: regex });

      const suffix = String(existingCount + 1).padStart(3, "0");
      this.siteId = `${prefix}-${suffix}`;
    }

    const ledgerId = await syncLedger({
      doc: this,
      type: "Site",
      under: "Project Accounts",
      getAddress: (doc) => ({
        name: doc.name,
        address: doc.address || "",
      }),
      getTaxDetails: () => ({}),
    });

    if (ledgerId) this.ledger = ledgerId;

    next();
  } catch (err) {
    console.error("Error in site ledger sync:", err);
    next(err);
  }
});

// Ledger update on site update
siteSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const site = await this.model.findOne(this.getQuery());
    if (!site) return next();

    const update = this.getUpdate() || {};

    if (update.$set) Object.assign(site, update.$set);
    Object.assign(site, update);

    const ledgerId = await syncLedger({
      doc: site,
      type: "Site",
      under: "Project Accounts",
      getAddress: (doc) => ({
        name: doc.name,
        address: doc.address || "",
      }),
      getTaxDetails: () => ({}),
    });

    if (!update.$set) update.$set = {};
    update.$set.ledger = ledgerId;
    this.setUpdate(update);

    next();
  } catch (err) {
    console.error("Error updating site ledger sync:", err);
    next(err);
  }
});

const Site = mongoose.model("Site", siteSchema);
module.exports = Site;
