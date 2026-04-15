const mongoose = require("mongoose");
const { syncLedger } = require("../utils/ledgerSync");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, lowercase: true, trim: true },

    phone: { type: Number, required: true },

    whatsapp: { type: Number },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      // required: true,
      index: true,
    },

    address: {
      street: String,
      city: String,
      district: String,
      state: String,
    },
    service: String, // design, approval, interior, construction, all-service

    site: {
      name: String,
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
    },

    gstNo: { type: String },

    isUser: Boolean,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      default: null,
    },

    extraWork: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Extra_Work",
      },
    ],

    agreement: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Agreement" },
      totalValue: Number, // FIXED Contract Value — not used for payable
    },

    ledger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
    },

    receipts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Receipt",
      },
    ],

    totalBilled: { type: Number, default: 0 }, // Sum of PO invoice amounts
    totalPaid: { type: Number, default: 0 }, // From payment vouchers
    totalDue: { type: Number, default: 0 }, // Auto: billed - paid - returns

    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Blacklisted"],
    },
  },
  { timestamps: true },
);

// ============================================================
// 🔄 FUNCTION: Recalculate Client Finance
// Called internally before save and before findOneAndUpdate
// ============================================================
async function recalcFinance(client) {
  // client.totalDue =
  //   (client.financials.scheduleValue || 0) +
  //   (client.financials.extraWorkValue || 0);

  client.totalDue = client.totalBilled - (client.totalPaid || 0);
}

// ============================================================
// 🔄 PRE-SAVE MIDDLEWARE
// ============================================================
clientSchema.pre("save", async function () {
  try {
    await recalcFinance(this);

    const ledgerId = await syncLedger({
      doc: this,
      category: `Client`,

      getAddress: (doc) => ({
        name: doc.name,
        phoneNo: doc.phone,
        email: doc.email,
        address: [doc.address?.street, doc.address?.city, doc.address?.district]
          .filter(Boolean)
          .join(", "),
        state: doc.address?.state || "",
      }),

      getTaxDetails: (doc) => ({
        gstNo: doc.gstNo || "",
      }),
    });

    if (ledgerId) this.ledger = ledgerId;
  } catch (err) {
    console.error("Error in client pre-save:", err);
    return err;
  }
});

// ============================================================
// 🔄 PRE FIND-AND-UPDATE MIDDLEWARE
// ============================================================
clientSchema.pre("findOneAndUpdate", async function () {
  try {
    const client = await this.model.findOne(this.getQuery());
    if (!client) return;

    const update = this.getUpdate() || {};

    // ✅ Apply only $set
    if (update.$set) {
      Object.assign(client, update.$set);
    }

    // ❌ REMOVE THIS
    // Object.assign(client, update);

    await recalcFinance(client);

    // ✅ FIX: use client, not this
    const ledgerId = await syncLedger({
      doc: client,
      category: "Client",

      getAddress: (doc) => ({
        name: doc.name,
        phoneNo: doc.phone,
        email: doc.email,
        address: [doc.address?.street, doc.address?.city, doc.address?.district]
          .filter(Boolean)
          .join(", "),
        state: doc.address?.state || "",
      }),

      getTaxDetails: (doc) => ({
        gstNo: doc.gstNo || "",
      }),
    });

    if (!update.$set) update.$set = {};

    if (ledgerId) update.$set.ledger = ledgerId;

    update.$set["financials.totalPayable"] = client.financials.totalPayable;
    update.$set["financials.totalDue"] = client.financials.totalDue;

    this.setUpdate(update);
  } catch (err) {
    console.error("Error in client pre-findOneAndUpdate:", err);
  }
});

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
