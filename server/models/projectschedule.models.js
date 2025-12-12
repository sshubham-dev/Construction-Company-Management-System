const mongoose = require("mongoose");

const projectDetailSchema = new mongoose.Schema({
  workDetail: {
    type: String,
  },
  planned: Date,
  // new array for future updates
  rePlannedDates: [
    {
      date: Date,
      reason: String,
    },
  ],
  actual: {
    type: Date,
    default: Date.now
  },
  difference: Number,
  reason: String,
  status: {
    type: String,
    enum: ["Started", "Completed", "Pending", "Partially Completed"],
    default: "Pending",
  },
});

const projectScheduleSchema = new mongoose.Schema(
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
    scheduleId: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    projectDetail: [projectDetailSchema],
    clientApprove: {
      type: String,
      default: "Pending",
    },
    adminApprove: {
      type: String,
      default: "Pending",
    },
    accountheadApprove: {
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

projectScheduleSchema.pre("save", async function (next){
  try {
        const schedule = this.projectDetail;
    schedule.flatMap((work) => {
      const planned = new Date(work.rePlannedDates[-1] ? work.rePlannedDates[-1].date : work.planned);
      const actual = new Date(work.actual);
      work.difference = Math.ceil((actual - planned) / (1000 * 60 * 60 * 24));
      // work.reason = "Delay in work completion"
    });
    next();
  } catch (err) {
    console.error("Error in project schedule:", err);
    next(err);
  }
})

const ProjectSchedule = mongoose.model(
  "Project_Schedule",
  projectScheduleSchema
);

module.exports = ProjectSchedule;
