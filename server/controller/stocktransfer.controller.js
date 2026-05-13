const { Store_Transfer } = require("../models/store.models");
const { executeStockTransaction } = require("../services/Inventory/stock.service");

/* =========================
   CREATE TRANSFER
========================= */
const createTransfer = async (req, res) => {
    try {
        const { fromStoreId, toStoreId, items, narration } = req.body;

        if (!fromStoreId || !toStoreId) {
            throw new Error("Both stores required");
        }

        if (fromStoreId === toStoreId) {
            throw new Error("Cannot transfer to same store");
        }

        if (!items?.length) {
            throw new Error("Items required");
        }

        const transferNo = `TR-${Date.now()}`;

        const transfer = await Store_Transfer.create({
            transferNo,
            fromStoreId,
            toStoreId,
            items,
            requestedBy: req.user._id,
            narration,
        });

        res.status(201).json({ success: true, data: transfer });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


const sendForApproval = async (req, res) => {
    try {
        const transfer = await Store_Transfer.findById(req.params.id);

        if (!transfer) throw new Error("Transfer not found");

        if (transfer.status !== "DRAFT") {
            throw new Error("Only draft can be submitted");
        }

        transfer.status = "PENDING";
        await transfer.save();

        res.json({ success: true, data: transfer });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


const approveTransfer = async (req, res) => {
    try {
        const transfer = await Store_Transfer.findById(req.params.id);

        if (!transfer) throw new Error("Transfer not found");

        if (transfer.status !== "PENDING") {
            throw new Error("Not in approval state");
        }

        /* =========================
           EXECUTE STOCK MOVEMENT
        ========================== */
        for (const item of transfer.items) {
            await executeStockTransaction({
                itemId: item.itemId,
                fromStoreId: transfer.fromStoreId,
                toStoreId: transfer.toStoreId,
                quantity: item.quantity,
                rate: item.rate || 0,
                type: "TRANSFER",
                source: "TRANSFER",
                referenceId: transfer._id,
                userId: req.user._id,
            });
        }

        transfer.status = "COMPLETED";
        transfer.approvedBy = req.user._id;
        transfer.approvedAt = new Date();

        await transfer.save();

        res.json({
            success: true,
            message: "Transfer completed",
            data: transfer,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


const rejectTransfer = async (req, res) => {
    try {
        const { reason } = req.body;

        const transfer = await Store_Transfer.findById(req.params.id);

        if (!transfer) throw new Error("Transfer not found");

        if (transfer.status !== "PENDING") {
            throw new Error("Only pending can be rejected");
        }

        transfer.status = "REJECTED";
        transfer.rejectedReason = reason;

        await transfer.save();

        res.json({ success: true, data: transfer });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


const getTransfers = async (req, res) => {
    const data = await Store_Transfer.find()
        .populate("fromStoreId toStoreId items.itemId")
        .sort({ createdAt: -1 });

    res.json({ success: true, data });
};

module.exports = {
    createTransfer,
    sendForApproval,
    approveTransfer,
    rejectTransfer,
    getTransfers
}