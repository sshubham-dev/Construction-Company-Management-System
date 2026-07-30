// utils/accounting/taxEngine/itemCalculator.js

const {
    round,
    calculateTaxable,
    calculateGST,
    validateTaxData
} = require("./helpers");

const calculateItemTaxes = ({
    items = [],
    taxType = "INTRA",
    priceType = "EXCLUSIVE",
    precision = 2
}) => {

    let totals = {
        grossAmount: 0,
        discount: 0,
        taxableAmount: 0,

        totalCGST: 0,
        totalSGST: 0,
        totalIGST: 0,
        totalCESS: 0,

        totalGST: 0,
        amount: 0
    };

    const calculatedItems = items.map((item) => {

        validateTaxData({
            quantity: item.quantity,
            rate: item.rate,
            discount: item.discount,
            gstRate: item.gstRate,
            cessRate: item.cessRate
        });

        //-----------------------------------
        // Taxable Amount
        //-----------------------------------

        const taxable = calculateTaxable({
            quantity: item.quantity,
            rate: item.rate,
            discount: item.discount,
            gstRate: item.gstRate,
            priceType
        });

        //-----------------------------------
        // GST Calculation
        //-----------------------------------

        const gst = calculateGST({
            taxableAmount: taxable.taxableAmount,
            gstRate: item.gstRate,
            cessRate: item.cessRate,
            taxType
        });

        //-----------------------------------
        // Final Amount
        //-----------------------------------

        const amount = round(
            taxable.taxableAmount +
            gst.totalGST,
            precision
        );

        //-----------------------------------
        // Running Totals
        //-----------------------------------

        totals.grossAmount += taxable.grossAmount;
        totals.discount += taxable.discount;
        totals.taxableAmount += taxable.taxableAmount;

        totals.totalCGST += gst.cgstAmount;
        totals.totalSGST += gst.sgstAmount;
        totals.totalIGST += gst.igstAmount;
        totals.totalCESS += gst.cessAmount;

        totals.totalGST += gst.totalGST;
        totals.amount += amount;

        //-----------------------------------
        // Return Updated Item
        //-----------------------------------

        return {

            ...item,

            grossAmount: taxable.grossAmount,

            taxableAmount: taxable.taxableAmount,

            cgstRate: gst.cgstRate,
            sgstRate: gst.sgstRate,
            igstRate: gst.igstRate,

            cgstAmount: gst.cgstAmount,
            sgstAmount: gst.sgstAmount,
            igstAmount: gst.igstAmount,
            cessAmount: gst.cessAmount,

            amount
        };

    });

    //-----------------------------------
    // Round Totals
    //-----------------------------------

    Object.keys(totals).forEach(key => {
        totals[key] = round(totals[key], precision);
    });

    return {
        items: calculatedItems,
        totals
    };

};

module.exports = calculateItemTaxes;