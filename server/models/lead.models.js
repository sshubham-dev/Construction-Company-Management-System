const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contact: {
      phoneNo: {
        type: String,
        unique: true,
        required: true,
      },
      whatsapp: {
        type: String,
        unique: true,
        required: true,
      },
      email: {
        type: String,
        trim: true,
      },
    },
    location: {
      address: String,
      city: String,
      district: String,
      state: String,
    },

    /* Marketing lead nature */

    temperature: {
      type: String,
      enum: ["hot", "warm", "cold"],
      default: "cold",
    },

    /* Sales pipeline */

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "discussion",
        "proposal_sent",
        "negotiation",
        "converted",
        "lost",
        "closed",
      ],
      default: "new",
    },

    requirement: {
      service: {
        type: String,
      },
      message: String,
    },

    /* Reminder system */

    nextFollowUpDate: Date,
    lastContactedAt: Date,

    /* Marketing tracking */
    followUps: [
      {
        date: {
          type: Date,
          default: Date.now,
        },

        type: {
          type: String,
          enum: ["call", "whatsapp", "meeting", "site_visit", "other"],
          default: "call",
        },

        note: String,

        nextFollowUp: Date,
      },
    ],

    marketingTag: String,

    source: {
      type: String,
    },

    contactAgent: {
      userId: String,
      name: String,
    },

    quotation: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quote",
      },
    ],

    isClient: Boolean,
  },
  { timestamps: true },
);

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
