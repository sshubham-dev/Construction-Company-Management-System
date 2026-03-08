// models/Subscription.js
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subscription: {
    endpoint: { type: String, required: true},
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  deviceId: String, // Optional: 'mobile' or 'desktop'
}, { timestamps: true });
subscriptionSchema.index({ userId: 1 }); // Index for faster queries by userId

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
