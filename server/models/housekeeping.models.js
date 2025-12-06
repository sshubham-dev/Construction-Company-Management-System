const mongoose = require('mongoose');

const HousekeepingTaskSchema = new mongoose.Schema({
  task: { type: String, required: true },
  completed: { type: Boolean, default: false },
  remarks: { type: String, default: "" },
});

const HousekeepingSchema = new mongoose.Schema(
  {
    checkFor: {
      type: String,
      enum: ["Site", "Office", "Store"],
      required: true,
    },

    // Site reference only if checkFor = Site
    site: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
      name: { type: String },
    },

    // Office or Store name only
    locationName: {
      type: String,
      required: function () {
        return this.checkFor !== "Site";
      },
    },

    tasks: [HousekeepingTaskSchema],

    // Auto calculated: (completedTasks / totalTasks) * 10
    points: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Housekeeping = mongoose.model(
    "Housekeeping",
    HousekeepingSchema
);
module.exports= Housekeeping;
