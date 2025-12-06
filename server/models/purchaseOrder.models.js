const mongoose = require("mongoose");

const poItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
    },
    item: String,
    requestedQty: Number, // from PR or store demand
    unit: String,
    rate: Number, // purchase rate
    amount: Number, // qty * rate
    deliveredQty: { type: Number, default: 0 },
    description: String,
    gstRate: Number, // from item or supplier
  },
  { timestamps: true }
);

const deliveryRecordSchema = new mongoose.Schema(
  {
    deliveryDate: { type: Date, default: Date.now },

    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
        quantity: Number,
        unit: String,
        remarks: String,
      },
    ],

    attachments: [
      {
        url: String,
        fileType: String, // pdf / image
      },
    ],

    remarks: String,
  },
  { timestamps: true }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    // ----------------------------
    // PO Details
    // ----------------------------
    poNumber: { type: String, unique: true, trim: true },
    poDate: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ----------------------------
    // Linked Purchase Request (Optional)
    // ----------------------------
    purchaseRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase_Request",
    },

    // ----------------------------
    // Supplier Details
    // ----------------------------
    supplier: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
      },
      name: String,
      phone: String,
    },

    // ----------------------------
    // Delivery Location
    // ----------------------------
    deliveryTo: {
      type: String,
      enum: ["Store", "Site"],
      required: true,
    },

    deliveryFor: {
      id: { type: mongoose.Schema.Types.ObjectId, refPath: "deliveryTo" },
      name: String,
      contactPerson: String,
      phone: String,
    },

    // ----------------------------
    // Items
    // ----------------------------
    items: [poItemSchema],

    // ----------------------------
    // Approval Workflow
    // ----------------------------
    supplierApproval: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },

    adminApproval: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    accountHeadApproval: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    finalApprovalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // ----------------------------
    // Financials
    // ----------------------------
    totalBeforeTax: Number,
    totalTaxAmount: Number,
    totalAfterTax: Number,

    totalPaid: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },

    // ----------------------------
    // Delivery / GRN
    // ----------------------------
    deliveryRecords: [deliveryRecordSchema],

    deliveryStatus: {
      type: String,
      enum: ["Pending", "Partially Delivered", "Delivered"],
      default: "Pending",
    },

    // ----------------------------
    // Billing
    // ----------------------------
    bills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalesInvoice",
      },
    ],

    // ----------------------------
    // Payment Mode (Ledger)
    // ----------------------------
    paymentLedger: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" },
      name: String,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partially Paid", "Paid"],
      default: "Pending",
    },

    // ----------------------------
    // Returns
    // ----------------------------
    purchaseReturns: [
      {
        purchaseReturnId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Purchase_Return",
        },
      },
    ],

    // ----------------------------
    // Notes
    // ----------------------------
    remarks: String,
  },
  { timestamps: true }
);

purchaseOrderSchema.pre("save", function (next) {
  const items = this.requirement;
  function total(amount, value) {
    return amount + value;
  }
  const TotalAmount = items.map((item) => {
    return item.amount;
  });
  const TotalPaid = items.map((item) => {
    return item.paid;
  });
  console.log("TotalOrder:", TotalAmount);
  this.totalValue = TotalAmount.reduce(total);
  this.totalPaid = TotalPaid.reduce(total);
  console.log("totalValue:", this.totalValue);

  const amount = parseFloat(this.totalValue) || 0;
  const paidAmount = parseFloat(this.totalPaid) || 0;
  console.log("TotalOrder:", amount);
  console.log("TotalpaidOrder:", paidAmount);
  const payment = amount - paidAmount;

  if (!isNaN(payment) && isFinite(payment)) {
    this.totalDue = Math.max(0, payment.toFixed(2));
  } else {
    this.totalDue = null;
  }
  next();
});

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
module.exports = PurchaseOrder;
