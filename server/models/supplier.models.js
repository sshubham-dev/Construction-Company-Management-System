const mongoose = require("mongoose");
const { syncLedger } = require("../utils/ledgerSync");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: Number,
      required: true,
    },

    whatsapp: {
      type: Number,
    },

    address: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    gstNo: {
      type: String,
      trim: true,
    },

    bank: {
      holder: String,
      name: String,
      ac: String,
      ifsc: String,
      branch: String,
    },

    jobWork: {
      type: String,
    },

    adminApprove: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isUser: {
      type: Boolean,
      default: false,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    // ================================
    // FINANCE RELATIONS
    // ================================

    purchaseOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PurchaseOrder",
      },
    ],

    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],

    materialReturns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier_Return",
      },
    ],

    ledger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
    },

    // ===================================
    // AUTO CALCULATED FINANCE TOTALS
    // ===================================

    totalBilled: { type: Number, default: 0 }, // Sum of PO invoice amounts
    totalPaid: { type: Number, default: 0 }, // From payment vouchers
    totalReturns: { type: Number, default: 0 }, // Sum of credit notes
    totalDue: { type: Number, default: 0 }, // Auto: billed - paid - returns

    status: {
      type: String,
      enum: ["Active", "Inactive", "Blacklisted"],
      default: "Active",
    },
  },
  { timestamps: true },
);

// ======================================================
// PRE-SAVE: CREATE/UPDATE LEDGER + UPDATE PAYABLE AMOUNTS
// ======================================================
supplierSchema.pre("save", async function () {
  try {
    const payable =
      (this.totalBilled || 0) -
      (this.totalPaid || 0) -
      (this.totalReturns || 0);

    this.totalDue = payable < 0 ? 0 : payable;

    const ledgerId = await syncLedger({
      doc: this,
      category: "Supplier",
      getAddress: (doc) => ({
        name: doc.name,
        address: doc.address || "",
        email: doc.email || "",
        phone: doc.phone || "",
        state: doc?.state,
      }),
      getTaxDetails: (doc) => ({
        gstNo: doc.gstNo || "",
      }),
    });

    if (ledgerId) this.ledger = ledgerId;
  } catch (err) {
    console.error("Error in supplier ledger sync:", err);
    return err;
  }
});

// =====================================================================
// PRE-UPDATE: RECALCULATE totalDue + UPDATE LEDGER ON EVERY MODIFICATION
// =====================================================================
supplierSchema.pre("findOneAndUpdate", async function () {
  try {
    const supplier = await this.model.findOne(this.getQuery());
    if (!supplier) return;

    const update = this.getUpdate() || {};

    const merged = supplier.toObject();

    // ✅ safe merge
    if (update.$set) {
      Object.assign(merged, update.$set);
    } else {
      Object.assign(merged, update);
    }

    // ✅ recalc payable
    const payable =
      (merged.totalBilled || 0) -
      (merged.totalPaid || 0) -
      (merged.totalReturns || 0);

    if (!update.$set) update.$set = {};
    update.$set.totalDue = payable < 0 ? 0 : payable;

    // ✅ ledger sync (safe now)
    const ledgerId = await syncLedger({
      doc: merged,
      category: "Supplier",
      getAddress: (doc) => ({
        name: doc.name,
        email: doc.email || "",
        phone: doc.phone || "",
        address: doc.address || "",
      }),
      getTaxDetails: (doc) => ({
        gstNo: doc.gstNo || "",
      }),
    });

    if (ledgerId) update.$set.ledger = ledgerId;

    this.setUpdate(update);
  } catch (err) {
    console.error("Error updating supplier ledger sync:", err);
    throw err;
  }
});

const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;
