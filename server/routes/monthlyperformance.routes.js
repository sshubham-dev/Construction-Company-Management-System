const MonthlyPerformance = require("express").Router();
const {generate} = require("../controller/monthlyperformance.controller");

MonthlyPerformance.post("/generate", generate);

module.exports = MonthlyPerformance;
