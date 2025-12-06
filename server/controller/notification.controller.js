const webpush = require("web-push");
const Subscription = require("../models/subscription.models");

webpush.setVapidDetails(
  "mailto:bhuviconsultants09@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const saveSubscription = async (req, res) => {
  try {
    const { subscription, user } = req.body;

    await Subscription.deleteOne({
      "subscription.endpoint": subscription?.endpoint
    });

    const newSubscription = new Subscription({
      user,
      subscription,
    });

    await newSubscription.save();

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { endpoint, user } = req.body;
    if (!endpoint) {
      return res.status(400).json({ success: false, message: "No endpoint provided" });
    }

    await Subscription.deleteOne({ "subscription.endpoint": endpoint, user });

    return res.json({ success: true, message: "Unsubscribed" });
  } catch (err) {
    console.log("Unsubscribe error", err);
    res.status(500).json({ success: false });
  }
};

const sendNotification = async (userId, message) => {
  try {
    const subscriptions = await Subscription.find({ user: userId });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          sub.subscription,
          JSON.stringify({
            title: "Bhuvi Manager",
            body: message,
          })
        );
      } catch (err) {
        console.log("Push error:", err.statusCode);

        // 410 or 404 = expired subscription → remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log("Expired subscription removed:", sub.subscription.endpoint);
          await Subscription.deleteOne({
            "subscription.endpoint": sub.subscription.endpoint
          });
        }
      }
    }
  } catch (err) {
    console.log("Error in sendNotification:", err);
  }
};







module.exports = {
  saveSubscription,
  unsubscribe,
  sendNotification,
};
