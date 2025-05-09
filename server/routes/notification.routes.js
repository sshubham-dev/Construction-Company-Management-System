const express = require('express');
const Notification = express.Router();
const User = require('../models/user.models');

// Get notifications for a specific user
Notification.get('/:userId', async (req, res) => {
  const { userId } = req.params; // Use req.params to get userId from URL
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = [...user.notification]; // Create a copy of the notification array
    const seenNotifications = notification.filter(msg => msg.isRead === true);
    const unseenNotifications = notification.filter(msg => msg.isRead === false);

    console.log('Seen Notifications:', seenNotifications);
    console.log('Unseen Notifications:', unseenNotifications);

    return res.status(200).json({ seenNotifications, unseenNotifications });
  } catch (err) {
    console.error('Error fetching user or notifications:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Mark a specific notification as read
Notification.patch('/:userId/mark-read/:id', async (req, res) => {
  const { userId, id } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the notification by ID from user's notifications array
    const notification = user.notification.find((n) => n._id.toString() === id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Mark it as read
    notification.isRead = true;

    // Save the updated user
    await user.save();

    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = Notification;
