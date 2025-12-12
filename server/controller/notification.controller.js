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
    const deviceId = req.headers["user-agent"];

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: "Invalid subscription" });
    }

    // Delete only duplicate subscription of SAME DEVICE
    await Subscription.deleteOne({
      user,
      deviceId
    });

    const newSubscription = new Subscription({
      user,
      deviceId,
      subscription,
      createdAt: new Date()
    });

    await newSubscription.save();

    res.json({ success: true });

  } catch (err) {
    console.log("saveSubscription error:", err);
    res.status(500).json({ success: false });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { endpoint, user } = req.body;
    if (!endpoint) {
      return res
        .status(400)
        .json({ success: false, message: "No endpoint provided" });
    }

    await Subscription.deleteOne({ "subscription.endpoint": endpoint, user });

    return res.json({ success: true, message: "Unsubscribed" });
  } catch (err) {
    console.log("Unsubscribe error", err);
    res.status(500).json({ success: false });
  }
};

const checkSubscription = async (req, res) => {
  try {
    const { user, endpoint } = req.body;
    const deviceId = req.headers["user-agent"];

    // Find existing subscription for same user + same device
    const exists = await Subscription.findOne({
      user,
      deviceId
    });

    if (exists) {
      return res.json({
        existsInDB: true,
        endpointMatches: exists.subscription.endpoint === endpoint
      });
    }

    return res.json({
      existsInDB: false
    });

  } catch (err) {
    console.log("checkSubscription error:", err);
    res.status(500).json({ success: false });
  }
};

const sendNotification = async (userId, message) => {
  try {
    const subscriptions = await Subscription.find({ user: userId });

    for (const sub of subscriptions) {
      try {
        if (
          !sub?.subscription?.endpoint ||
          !sub?.subscription?.keys?.p256dh ||
          !sub?.subscription?.keys?.auth
        ) {
          console.log("Invalid subscription removed");
          await Subscription.deleteOne({ _id: sub._id });
          continue;
        }

        await webpush.sendNotification(
          sub.subscription,
          JSON.stringify({
            title: "Bhuvi Manager",
            body: message,
          })
        );
      } catch (err) {
        console.log("Push error:", err.statusCode);

        // Remove all unusable subscriptions
        if ([400, 403, 404, 410].includes(err.statusCode)) {
          console.log("Invalid/Expired subscription removed");
          await Subscription.deleteOne({ _id: sub._id });
        }
      }
    }
  } catch (err) {
    console.log("Error in sendNotification:", err.message);
  }
};

module.exports = {
  saveSubscription,
  unsubscribe,
  sendNotification,
  checkSubscription,
};
