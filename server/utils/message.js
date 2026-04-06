
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const sendMessage = async (data, whatsapp) => {
    let msgOption = {
        body: data,
        from: 'whatsapp:+14155238886',
        to: whatsapp,
    }
    try {
        const message = await client.messages.create(msgOption)
        console.log(message)
    } catch (error) {
        console.log(error)
    }
}

// client.messages.create(msgOption)
// .then(message => console.log(message.sid))
// .catch(error => console.log(error))

module.exports = sendMessage;