
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  const { _id, role, department } = user;
  return jwt.sign({ _id, role, department }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

module.exports = { generateAccessToken, generateRefreshToken };