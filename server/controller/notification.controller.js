// controllers/notification.controller.js
const admin = require("../middlewares/firebaseAdmin");
const User = require("../models/user.models"); // Adjust path to your user model

const registerToken = async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ message: "Missing userId or token" });
  }

  try {
    await User.findByIdAndUpdate(userId, { fcmToken: token });
    res.status(200).json({ message: "Token registered successfully" });
  } catch (error) {
    console.error("Error registering token:", error);
    res.status(500).json({ message: "Failed to register token" });
  }
};

const removeToken = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    await User.findByIdAndUpdate(userId, { fcmToken: null });
    res.status(200).json({ message: "Token removed successfully" });
  } catch (error) {
    console.error("Error removing token:", error);
    res.status(500).json({ message: "Failed to remove token" });
  }
};

const sendNotification = async (req, res) => {
  const { userId, title, message } = req.body;

  try {
    const user = await User.findById(userId);
    const fcmToken = user?.fcmToken;

    if (!fcmToken) {
      return res.status(400).json({ message: "User has no FCM token" });
    }

    const payload = {
      notification: {
        title,
        body: message,
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(payload);

    res.status(200).json({
      message: "Notification sent",
      firebaseResponse: response,
    });
  } catch (error) {
    console.error("FCM send error:", error);
    res.status(500).json({
      message: "Error sending notification",
      error: error.message,
    });
  }
};

module.exports = {
  registerToken,
  removeToken,
  sendNotification
}