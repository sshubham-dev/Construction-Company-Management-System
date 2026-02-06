const express = require("express");
const Store = express.Router();
const {createStore, getStores, getStoreById, updateStore, deactivateStore} = require("../controller/store.controller");

Store.post("/", createStore);
Store.get("/", getStores);
Store.get("/:id", getStoreById);
Store.put("/:id", updateStore); 
Store.delete("/:id", deactivateStore);

module.exports = Store;