const Subscription = require("../models/subscription.models");

const saveSubscription = async (req, res) => {
  try {
    const { subscription, userId } = req.body;
    const userAgent = req.headers["user-agent"];

    // 1. Double check the incoming data (Logging is your best friend here)
    console.log("Checking for:", {
      userId,
      endpoint: subscription?.endpoint,
      deviceId: userAgent,
    });

    if (!userId || !subscription?.endpoint) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // 2. The Strict Triple-Check
    // This will ONLY return a document if User AND Endpoint AND Device match.
    const existingSub = await Subscription.findOne({
      $and: [{ userId: userId }, { deviceId: userAgent }],
    });

    // 3. Logic Branching
    if (existingSub) {
      console.log("Match found! Updating existing device record...");
      existingSub.subscription = subscription; // Refresh keys
      existingSub.updatedAt = Date.now();
      await existingSub.save();

      return res.status(200).json({
        success: true,
        message: "Existing device updated",
        action: "updated",
      });
    } else {
      console.log("No exact match. Creating NEW device entry for this user...");
      const newSub = new Subscription({
        userId,
        subscription,
        deviceId: userAgent,
      });
      await newSub.save();
      console.log("new subscription created");
      return res.status(201).json({
        success: true,
        message: "New device registered",
        action: "created",
      });
    }
  } catch (error) {
    console.error("Subscription Logic Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { endpoint, userId } = req.body;
    if (!endpoint) {
      return res
        .status(400)
        .json({ success: false, message: "No endpoint provided" });
    }

    await Subscription.deleteOne({
      $and: [{ userId: userId }, { "subscription.endpoint": endpoint }],
    });

    return res.json({ success: true, message: "Unsubscribed" });
  } catch (err) {
    console.log("Unsubscribe error", err);
    res.status(500).json({ success: false });
  }
};

const checkSubscription = async (req, res) => {
  try {
    const { userId, endpoint } = req.body;
    const deviceId = req.headers["user-agent"];

    // 1. Primary Check: Does this specific browser endpoint already belong to this user?
    // This is the most accurate way to check "Is THIS browser registered?"
    const exists = await Subscription.findOne({
      $and: [{ userId: userId }, { "subscription.endpoint": endpoint }],
      // Use the endpoint sent from the frontend
    });

    if (exists) {
      return res.json({
        existsInDB: true,
        // If the deviceId matches too, it's a perfect match
        deviceIdMatches: exists.deviceId === deviceId,
      });
    }

    // 2. Secondary Check (Fallback): Does this user have a subscription on this Device ID?
    // This handles cases where the endpoint might have rotated but the device is the same.
    const deviceExists = await Subscription.findOne({
      $and: [{ userId: userId }, { deviceId: deviceId }],
    });

    if (deviceExists) {
      return res.json({
        existsInDB: true,
        needsUpdate: deviceExists.subscription.endpoint !== endpoint,
      });
    }

    return res.json({
      existsInDB: false,
    });
  } catch (err) {
    console.error("checkSubscription error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during check" });
  }
};

module.exports = {
  saveSubscription,
  unsubscribe,
  // sendNotification,
  checkSubscription,
};
