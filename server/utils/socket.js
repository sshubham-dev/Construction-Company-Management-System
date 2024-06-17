// socket.js
const dotenv = require('dotenv').config();
const server = require('http').createServer();
const io = require('socket.io')(server, {
    cors: {
        origin: `${process.env.CORS_ORIGIN}`,
        methods: ["GET", "POST", "PUT"],
        credentials: true,
    }
});

module.exports = io;