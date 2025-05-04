const express = require('express');
const webpush = require('../utils/webpush');
const Notification = express.Router();
const User = require('../models/user.models');


// POST /api/notification/subscribe
Notification.post('/subscription', async (req, res) => {
  const { userId, subscription } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.pushSubscription = subscription;
    await user.save();

    res.status(200).json({ message: 'Push subscription saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while saving subscription' });
  }
});


// Notification.post('/subscribe', async (req, res) => {
//   const { subscription, userId } = req.body; // Assuming you're also passing the userId
//   try {
//     await Subscription.findOneAndUpdate(
//       { userId },
//       { subscription },
//       { upsert: true }
//     );
//     res.status(201).json({ message: 'Subscribed successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to save subscription' });
//   }
// });
// Notification.post('/send', async (req, res) => {
//   const { subscription, title, message } = req.body;

//   const payload = JSON.stringify({ title, message });

//   try {
//     await webpush.sendNotification(subscription, payload);
//     res.status(200).json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Push error' });
//   }
// });

module.exports = Notification;
