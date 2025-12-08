// middleware/timing.js
const fs = require('fs');
const stream = fs.createWriteStream('./logs/timing.log', { flags: 'a' });
module.exports = (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number((process.hrtime.bigint() - start) / 1000000n);
    const line = `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}\n`;
    stream.write(line);
  });
  next();
};
