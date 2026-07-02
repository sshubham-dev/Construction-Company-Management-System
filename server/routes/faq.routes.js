const express = require("express");
const {
  createFaq,
  updateFaq,
  deleteFaq,
  getAllFaqs,
  getServiceFaqs,
  getBlogFaqs,
  getCategoryFaqs,
} = require("../controller/faq.controller");

const FAQs = express.Router();

/* admin */

FAQs.post("/", createFaq);
FAQs.get("/admin", getAllFaqs);
FAQs.put("/:id", updateFaq);
FAQs.delete("/:id", deleteFaq);

/* website */

FAQs.get("/service", getServiceFaqs);
FAQs.get("/blog", getBlogFaqs);
FAQs.get("/category", getCategoryFaqs);

module.exports = FAQs;
