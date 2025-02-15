const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({}, {timestamps: true})

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ' },
    message: String,
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification