const cron = require("node-cron");
const { sendNotification } = require("../controller/notification.controller.js");
const User = require("../models/user.models.js");

const NEW_YEAR_EVENT = {
  year: 2026,
  enabled: true,
};

// cron.schedule("*/5 * * * * *", async () => {
//   console.log("🔥 TEST CRON RUNNING", new Date().toISOString());
//   const now = new Date();
//     if (!NEW_YEAR_EVENT.enabled) return;
//     if (now.getFullYear() !== NEW_YEAR_EVENT.year) return;

//     console.log("🎉 New Year 2026 push trigger started");

//     const users = await User.find({}, { _id: 1 });

//     for (const user of users) {
//       try {
//         await sendNotification(
//           user._id,
//           `Few Hours to go for New Year 2026! Thank you for being part of our journey. Open the app to start 2026 with us.`
// //           "🎉 Happy New Year 2026. Thank you for being part of our journey. Open the app to start 2026 with us."
//         );
//       } catch (err) {
//         console.error(`❌ Push failed for user ${user._id}`, err);
//       }
//     }

//     console.log("✅ New Year 2026 push sent");
// }, { timezone: "Asia/Kolkata" });

// 12:00 AM IST, 1st Jan


cron.schedule(
  "0 0 0 1 1 *",
  async () => {
    const now = new Date();
    if (!NEW_YEAR_EVENT.enabled) return;
    if (now.getFullYear() !== NEW_YEAR_EVENT.year) return;

    console.log("🎉 New Year 2026 push trigger started");

    const users = await User.find({}, { _id: 1 });

    for (const user of users) {
      try {
        await sendNotification(
          user._id,
          "🎉 Happy New Year 2026. Open the app to start 2026 with us."
        );
      } catch (err) {
        console.error(`❌ Push failed for user ${user._id}`, err);
      }
    }

    console.log("✅ New Year 2026 push sent");
  },
  { timezone: "Asia/Kolkata" }
);
