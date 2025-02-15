// NotificationComponent.js
import React from 'react';
import io from 'socket.io-client';
const socket = io('http://localhost:8080'); // Adjust the URL as needed

const Notification = () => {
    const sendNotification = () => {
        const notification = { message: 'New notification!', timestamp: new Date() };
        socket.emit('sendNotification', notification);
    };

    return (
        <div>
            <button onClick={sendNotification}>Send Notification</button>
        </div>
    );
};

export default Notification;