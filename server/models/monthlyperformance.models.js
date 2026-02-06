const mongoose = require("mongoose");

const monthlyPerformanceSchema = new mongoose.Schema(
  {
    /* ================= CORE ================= */

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true, // derived from employee.department
    },

    month: {
      type: String, // YYYY-MM
      required: true,
      index: true,
    },

    /* ================= TARGETS ================= */

    targets: [
      {
        type: {
          type: String,
          enum: ["SITE_WORK", "REVENUE"],
          required: true,
        },

        /* ===== SITE WORK TARGET ===== */
        works: [
          {
            projectSchedule: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "ProjectSchedule",
            },

            workName: String,

            deadline: Date, // replannedDate || plannedDate

            status: {
              type: String,
              enum: ["COMPLETED", "DELAYED", "MISSED", "PENDING"],
            },

            bonusValue: Number,

            achievedBonus: {
              type: Number,
              default: 0,
            },
          },
        ],

        /* ===== REVENUE TARGET ===== */
        revenueTarget: {
          targetValue: Number,

          deadline: Date, // always 3rd of next month

          achievedRevenue: {
            type: Number,
            default: 0,
          },

          bonusType: {
            type: String,
            enum: ["FIXED", "PERCENTAGE"],
          },

          bonusValue: Number,

          achievedBonus: {
            type: Number,
            default: 0,
          },

          status: {
            type: String,
            enum: ["ACHIEVED", "NOT_ACHIEVED"],
          },
        },
      },
    ],

    /* ================= TASK CHECKLIST ================= */

    tasks: [
      {
        taskTemplate: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TaskTemplate",
        },

        name: String,
        frequency: String,

        verificationMethod: {
          type: String,
          enum: ["SYSTEM", "APPROVAL", "MIXED"],
        },

        verifiedBy: String,

        referenceId: {
          type: mongoose.Schema.Types.ObjectId,
        },

        description: String,

        enabled: {
          type: Boolean,
          default: true,
        },

        expectedCount: Number,
        completedCount: Number,

        status: {
          type: String,
          enum: ["COMPLETED", "PARTIAL", "MISSED"],
        },
      },
    ],

    /* ================= TASK LOG SNAPSHOT ================= */

    taskLogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskLog",
      },
    ],

    /* ================= TRAFFIC LIGHT ================= */

    trafficLightRule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrafficLightRule",
    },

    trafficLightResult: {
      percentage: Number,

      color: {
        type: String,
        enum: ["GREEN", "AMBER", "RED"],
      },

      bonus: Number,
    },

    /* ================= METRICS ================= */

    metrics: {
      totalTasks: Number,
      scorePerTask: Number,
      totalScoreAchieved: Number,
      completionPercentage: Number,
    },

    /* ================= PAYOUT ================= */

    totalBonus: {
      type: Number,
      default: 0,
    },

    /* ================= CONTROL ================= */

    isLocked: {
      type: Boolean,
      default: false,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


const employeePerformanceTemplateSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true, // one template per employee
    },

    role: {
      type: String,
      required: true, // snapshot of department/role
    },

    /* ================= TASK ASSIGNMENT ================= */

    tasks: [
      {
    frequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly"],
      required: true,
    },

    verificationMethod: {
      type: String,
      enum: ["SYSTEM", "APPROVAL", "MIXED"],
      required: true,
    },

    verifiedBy: [{
      name: String, // who approves (role or system)
    }],

    referenceId: [{
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    }],

    enabled: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      default: "",
    },

    deadline:{
      type: String,
    },
      },
    ],

    /* ================= TRAFFIC LIGHT ================= */

    trafficLightRule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrafficLightRule",
      required: true,
    },

    /* ================= CONTROL ================= */

    active: {
      type: Boolean,
      default: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

monthlyPerformanceSchema.index({ employee: 1, month: 1 }, { unique: true });

const EmployeePerformanceTemplate = mongoose.model(
  "EmployeePerformanceTemplate",
  employeePerformanceTemplateSchema
);
const MonthlyPerformance = mongoose.model(
  "MonthlyPerformance",
  monthlyPerformanceSchema
);
module.exports = { MonthlyPerformance, EmployeePerformanceTemplate };
