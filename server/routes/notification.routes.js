const express = require("express");
const Notification = express.Router();
const User = require("../models/user.models");
const { userAuth } = require("../middlewares/auth.middleware");
const {
  saveSubscription,
  unsubscribe,
  checkSubscription,
} = require("../controller/notification.controller");
// Get notifications for a specific user

Notification.get("/", userAuth, async (req, res) => {
  // Use req.params to get userId from URL
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .sort({ "notification.createdAt": -1 }) // Sort notifications by createdAt in descending order
      .exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = [...user.notification]; // Create a copy of the notification array
    const seenNotifications = notification.filter((msg) => msg.isRead === true);
    const unseenNotifications = notification.filter(
      (msg) => msg.isRead === false,
    );

    // console.log('Seen Notifications:', seenNotifications);
    // console.log('Unseen Notifications:', unseenNotifications);

    return res.status(200).json({ seenNotifications, unseenNotifications });
  } catch (err) {
    console.error("Error fetching user or notifications:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

Notification.post("/subscribe", userAuth, saveSubscription);
Notification.post("/unsubscribe", userAuth, unsubscribe);
Notification.post("/check", checkSubscription);

Notification.put("/mark-all-read", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { "notification.$[].isRead": true } }, // Update all array items
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error updating notifications:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Mark a specific notification as read
Notification.put("/mark-read/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findOneAndUpdate(
      { _id: userId, "notification._id": id },
      { $set: { "notification.$.isRead": true } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// bulk delete
Notification.delete("/:userId", userAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notification = user.notification.filter(
      (n) => !ids.includes(n._id.toString()),
    );

    await user.save();
    return res.status(200).json({ message: "Notifications deleted" });
  } catch (err) {
    console.error("Error deleting notifications:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = Notification;
