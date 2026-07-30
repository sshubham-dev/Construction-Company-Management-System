const VoucherBuilder = require("./VoucherBuilder");
const AppError = require("../AppError");

const buildPurchaseEntries = (purchase) => {

    if (!purchase)
        throw new AppError("Purchase Invoice is required.");

    if (!purchase.summary)
        throw new AppError("Purchase Summary is missing.");

    const builder = new VoucherBuilder();

    const costCenterId = purchase.costCenterId || null;

    /* =====================================
       PURCHASE ITEMS (DR)
    ===================================== */

    for (const item of purchase.items || []) {

        if (!item.ledgerId)
            throw new AppError(
                `Purchase Ledger missing for "${item.itemName}".`
            );

        builder.debit(

            item.ledgerId,

            item.taxableAmount,

            costCenterId

        );

    }

    /* =====================================
       CHARGES (DR)
    ===================================== */

    for (const charge of purchase.charges || []) {

        if (!charge.ledgerId)
            throw new AppError(
                `Charge Ledger missing for "${charge.name}".`
            );

        builder.debit(

            charge.ledgerId,

            charge.taxableAmount,

            costCenterId

        );

    }

    /* =====================================
       GST INPUT LEDGERS (DR)
    ===================================== */

    for (const gst of purchase.summary.gstSummary || []) {

        builder.debit(
            gst.cgstLedgerId,
            gst.cgst,
            costCenterId
        );

        builder.debit(
            gst.sgstLedgerId,
            gst.sgst,
            costCenterId
        );

        builder.debit(
            gst.igstLedgerId,
            gst.igst,
            costCenterId
        );

        builder.debit(
            gst.cessLedgerId,
            gst.cess,
            costCenterId
        );

    }

    /* =====================================
       PARTY LEDGER (CR)
    ===================================== */

    if (!purchase.partyLedgerId)
        throw new AppError(
            "Party Ledger is required."
        );

    builder.credit(

        purchase.partyLedgerId,

        purchase.summary.grandTotal,

        costCenterId

    );

    return builder.build();

};


const buildSalesReturnEntries = (purchase) => {

    if (!purchase)
        throw new AppError("Purchase Invoice is required.");

    if (!purchase.summary)
        throw new AppError("Purchase Summary is missing.");

    const builder = new VoucherBuilder();

    const costCenterId = purchase.costCenterId || null;

    /* =====================================
       PURCHASE ITEMS (DR)
    ===================================== */

    for (const item of purchase.items || []) {

        if (!item.ledgerId)
            throw new AppError(
                `Purchase Ledger missing for "${item.itemName}".`
            );

        builder.debit(

            item.ledgerId,

            item.taxableAmount,

            costCenterId

        );

    }

    /* =====================================
       CHARGES (DR)
    ===================================== */

    for (const charge of purchase.charges || []) {

        if (!charge.ledgerId)
            throw new AppError(
                `Charge Ledger missing for "${charge.name}".`
            );

        builder.debit(

            charge.ledgerId,

            charge.taxableAmount,

            costCenterId

        );

    }

    /* =====================================
       GST INPUT LEDGERS (DR)
    ===================================== */

    for (const gst of purchase.summary.gstSummary || []) {

        builder.debit(
            gst.cgstLedgerId,
            gst.cgst,
            costCenterId
        );

        builder.debit(
            gst.sgstLedgerId,
            gst.sgst,
            costCenterId
        );

        builder.debit(
            gst.igstLedgerId,
            gst.igst,
            costCenterId
        );

        builder.debit(
            gst.cessLedgerId,
            gst.cess,
            costCenterId
        );

    }

    /* =====================================
       PARTY LEDGER (CR)
    ===================================== */

    if (!purchase.partyLedgerId)
        throw new AppError(
            "Party Ledger is required."
        );

    builder.credit(

        purchase.partyLedgerId,

        purchase.summary.grandTotal,

        costCenterId

    );

    return builder.build();

};


const buildSalesEntries = (sales) => {

    if (!sales)
        throw new AppError("Purchase Invoice is required.");

    if (!sales.summary)
        throw new AppError("Purchase Summary is missing.");

    const builder = new VoucherBuilder();

    const costCenterId = sales.costCenterId || null;

    /* =====================================
       PURCHASE ITEMS (DR)
    ===================================== */

    for (const item of sales.items || []) {

        if (!item.ledgerId)
            throw new AppError(
                `Purchase Ledger missing for "${item.itemName}".`
            );

        builder.credit(

            item.ledgerId,

            item.taxableAmount,

            costCenterId

        );

    }

    /* =====================================
       CHARGES (DR)
    ===================================== */

    for (const charge of sales.charges || []) {

        if (!charge.ledgerId)
            throw new AppError(
                `Charge Ledger missing for "${charge.name}".`
            );

        builder.credit(

            charge.ledgerId,

            charge.taxableAmount,

            costCenterId

        );

    }

    /* =====================================
       GST INPUT LEDGERS (DR)
    ===================================== */

    for (const gst of sales.summary.gstSummary || []) {

        builder.credit(
            gst.cgstLedgerId,
            gst.cgst,
            costCenterId
        );

        builder.credit(
            gst.sgstLedgerId,
            gst.sgst,
            costCenterId
        );

        builder.credit(
            gst.igstLedgerId,
            gst.igst,
            costCenterId
        );

        builder.credit(
            gst.cessLedgerId,
            gst.cess,
            costCenterId
        );

    }

    /* =====================================
       PARTY LEDGER (CR)
    ===================================== */

    if (!sales.partyLedgerId)
        throw new AppError(
            "Party Ledger is required."
        );

    builder.debit(

        sales.partyLedgerId,

        sales.summary.grandTotal,

        costCenterId

    );

    return builder.build();

};


const buildPurchaseReturnEntries = (sales) => {

    if (!sales)
        throw new AppError("Purchase Invoice is required.");

    if (!sales.summary)
        throw new AppError("Purchase Summary is missing.");

    const builder = new VoucherBuilder();

    const costCenterId = sales.costCenterId || null;

    /* =====================================
       PURCHASE ITEMS (DR)
    ===================================== */

    for (const item of sales.items || []) {

        if (!item.ledgerId)
            throw new AppError(
                `Purchase Ledger missing for "${item.itemName}".`
            );

        builder.credit(

            item.ledgerId,

            item.taxableAmount,

            costCenterId

        );

    }

    /* =====================================
       CHARGES (DR)
    ===================================== */

    for (const charge of sales.charges || []) {

        if (!charge.ledgerId)
            throw new AppError(
                `Charge Ledger missing for "${charge.name}".`
            );

        builder.credit(

            charge.ledgerId,

            charge.taxableAmount,

            costCenterId

        );

    }

    /* =====================================
       GST INPUT LEDGERS (DR)
    ===================================== */

    for (const gst of sales.summary.gstSummary || []) {

        builder.credit(
            gst.cgstLedgerId,
            gst.cgst,
            costCenterId
        );

        builder.credit(
            gst.sgstLedgerId,
            gst.sgst,
            costCenterId
        );

        builder.credit(
            gst.igstLedgerId,
            gst.igst,
            costCenterId
        );

        builder.credit(
            gst.cessLedgerId,
            gst.cess,
            costCenterId
        );

    }

    /* =====================================
       PARTY LEDGER (CR)
    ===================================== */

    if (!sales.partyLedgerId)
        throw new AppError(
            "Party Ledger is required."
        );

    builder.debit(

        sales.partyLedgerId,

        sales.summary.grandTotal,

        costCenterId

    );

    return builder.build();

};


module.exports = { buildPurchaseEntries, buildSalesEntries, buildSalesReturnEntries, buildPurchaseReturnEntries };