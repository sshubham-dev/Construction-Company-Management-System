const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deviceId: {type:String},
  subscription: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
