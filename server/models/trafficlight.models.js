const mongoose = require("mongoose");

const taskTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    frequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly"],
      required: true,
    },

    deadline:{
      type: String,
    },

    verificationMethod: {
      type: String,
      enum: ["SYSTEM", "APPROVAL", "MIXED"],
      required: true,
    },

    verifiedBy: {
      type: String, // who approves (role or system)
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const trafficLightRuleSchema = new mongoose.Schema(
  {
    name: String, // optional label

    greenAbove: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    amberAbove: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    greenBonus: {
      type: Number,
      default: 0,
    },

    redPenalty: {
      type: Number,
      default: 0,
    },

    notes: String,

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const taskLogSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    taskTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskTemplate",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    source: {
      type: String,
      enum: ["SYSTEM", "REQUEST"],
      required: true,
    },

    status: {
      type: String,
      enum: ["COMPLETED", "REJECTED"],
      required: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

taskLogSchema.index({
  employee: 1,
  taskTemplate: 1,
  period: 1,
  occurrenceDate: 1,
}, { unique: true });

const TaskLog = mongoose.model("TaskLog", taskLogSchema);

const TrafficLightRule = mongoose.model(
  "TrafficLightRule",
  trafficLightRuleSchema
);

const TaskTemplate = mongoose.model("TaskTemplate", taskTemplateSchema);
module.exports = { TaskTemplate, TrafficLightRule, TaskLog };
