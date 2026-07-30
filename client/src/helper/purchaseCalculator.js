/* ===========================================================
   PURCHASE CALCULATION ENGINE
   Used By:
   - Purchase Invoice
   - Purchase Return
   - GRN Billing
=========================================================== */

const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

const round = (value) => Number(value.toFixed(2));

/* ===========================================================
   Calculate Single Item
=========================================================== */

export const calculateItem = (item) => {
    const qty = toNumber(item.qty);
    const rate = toNumber(item.rate);

    const discount = toNumber(item.discount);

    const gstRate = toNumber(item.gstRate);

    const basicAmount = qty * rate;

    const taxableAmount = Math.max(
        basicAmount - discount,
        0
    );

    const gstAmount = taxableAmount * gstRate / 100;

    const totalAmount = taxableAmount + gstAmount;

    return {
        ...item,

        basicAmount: round(basicAmount),

        taxableAmount: round(taxableAmount),

        gstAmount: round(gstAmount),

        amount: round(totalAmount),
    };
};

/* ===========================================================
   Calculate Entire Item List
=========================================================== */

export const calculateItems = (items = []) => {
    return items.map(calculateItem);
};

/* ===========================================================
   Bill Summary
=========================================================== */

export const calculateSummary = (
    items = [],
    extra = {}
) => {
    const freight = toNumber(extra.freight);

    const loading = toNumber(extra.loading);

    const otherCharges = toNumber(extra.otherCharges);

    const roundOff = toNumber(extra.roundOff);

    const subTotal = items.reduce(
        (sum, item) => sum + toNumber(item.basicAmount),
        0
    );

    const discount = items.reduce(
        (sum, item) => sum + toNumber(item.discount),
        0
    );

    const taxableAmount = items.reduce(
        (sum, item) => sum + toNumber(item.taxableAmount),
        0
    );

    const gstAmount = items.reduce(
        (sum, item) => sum + toNumber(item.gstAmount),
        0
    );

    const cgst = gstAmount / 2;

    const sgst = gstAmount / 2;

    const igst = 0;

    const grandTotal =
        taxableAmount +
        freight +
        loading +
        otherCharges +
        gstAmount +
        roundOff;

    return {
        subTotal: round(subTotal),

        discount: round(discount),

        freight: round(freight),

        loading: round(loading),

        otherCharges: round(otherCharges),

        taxableAmount: round(taxableAmount),

        cgst: round(cgst),

        sgst: round(sgst),

        igst: round(igst),

        gstAmount: round(gstAmount),

        roundOff: round(roundOff),

        grandTotal: round(grandTotal),
    };
};

/* ===========================================================
   Ledger Preview
=========================================================== */

export const generateLedgerEntries = (
    summary,
    supplierName = "Supplier",
    purchaseLedger = "Purchase Account"
) => {
    const entries = [];

    if (summary.taxableAmount > 0) {
        entries.push({
            ledger: purchaseLedger,
            type: "DEBIT",
            amount: summary.taxableAmount,
        });
    }

    if (summary.cgst > 0) {
        entries.push({
            ledger: "Input CGST",
            type: "DEBIT",
            amount: summary.cgst,
        });
    }

    if (summary.sgst > 0) {
        entries.push({
            ledger: "Input SGST",
            type: "DEBIT",
            amount: summary.sgst,
        });
    }

    if (summary.igst > 0) {
        entries.push({
            ledger: "Input IGST",
            type: "DEBIT",
            amount: summary.igst,
        });
    }

    entries.push({
        ledger: supplierName,
        type: "CREDIT",
        amount: summary.grandTotal,
    });

    return entries;
};

/* ===========================================================
   Outstanding Preview
=========================================================== */

export const calculateOutstanding = ({
    currentOutstanding = 0,
    invoiceAmount = 0,
    openBills = 0,
    lastPayment = 0,
    lastPaymentDate = "",
    paymentTerms = "",
    dueDate = "",
}) => ({
    currentOutstanding: round(currentOutstanding),

    currentInvoice: round(invoiceAmount),

    outstandingAfterPosting: round(
        currentOutstanding + invoiceAmount
    ),

    openBills,

    lastPayment,

    lastPaymentDate,

    paymentTerms,

    dueDate,
});

/* ===========================================================
   Complete Purchase Calculation
=========================================================== */

export const calculatePurchaseInvoice = ({
    items = [],
    charges = {},
    supplierName = "Supplier",
}) => {
    const calculatedItems = calculateItems(items);

    const summary = calculateSummary(
        calculatedItems,
        charges
    );

    const ledgerEntries = generateLedgerEntries(
        summary,
        supplierName
    );

    return {
        items: calculatedItems,

        summary,

        ledgerEntries,
    };
};