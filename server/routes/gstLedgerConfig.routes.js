const express = require("express");
const GSTLedger = express.Router();
const {
    create,
    getAll,
    getOne,
    update,
    remove,
    gstConfig,
} = require("../controller/gstLedgerConfig.controller");
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

// Create
GSTLedger.post("/", adminAuth, create);

// List
GSTLedger.get("/", adminAuth, getAll);

GSTLedger.get("/config", adminAuth, gstConfig);

// Single
GSTLedger.get("/:id", adminAuth, getOne);

// Update
GSTLedger.put("/:id", adminAuth, update);

// Delete (Soft Delete)
GSTLedger.delete("/:id", adminAuth, remove);

module.exports = GSTLedger;