const Invoice = require("../../../models/invoice.models");
const AppError = require("../../../utils/AppError");

const validateInvoicePosting = async (invoice) => {

    /* ==========================
       PURCHASE
    ========================== */

    if (!invoice)
        throw new AppError("Invoice not found.", 404);

    if (invoice.status !== "DRAFT")
        throw new AppError(
            `Invoice is already ${invoice.status}.`
        );

    /* ==========================
       SUPPLIER
    ========================== */

    if (!invoice.partyLedgerId)
        throw new AppError("Supplier is required.");

    /* ==========================
       ITEMS
    ========================== */

    if (!invoice.items || invoice.items.length === 0)
        throw new AppError("Invoice must contain at least one item.");

    /* ==========================
       TAX TYPE
    ========================== */

    if (!["INTRA", "INTER"].includes(invoice.taxType))
        throw new AppError("Invalid Tax Type.");

    /* ==========================
       PRICE TYPE
    ========================== */

    if (!["EXCLUSIVE", "INCLUSIVE"].includes(invoice.priceType))
        throw new AppError("Invalid Price Type.");

    /* ==========================
       GRAND TOTAL
    ========================== */

    if (
        !invoice.summary ||
        Number(invoice.summary.grandTotal) <= 0
    ) {
        throw new AppError("Invalid Invoice Amount.");
    }

    /* ==========================
       ITEM VALIDATION
    ========================== */

    for (const item of invoice.items) {

        if (!item.ledgerId)
            throw new AppError(
                `Invoice Ledger missing for item "${item.itemName}".`
            );

        if (Number(item.amount) <= 0)
            throw new AppError(
                `Invalid amount for item "${item.itemName}".`
            );

    }

    /* ==========================
       CHARGE VALIDATION
    ========================== */

    if (invoice.charges?.length) {

        for (const charge of invoice.charges) {

            if (!charge.ledgerId)
                throw new AppError(
                    `Ledger missing for charge "${charge.name}".`
                );

        }

    }

    return true;

};

module.exports = validateInvoicePosting;