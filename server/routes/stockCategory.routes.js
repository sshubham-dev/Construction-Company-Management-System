const express = require("express");
const Stock_Category = express.Router();

const {
  createCategory,
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  updateCategory,
  deleteCategory,

} = require("../controller/stock.controller");

/* =========================
   STOCK CATEGORY
========================= */

Stock_Category.post("/", createCategory);

Stock_Category.get("/tree", getCategoryTree);

Stock_Category.get("/", getAllCategories);

Stock_Category.get("/:id", getCategoryById);

Stock_Category.put("/:id", updateCategory);

Stock_Category.delete("/:id", deleteCategory);


module.exports = Stock_Category;
