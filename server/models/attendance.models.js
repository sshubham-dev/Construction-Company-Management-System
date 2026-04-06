const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      name: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    date: {
      type: String,
    },
    timeIn: {
      type: String,
    },
    status: {
      type: String,
      default: "absent",
    },
  },
  { timestamps: true }
);

const leaveSchema = new mongoose.Schema(
  {
    user: {
      name: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    reason: {
      type: String,
    },
    from: {
      type: String,
    },
    reportingDate: {
      type: String,
    },
    approval: {
      type: String,
      default: "Pending",
    },
    reportedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const LabourAttendanceSchema = new mongoose.Schema(
  {
    contractor: String,
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
    },

    site: {
      name: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site",
        required: true,
      },
    },

    date: {
      type: Date,
      default: Date.now,
    },

    // MANDAYS RECORDED
    skilledMale: { type: Number, default: 0 },
    skilledFemale: { type: Number, default: 0 },
    unskilledMale: { type: Number, default: 0 },
    unskilledFemale: { type: Number, default: 0 },

    work: String,

    // RATES — EACH CATEGORY HAS ITS OWN RATE
    skilledMaleRate: { type: Number, default: 0 },
    skilledFemaleRate: { type: Number, default: 0 },
    unskilledMaleRate: { type: Number, default: 0 },
    unskilledFemaleRate: { type: Number, default: 0 },

    // TOTALS
    amount: { type: Number, default: 0 }, // auto-calc
    paid: { type: Number, default: 0 },
    due: { type: Number, default: 0 },

    bill: [
      {
        billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
        amountPaid: Number,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

LabourAttendanceSchema.pre("save", function () {
  const doc = this;

  // Convert all to numbers safely
  const SM = Number(doc.skilledMale) || 0;
  const SF = Number(doc.skilledFemale) || 0;
  const UM = Number(doc.unskilledMale) || 0;
  const UF = Number(doc.unskilledFemale) || 0;

  const SMR = Number(doc.skilledMaleRate) || 0;
  const SFR = Number(doc.skilledFemaleRate) || 0;
  const UMR = Number(doc.unskilledMaleRate) || 0;
  const UFR = Number(doc.unskilledFemaleRate) || 0;

  // Amount calculations
  const skilledMaleAmount = SM * SMR;
  const skilledFemaleAmount = SF * SFR;
  const unskilledMaleAmount = UM * UMR;
  const unskilledFemaleAmount = UF * UFR;

  // Total amount
  doc.amount =
    skilledMaleAmount +
    skilledFemaleAmount +
    unskilledMaleAmount +
    unskilledFemaleAmount;

  // Ensure paid exists
  doc.paid = Number(doc.paid) || 0;

  // Compute due
  doc.due = doc.amount - doc.paid;
  return
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
const Leave = mongoose.model("Leave", leaveSchema);
const LabourAttendance = mongoose.model(
  "LabourAttendance",
  LabourAttendanceSchema
);
module.exports = { Attendance, Leave, LabourAttendance };
