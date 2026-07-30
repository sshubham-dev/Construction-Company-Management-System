// utils/accounting/taxEngine/helpers.js

const round = (value, precision = 2) => {
    return Number((Number(value || 0)).toFixed(precision));
};

/**
 * Split GST based on tax type
 */
const splitGST = (gstRate = 0, taxType = "INTRA") => {
    gstRate = Number(gstRate);

    if (taxType === "INTER") {
        return {
            cgstRate: 0,
            sgstRate: 0,
            igstRate: gstRate
        };
    }

    return {
        cgstRate: gstRate / 2,
        sgstRate: gstRate / 2,
        igstRate: 0
    };
};

/**
 * Calculate taxable value
 */
const calculateTaxable = ({
    quantity = 0,
    rate = 0,
    discount = 0,
    priceType = "EXCLUSIVE",
    gstRate = 0
}) => {

    quantity = Number(quantity);
    rate = Number(rate);
    discount = Number(discount);
    gstRate = Number(gstRate);

    const grossAmount = round(quantity * rate);

    if (priceType === "INCLUSIVE") {

        const taxableAmount = round(
            (grossAmount - discount) /
            (1 + gstRate / 100)
        );

        return {
            grossAmount,
            taxableAmount,
            discount
        };
    }

    return {
        grossAmount,
        taxableAmount: round(grossAmount - discount),
        discount
    };
};

/**
 * Calculate GST Amount
 */
const calculateGST = ({
    taxableAmount = 0,
    gstRate = 0,
    cessRate = 0,
    taxType = "INTRA"
}) => {

    const {
        cgstRate,
        sgstRate,
        igstRate
    } = splitGST(gstRate, taxType);

    const cgstAmount = round(taxableAmount * cgstRate / 100);
    const sgstAmount = round(taxableAmount * sgstRate / 100);
    const igstAmount = round(taxableAmount * igstRate / 100);
    const cessAmount = round(taxableAmount * cessRate / 100);

    return {

        cgstRate,
        sgstRate,
        igstRate,

        cgstAmount,
        sgstAmount,
        igstAmount,
        cessAmount,

        totalGST:
            round(
                cgstAmount +
                sgstAmount +
                igstAmount +
                cessAmount
            )
    };
};

/**
 * Basic validation
 */
const validateTaxData = ({
    quantity,
    rate,
    discount,
    gstRate,
    cessRate
}) => {

    if (quantity < 0)
        throw new Error("Quantity cannot be negative");

    if (rate < 0)
        throw new Error("Rate cannot be negative");

    if (discount < 0)
        throw new Error("Discount cannot be negative");

    if (gstRate < 0)
        throw new Error("GST Rate cannot be negative");

    if (cessRate < 0)
        throw new Error("CESS Rate cannot be negative");
};

module.exports = {
    round,
    splitGST,
    calculateTaxable,
    calculateGST,
    validateTaxData
};