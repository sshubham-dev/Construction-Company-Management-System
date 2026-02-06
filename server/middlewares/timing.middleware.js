const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "..", "logs", "timing.log");
let buffer = [];

setInterval(() => {
  if (!buffer.length) return;
  fs.appendFile(logFile, buffer.join(""), () => {});
  buffer = [];
}, 1000);

module.exports = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const ms = Number((process.hrtime.bigint() - start) / 1000000n);

    // only log slow requests in prod
    if (process.env.NODE_ENV === "production" && ms < 300) return;

    buffer.push(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}\n`
    );
  });

  next();
};
