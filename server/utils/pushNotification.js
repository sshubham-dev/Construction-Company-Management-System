const webpush = require("web-push");
const User = require("../models/user.models");
const Subscription = require("../models/subscription.models");

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

const sendPushNotification = async (userIds, title, body, url = "/") => {
  // 1. get all subscriptions for the target user(s)
  const subscriptions = await Subscription.find({ userId: { $in: userIds } });
  const notifications = subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(
        sub.subscription,
        JSON.stringify({ title, body, url }),
      );
    } catch (error) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Remove expired/invalid subscription
        await Subscription.findByIdAndDelete(sub._id);
      }
    }
  });
  return Promise.all(notifications);
};

// Example: Notify all users in a specific role (like Site Managers)
const notifyRole = async (roleName, title, body, url) => {
  const users = await User.find({ role: roleName }).select("_id");
  const userIds = users.map((u) => u._id);

  // Use the sendPush utility we created earlier
  return await sendPushNotification(userIds, title, body, url);
};

module.exports = { sendPushNotification, notifyRole };
