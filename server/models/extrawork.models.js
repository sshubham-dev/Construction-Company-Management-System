const mongoose = require("mongoose");

const workSchema = new mongoose.Schema({
  work: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
  },
  rate: {
    type: Number,
  },
  area: {
    type: Number,
  },
  amount: {
    type: String,
  },
  paid: {
    type: String,
  },
  due: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "Pending",
  },
  detail: String,
  bill: [
    {
      billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
      paid: Number,
    },
  ],
});

const extraWorkSchema = new mongoose.Schema(
  {
    extraFor: {
      type: String,
      default: null,
      enum: ["Client", "Contractor"],
    },
    site: {
      name: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site",
      },
    },
    client: {
      name: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
    },
    contractor: {
      name: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contractor",
      },
    },
    WorkDetail: [workSchema],
    totalAmount: {
      type: String,
    },
    paid: {
      type: String,
    },
    due: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentStatus: {
      type: String,
      default: "Pending",
    },
    clientApprove: {
      type: String,
      default: "Pending",
    },
    adminApprove: {
      type: String,
      default: "Pending",
    },
    contractorApprove: {
      type: String,
      default: "Pending",
    },
    accountheadApprove: {
      type: String,
      default: "Pending",
    },
    approvalStatus: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

extraWorkSchema.pre("save", function (next) {
  const doc = this;

  let totalAmount = 0;
  let totalPaid = 0;

  // Loop through each work item
  doc.WorkDetail = doc.WorkDetail.map((w) => {
    const qty = Number(w.area) || 0;
    const rate = Number(w.rate) || 0;

    // amount calculation
    const amount = qty * rate;

    // ensure numeric fields
    w.amount = amount;
    w.paid = Number(w.paid) || 0;

    // sum payments from bill array
    const billPaid = Array.isArray(w.bill)
      ? w.bill.reduce((s, b) => s + (Number(b.paid) || 0), 0)
      : 0;

    const totalWorkPaid = w.paid + billPaid;

    // update work due
    w.due = amount - totalWorkPaid;

    // update totalPaid and totalAmount
    totalAmount += amount;
    totalPaid += totalWorkPaid;

    // update work status
    if (totalWorkPaid <= 0) {
      w.status = "Pending";
    } else if (totalWorkPaid < amount) {
      w.status = "Partial";
    } else {
      w.status = "Completed";
    }

    return w;
  });

  // Assign totals to document
  doc.totalAmount = totalAmount;
  doc.paid = totalPaid;
  doc.due = totalAmount - totalPaid;

  // update paymentStatus based on due
  if (doc.paid <= 0) {
    doc.paymentStatus = "Pending";
  } else if (doc.paid < doc.totalAmount) {
    doc.paymentStatus = "Partial";
  } else {
    doc.paymentStatus = "Completed";
  }

  next();
});


const ExtraWork = mongoose.model("Extra_Work", extraWorkSchema);
module.exports = ExtraWork;
