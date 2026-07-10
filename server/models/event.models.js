const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    type: String,

    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    title: String,

    message: String,

    payload: Object,

    channels: [{
        type: String,
        enum: [
            "IN_APP",
            "PUSH",
            "WHATSAPP",
            "EMAIL",
            "SMS",
        ]
    }],

    status: {
        type: String,
        default: "PENDING",
    },

    sentAt: Date,
}, {
    timestamps: true,
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;