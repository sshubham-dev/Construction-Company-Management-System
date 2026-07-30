const mongoose = require("mongoose");
const Invoice = require("../../models/invoice.models");
const validateInvoicePosting = require("../ERP/voucher/validateInvoicePosting.service");
const { buildInvoiceEntries } = require("../../utils/voucher/buildInvoiceEntries");
const { createVoucher, cancelVoucher } = require("../ERP/voucher/voucher.service");

// const postInventory = require("../../utils/inventory/postInventory");
// const createOutstanding = require("../../utils/accounting/outstanding/createOutstanding");

const BillAllocation = require("../../models/BillAllocation.models");

const { generateVoucherNo, rebuildVoucherNumbers } = require("../../utils/voucher/voucherNoGenerator");
const getFinancialYear = require("../../utils/voucher/getFinancialYear");
const AppError = require("../../utils/AppError");
const { calculateSummary } = require("../../utils/taxEngine/summary")

// Yes
const createPurchase = async (data, user) => {

    /* ==========================
       VALIDATION
    ========================== */

    if (!data.partyLedgerId)
        throw new AppError("Supplier is required.");

    if (!data.invoiceDate)
        throw new AppError("Invoice Date is required.");

    if (new Date(data.invoiceDate) > new Date())
        throw new AppError("Invoice Date cannot be in the future.");

    if (!["INTRA", "INTER"].includes(data.taxType))
        throw new AppError("Invalid Tax Type.");

    data.priceType = data.priceType || "EXCLUSIVE";

    if (!["EXCLUSIVE", "INCLUSIVE"].includes(data.priceType))
        throw new AppError("Invalid Price Type.");

    if (!Array.isArray(data.items) || data.items.length === 0)
        throw new AppError("At least one item is required.");

    /* ==========================
       ITEM VALIDATION
    ========================== */

    for (const item of data.items) {

        if (!item.itemType)
            throw new AppError("Item Type is required.");

        if (item.itemType !== "SERVICE" && !item.itemId)
            throw new AppError("Item is required.");

        if (!item.purchaseLedgerId)
            throw new AppError("Purchase Ledger is required.");

        if (Number(item.quantity) <= 0)
            throw new AppError("Quantity must be greater than zero.");

        if (Number(item.rate) < 0)
            throw new AppError("Rate cannot be negative.");

    }

    /* ==========================
       CHARGE VALIDATION
    ========================== */

    if (Array.isArray(data.charges)) {

        for (const charge of data.charges) {

            if (!charge.ledgerId)
                throw new AppError("Charge Ledger is required.");

            if (Number(charge.taxableAmount) < 0)
                throw new AppError("Charge Amount cannot be negative.");

        }

    } else {

        data.charges = [];

    }

    /* ==========================
       DUPLICATE SUPPLIER INVOICE
    ========================== */

    if (data.invoiceNo) {

        const duplicate = await Invoice.findOne({

            companyId: user.companyId,

            partyLedgerId: data.partyLedgerId,

            invoiceNo: data.invoiceNo.trim()

        });

        if (duplicate)
            throw new AppError("Supplier Invoice already exists.");

    }

    /* ==========================
       FINANCIAL YEAR
    ========================== */

    const fy = getFinancialYear(data.invoiceDate);

    /* ==========================
       PURCHASE NUMBER
    ========================== */

    const documentNo = await generateVoucherNo({

        companyId: user.companyId,

        type: "PURCHASEINV",

        fy: fy.code

    });

    /* ==========================
       TAX CALCULATION
    ========================== */

    const taxResult = calculateSummary({

        items: data.items,

        charges: data.charges,

        taxType: data.taxType,

        priceType: data.priceType,

        roundOff: data.summary?.roundOff || 0

    });

    /* ==========================
       CREATE PURCHASE
    ========================== */

    const purchase = await Invoice.create({

        documentNo,

        companyId: user.companyId,

        storeId: data.storeId || null,

        fy: fy.code,

        type: "PURCHASE",

        taxType: data.taxType,

        priceType: data.priceType,

        dueDate: data.dueDate || null,

        source: data.source || "MANUAL",

        partyLedgerId: data.partyLedgerId,

        invoiceNo:
            data.invoiceNo?.trim() || null,

        invoiceDate: data.invoiceDate,

        costCenterId: data.costCenterId || null,

        purchaseOrderId: data.purchaseOrderId || null,

        grnId: data.grnId || null,

        items: taxResult.items,

        charges: taxResult.charges,

        summary: taxResult.summary,

        outstandingAmount:
            taxResult.summary.grandTotal,

        narration: data.narration || "",

        paymentTerms: data.paymentTerms || "",

        status: "DRAFT",

        createdBy: user._id

    });

    return purchase;

};


const updatePurchase = async (id, data, user) => {

    /* ==========================
       FIND PURCHASE
    ========================== */

    const purchase = await Invoice.findById(id);

    if (!purchase)
        throw new AppError("Purchase Invoice not found.", 404);

    /* ==========================
       ONLY DRAFT CAN BE UPDATED
    ========================== */

    if (purchase.status !== "DRAFT")
        throw new AppError(
            `Purchase cannot be updated because it is ${purchase.status}.`
        );

    /* ==========================
       VALIDATION
    ========================== */

    if (!data.partyLedgerId)
        throw new AppError("Supplier is required.");

    if (!data.invoiceDate)
        throw new AppError("Invoice Date is required.");

    if (new Date(data.invoiceDate) > new Date())
        throw new AppError("Invoice Date cannot be in future.");

    if (!["INTRA", "INTER"].includes(data.taxType))
        throw new AppError("Invalid Tax Type.");

    data.priceType = data.priceType || "EXCLUSIVE";

    if (!["EXCLUSIVE", "INCLUSIVE"].includes(data.priceType))
        throw new AppError("Invalid Price Type.");

    if (!Array.isArray(data.items) || data.items.length === 0)
        throw new AppError("At least one item is required.");

    /* ==========================
       ITEM VALIDATION
    ========================== */

    for (const item of data.items) {

        if (!item.itemType)
            throw new AppError("Item Type is required.");

        if (item.itemType !== "SERVICE" && !item.itemId)
            throw new AppError("Item is required.");

        if (!item.ledgerId)
            throw new AppError("Purchase Ledger is required.");

        if (Number(item.quantity) <= 0)
            throw new AppError("Quantity must be greater than zero.");

        if (Number(item.rate) < 0)
            throw new AppError("Rate cannot be negative.");

    }

    /* ==========================
       CHARGE VALIDATION
    ========================== */

    if (Array.isArray(data.charges)) {

        for (const charge of data.charges) {

            if (!charge.ledgerId)
                throw new AppError("Charge Ledger is required.");

            if (Number(charge.taxableAmount) < 0)
                throw new AppError("Charge Amount cannot be negative.");

        }

    } else {

        data.charges = [];

    }

    /* ==========================
       DUPLICATE INVOICE CHECK
    ========================== */

    if (data.invoiceNo) {

        const duplicate = await Invoice.findOne({

            _id: { $ne: id },

            companyId: user.companyId,

            partyLedgerId: data.partyLedgerId,

            invoiceNo: data.invoiceNo.trim()

        });

        if (duplicate)
            throw new AppError("Supplier Invoice already exists.");

    }

    /* ==========================
       TAX CALCULATION
    ========================== */

    const taxResult = calculateSummary({

        items: data.items,

        charges: data.charges,

        taxType: data.taxType,

        priceType: data.priceType,

        roundOff: data.summary?.roundOff || 0

    });

    /* ==========================
       UPDATE PURCHASE
    ========================== */

    purchase.storeId = data.storeId ?? purchase.storeId;

    purchase.taxType = data.taxType;

    purchase.priceType = data.priceType;

    purchase.dueDate = data.dueDate ?? null;

    purchase.source = data.source ?? purchase.source;

    purchase.partyLedgerId = data.partyLedgerId;

    purchase.invoiceNo =
        data.invoiceNo?.trim() || null;

    purchase.invoiceDate = data.invoiceDate;

    purchase.costCenterId =
        data.costCenterId ?? null;

    purchase.purchaseOrderId =
        data.purchaseOrderId ?? null;

    purchase.grnId =
        data.grnId ?? null;

    purchase.items = taxResult.items;

    purchase.charges = taxResult.charges;

    purchase.summary = taxResult.summary;

    purchase.outstandingAmount =
        purchase.summary.grandTotal -
        purchase.paidAmount;

    purchase.narration =
        data.narration ?? "";

    purchase.paymentTerms =
        data.paymentTerms ?? "";

    purchase.updatedBy = user._id;

    await purchase.save();

    return purchase;

};

// Yes
const getPurchases = async (query, user) => {

    const {
        page = 1,
        limit = 10,
        search = "",
        status,
        partyLedgerId,
        costCenterId,
        fromDate,
        toDate,
    } = query;

    const filter = {
        companyId: user.companyId,
    };

    if (status) filter.status = status;

    if (partyLedgerId) filter.partyLedgerId = partyLedgerId;

    if (costCenterId) filter.costCenterId = costCenterId;

    if (fromDate || toDate) {

        filter.invoiceDate = {};

        if (fromDate)
            filter.invoiceDate.$gte = new Date(fromDate);

        if (toDate)
            filter.invoiceDate.$lte = new Date(toDate);

    }

    if (search) {

        filter.$or = [

            {
                documentNo: {
                    $regex: search,
                    $options: "i",
                },
            },

            {
                invoiceNo: {
                    $regex: search,
                    $options: "i",
                },
            },

        ];

    }

    const purchases = await Invoice.find(filter)
        .populate("partyLedgerId", "name")
        .populate("storeId", "name")
        .populate("items.purchaseLedgerId", "name")
        .populate("items.inventoryLedgerId", "name")
        .populate("items.issueLedgerId", "name")
        .populate("costCenterId", "name")
        .populate("createdBy", "userName")

        .sort({ invoiceDate: -1, createdAt: -1 })

        .skip((page - 1) * limit)

        .limit(Number(limit))

        .lean();

    const total = await Purchase.countDocuments(filter);

    return {
        purchases,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
    };

};

// Yes
const getPurchaseById = async (id, user) => {

    const purchase = await Invoice.findById(id)
        .populate("partyLedgerId")
        .populate("storeId")
        .populate("items.purchaseLedgerId")
        .populate("items.inventoryLedgerId")
        .populate("items.issueLedgerId")
        .populate("costCenterId")
        .populate("purchaseOrderId")
        .populate("grnId")

        .populate("items.itemId")

        .populate("charges.ledgerId")

        .populate("createdBy", "userName")
        .populate("postedBy", "userName")
        .populate("cancelledBy", "userName");

    if (!purchase)
        throw new AppError("Purchase not found", 404);

    return purchase;

};


const deletePurchase = async (id, user) => {
    // Find Purchase
    const purchase = await Invoice.findOne({
        _id: id,
        companyId: user.companyId,
    });

    if (!purchase) {
        throw new AppError("Purchase invoice not found.", 404);
    }

    // Only Draft can be deleted
    if (purchase.status !== "DRAFT") {
        throw new AppError(
            "Only draft purchase invoices can be deleted.",
            400
        );
    }

    await Invoice.findByIdAndDelete(id);

    return {
        deleted: true,
        documentNo: purchase.documentNo,
    };
};


const postPurchase = async (purchaseId, userId) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 1. Load Purchase
        const purchase = await Invoice.findById(purchaseId).session(session);

        // 2. Validate
        await validateInvoicePosting(purchase);

        // 3. Build Voucher Entries
        const entries = buildInvoiceEntries(purchase);

        // 4. Create Voucher
        const voucher = await createVoucher({
            type: "PURCHASE",
            date: purchase.invoiceDate,
            companyId: purchase.companyId,
            narration: purchase.narration,
            referenceType: "INVOICE",
            referenceId: purchase._id,
            entries,
            status: "DRAFT",
            createdBy: userId,
        }, session);

        // 5. Inventory Posting
        // await postInventory({
        //     purchase,
        //     voucher,
        //     session,
        // });

        // 6. Update Purchase
        purchase.voucherId = voucher._id;
        purchase.status = "POSTED";
        purchase.postedBy = userId;
        purchase.postedAt = new Date();

        await purchase.save({ session });

        await session.commitTransaction();

        return voucher;

    } catch (error) {

        await session.abortTransaction();
        throw error;

    } finally {

        session.endSession();

    }
};


const cancelPurchase = async (purchaseId, user) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        /* ===========================
           GET PURCHASE
        =========================== */

        const purchase = await Invoice.findById(purchaseId).session(session);

        if (!purchase) {
            throw new Error("Purchase not found.");
        }

        /* ===========================
           VALIDATE STATUS
        =========================== */

        if (purchase.status === "DRAFT") {
            throw new Error("Draft purchase cannot be cancelled.");
        }

        if (purchase.status === "CANCELLED") {
            throw new Error("Purchase already cancelled.");
        }

        if (purchase.status !== "POSTED") {
            throw new Error("Only posted purchases can be cancelled.");
        }

        /* ===========================
           CHECK PAYMENT ALLOCATION
        =========================== */

        const allocationExists = await BillAllocation.exists({
            billType: "PURCHASE",
            billId: purchase._id,
        }).session(session);

        if (allocationExists) {
            throw new Error(
                "Purchase cannot be cancelled because payments have already been allocated."
            );
        }

        /* ===========================
           CANCEL VOUCHER
        =========================== */

        await cancelVoucher(
            purchase.voucherId,
            session,
            user._id
        );

        /* ===========================
           CANCEL PURCHASE
        =========================== */

        purchase.status = "CANCELLED";
        purchase.cancelledAt = new Date();
        purchase.cancelledBy = user._id;

        await purchase.save({ session });

        /* ===========================
           COMMIT
        =========================== */

        await session.commitTransaction();

        return {
            success: true,
            message: "Purchase cancelled successfully.",
            purchase,
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};


module.exports = { createPurchase, updatePurchase, getPurchases, getPurchaseById, deletePurchase, postPurchase, cancelPurchase };
