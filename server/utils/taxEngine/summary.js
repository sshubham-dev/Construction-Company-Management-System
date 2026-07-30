// utils/accounting/taxEngine/summary.js

const { round } = require("./helpers");
const calculateItemTaxes = require("./itemCalculator");
const calculateChargeTaxes = require("./chargeCalculator");
const buildGSTSummary = require("./gstSummary");

const calculateSummary = ({
    items = [],
    charges = [],
    taxType = "INTRA",
    priceType = "EXCLUSIVE",
    roundOff = 0,
    precision = 2
}) => {

    //---------------------------------------
    // Item Calculation
    //---------------------------------------

    const itemResult = calculateItemTaxes({
        items,
        taxType,
        priceType,
        precision
    });

    //---------------------------------------
    // Charge Calculation
    //---------------------------------------

    const chargeResult = calculateChargeTaxes({
        charges,
        taxType,
        precision
    });

    //---------------------------------------
    // GST Summary
    //---------------------------------------

    const gstSummary = buildGSTSummary({
        items: itemResult.items,
        charges: chargeResult.charges,
        precision
    });

    //---------------------------------------
    // Meta Totals
    //---------------------------------------

    const meta = {

        grossAmount:
            itemResult.totals.grossAmount,

        discount:
            itemResult.totals.discount,

        taxableAmount:
            itemResult.totals.taxableAmount +
            chargeResult.totals.taxableAmount,

        totalCGST:
            itemResult.totals.totalCGST +
            chargeResult.totals.totalCGST,

        totalSGST:
            itemResult.totals.totalSGST +
            chargeResult.totals.totalSGST,

        totalIGST:
            itemResult.totals.totalIGST +
            chargeResult.totals.totalIGST,

        totalCESS:
            itemResult.totals.totalCESS +
            chargeResult.totals.totalCESS,

        totalGST:
            itemResult.totals.totalGST +
            chargeResult.totals.totalGST

    };

    //---------------------------------------
    // Round Meta
    //---------------------------------------

    Object.keys(meta).forEach((key) => {
        meta[key] = round(meta[key], precision);
    });

    //---------------------------------------
    // Grand Total
    //---------------------------------------

    const grandTotal = round(
        meta.taxableAmount +
        meta.totalGST +
        Number(roundOff || 0),
        precision
    );

    //---------------------------------------
    // Summary
    //---------------------------------------

    const summary = {

        subTotal: round(
            itemResult.totals.taxableAmount,
            precision
        ),

        discount: round(
            itemResult.totals.discount,
            precision
        ),

        gstSummary,

        chargeTotal: round(
            chargeResult.totals.taxableAmount,
            precision
        ),

        roundOff: round(
            roundOff,
            precision
        ),

        grandTotal

    };

    //---------------------------------------
    // Return
    //---------------------------------------

    return {

        items: itemResult.items,

        charges: chargeResult.charges,

        itemTotals: itemResult.totals,

        chargeTotals: chargeResult.totals,

        summary,

        meta

    };

};

module.exports = calculateSummary;