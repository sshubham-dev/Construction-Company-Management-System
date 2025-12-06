const mongoose = require("mongoose");

const workStageSchema = new mongoose.Schema(
  {
    id: { type: String }, 
    name: { type: String, required: true },
    percentage: { type: Number, required: true }, // 0-100
    stageRate: { type: Number, default: 0 }, 
    amount: { type: Number, default: 0 }, 
    paid: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    bill: [
      {
        billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
        paid: Number,
      },
    ]
  },
  { _id: false }
);

const subWorkSchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    included: { type: Boolean, default: false },
  },
  { _id: false }
);

const workDetailSchema = new mongoose.Schema(
  {
    id: { type: String }, 
    name: { type: String, required: true },
    unit: { type: String, default: "SQFT" },
    qty: { type: Number, default: 0 },
    rate: { type: Number, required: true },
    amount: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
    subWorks: [subWorkSchema],
    stages: [workStageSchema],
    status: { type: String, default: "Pending" },
    notes: String,
  },
  { timestamps: true }
);

const workOrderSchema = new mongoose.Schema(
  {
    workOrderName: { type: String, required: true, index: true },
    workOrderNo: { type: String, index: true },

    contractor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Contractor", required: true },
      name: { type: String, required: true },
    },

    site: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Site", required: true },
      name: { type: String, required: true },
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    templateRef: { type: mongoose.Schema.Types.ObjectId, ref: "WorkOrderTemplate" },

    date: { type: Date, default: Date.now },
    startDate: Date,
    durationMonths: Date,
    works: [workDetailSchema],

    totalValue: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },

    extrasRef: [{ type: mongoose.Schema.Types.ObjectId, ref: "ExtraWork" }],

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    adminApprove: { type: String, default: "Pending" },
    contractorApprove: { type: String, default: "Pending" },
    accountheadApprove: { type: String, default: "Pending" },
  },
  { timestamps: true }
);


// workOrderSchema.pre("save", function (next) {
//   try {
//     if (!this.works || !Array.isArray(this.works)) {
//       this.totalValue = 0;
//       this.totalPaid = 0;
//       this.totalDue = 0;
//       return next();
//     }

//     let totalValue = 0;
//     let totalPaid = 0;

//     this.works = this.works.map((w) => {
//       const qty = Number(w.qty || 0);
//       const rate = Number(w.rate || 0);

//       // compute work amount
//       const amount = Number((qty * rate).toFixed(2));
//       // rebuild stages safely
//       let stages = Array.isArray(w.stages) ? w.stages : [];
//       stages = stages.map((s) => {
//         const perc = Number(s.percentage || 0);
//         const stageRate = Number(((rate * perc) / 100).toFixed(2));
//         const stageAmount = Number((qty * stageRate).toFixed(2));
//         const paid = Number(s.paid || 0);

//         return {
//           ...s,
//           stageRate,
//           amount: stageAmount,
//           paid,
//           due: Number((stageAmount - paid).toFixed(2)),
//         };
//       });

//       // compute paid for this work
//       const paid = stages.reduce((sum, st) => sum + Number(st.paid || 0), 0);
//       const due = Number((amount - paid).toFixed(2));

//       // update overall totals
//       totalValue += amount;
//       totalPaid += paid;

//       return {
//         ...w,
//         amount,
//         paid,
//         due,
//         stages,
//       };
//     });

//     this.totalValue = Number(totalValue.toFixed(2));
//     this.totalPaid = Number(totalPaid.toFixed(2));
//     this.totalDue = Number((totalValue - totalPaid).toFixed(2));

//     next();
//   } catch (err) {
//     next(err);
//   }
// });


workOrderSchema.pre('save', function (next) {
  try {
    const wo = this;

    // Ensure works is array
    wo.works = Array.isArray(wo.works) ? wo.works : [];

    // Compute per-stage amounts, and sum
    let totalValue = 0;
    let totalPaid = 0;

    wo.works = wo.works.map((w) => {
      // normalize numeric fields
      w.qty = Number(w.qty) || 0;
      w.rate = Number(w.rate) || 0;
      w.amount = Number((w.qty * w.rate).toFixed(2));

      // Recalculate stages
      if (Array.isArray(w.stages) && w.stages.length) {
        w.stages = w.stages.map((s) => {
          s.percentage = Number(s.percentage) || 0;
          // stageRate = rate * percentage/100
          s.stageRate = Number(((w.rate * s.percentage) / 100).toFixed(2));
          s.amount = Number((w.qty * s.stageRate).toFixed(2));
          s.paid = Number(s.paid) || 0;
          s.due = Number((s.amount - s.paid).toFixed(2));
          // If fully paid => Completed
          if (s.due <= 0) s.status = "Completed";
          // keep status otherwise (Pending/In Progress)
          return s;
        });
      } else {
        // fallback single stage
        w.stages = [{
          id: w.stages?.[0]?.id || undefined,
          name: w.stages?.[0]?.name || "Full Work",
          percentage: 100,
          stageRate: w.rate,
          amount: w.amount,
          paid: Number(w.paid) || 0,
          due: Number((w.amount - (Number(w.paid) || 0)).toFixed(2)),
          status: (Number(w.paid) >= w.amount) ? "Completed" : "Pending",
          bill: w.stages?.[0]?.bill || []
        }];
      }

      // Aggregate for work
      w.paid = w.stages.reduce((s, st) => s + (Number(st.paid) || 0), 0);
      w.due = Number((w.amount - w.paid).toFixed(2));

      // Derive work status from stages:
      // If all stages completed => Completed
      // If any stage completed and others pending => Partial / In Progress
      const allCompleted = w.stages.every((st) => st.status === "Completed");
      const someInProgress = w.stages.some((st) => st.status === "In Progress" || st.status === "Pending" && st.paid > 0);
      if (allCompleted) w.status = "Completed";
      else if (someInProgress) w.status = "In Progress";
      else w.status = "Pending";

      totalValue += Number(w.amount) || 0;
      totalPaid += Number(w.paid) || 0;

      return w;
    });

    wo.totalValue = Number(totalValue.toFixed(2));
    wo.totalPaid = Number(totalPaid.toFixed(2));
    wo.totalDue = Number((wo.totalValue - wo.totalPaid).toFixed(2));

    // Approval statuses normalization (optional)
    if (!wo.approvalStatus) wo.approvalStatus = "Pending";

    next();
  } catch (e) {
    next(e);
  }
});


const templateDescriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // "Civil Work up to Ground Floor"
    unit: { type: String, default: "SQFT" }, // SQFT, RFT, KG, NOS
    rate: { type: Number, default: 0 },

    // NEW IMPORTANT FIELD ↓
    scope: {
      type: String,
      enum: ["perFloor", "perSite", "selectable"],
      required: true,
    },

    subWorks: [
      {
        name: { type: String, required: true },
        included: { type: Boolean, default: false },
      },
    ],
    paymentSchedule: [
      {
        stage: { type: String, required: true },
        percentage: { type: Number, default: 0 },
      },
    ],
  },
  { _id: false }
);

const workOrderTemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    trade: { type: String, required: true }, // "civil", "electrical" ...
    description: [templateDescriptionSchema],
  },
  { timestamps: true }
);

const WorkOrder = mongoose.model("Work_Order", workOrderSchema);
const WorkOrderTemplate = mongoose.model(
  "WorkOrder_Template",
  workOrderTemplateSchema
);

module.exports = { WorkOrder, WorkOrderTemplate };
