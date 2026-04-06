const express = require("express");
const Store = express.Router();
const {createStore, getStores, getStoreById, updateStore, deactivateStore} = require("../controller/store.controller");
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

Store.post("/",userAuth, createStore);
Store.get("/",  userAuth, getStores);
Store.get("/:id", getStoreById);
Store.put("/:id", userAuth, updateStore); 
Store.delete("/:id", deactivateStore);

module.exports = Store;