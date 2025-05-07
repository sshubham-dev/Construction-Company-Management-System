const express = require('express');
const Notification = express.Router();
const User = require('../models/user.models');


Notification.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId)
    const notification = [...user.notification]
    const seenNotifications = [];
    const unseenNotifications = [];
    for (const msg of notification) {
      console.log('msg', msg)
      if(msg.isRead == true){
        seenNotifications.push(msg)
      } else {
        unseenNotifications.push(msg)
      }
    }
    console.log('seen', seenNotifications)
    console.log('unseen', unseenNotifications)
    return res.status(201).json({ seenNotifications, unseenNotifications })
  })
  
  Notification.get('/:userId/mark-read/:index', async (req, res) => {
    const { userId, index } = req.params;
    const user = await User.findById(userId)
    console.log(user)
    const notification = [...user.notification]
    for (const msg of notification) {
      console.log('msg', msg)
    }
  
    return res.status(201).json({ message: 'Notification Seen' })
  })
module.exports = Notification;