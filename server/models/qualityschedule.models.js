const mongoose = require("mongoose");

const workDetailSchema = new mongoose.Schema({
  work: {
    type: String,
  },
  checkingDate: {
    type: Date,
  },
  checkedAt: {
    type: Date,
  },
  difference: {
    type: String,
  },
  reason: {
    type: String,
  },
  status: {
    type: String,
    default: "Pending",
  },
});

const qualityScheduleSchema = new mongoose.Schema(
  {
    site: {
      name: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site",
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
    qualityScheduleId: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    workDetails: [workDetailSchema],
    qualityApprove: {
      type: String,
      default: "Pending",
    },
    inchargeApprove: {
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

qualityScheduleSchema.pre("save", async function () {
  try {
    const schedule = this.workDetails;
    schedule.flatMap((work) => {
      const planned = new Date(work.checkingDate);
      const actual = new Date(work.checkedAt);
      work.difference = Math.ceil((actual - planned) / (1000 * 60 * 60 * 24));
      work.reason = "Delay in work completion"
    });
  } catch (err) {
    console.error("Error in quality schedule:", err);
   return err
  }
});

const QualitySchedule = mongoose.model(
  "QualitySchedule",
  qualityScheduleSchema
);

module.exports = QualitySchedule;
