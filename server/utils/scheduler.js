const cron = require("node-cron");
const Event = require("./createEvent")

cron.schedule('*****', () => {
    const events = await Event.find({
        status: "PENDING",
    });

    for (const event of events) {
        await processEvent(event);
    }
});


const processEvent = async (event) => {

    if (event.channels.includes("PUSH")) {
        await sendPush(event);
    }

    if (event.channels.includes("WHATSAPP")) {
        await sendWhatsapp(event);
    }

    if (event.channels.includes("EMAIL")) {
        await sendEmail(event);
    }

    event.status = "SENT";
    await event.save();
}