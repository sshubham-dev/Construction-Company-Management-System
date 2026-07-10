const Event = require("../models/event.models");

const createEvent = async (req, res) => {
    const {
        type,
        recipient,
        title,
        message,
        payload,
        channels,
    } = req.body;

  const event = await Event.create({
        type,
        recipient,
        title,
        message,
        payload,
        channels,
    });
    

};

module.exports = createEvent;