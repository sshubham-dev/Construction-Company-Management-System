const axios = require("axios");

const sendWhatsapp = async (event) => {

    const user =
        await User.findById(
            event.recipient
        );

    await axios.post(

        `https://graph.facebook.com/v23.0/${PHONE_ID}/messages`,

        {
            messaging_product: "whatsapp",

            to: user.phone,

            type: "template",

            template: {
                name: "payment_due",
                language: {
                    code: "en"
                }
            }
        },

        {
            headers: {
                Authorization:
                    `Bearer ${TOKEN}`
            }
        }

    );

}