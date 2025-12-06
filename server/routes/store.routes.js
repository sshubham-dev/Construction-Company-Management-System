const express = require("express");
const Store = express.Router();
const {createStore, getStores, getStoreById, updateStore, deleteStore} = require("../controller/store.controller");

Store.post("/", createStore);
Store.get("/", getStores);
Store.get("/:id", getStoreById);
Store.put("/:id", updateStore); 
Store.delete("/:id", deleteStore);

module.exports = Store;