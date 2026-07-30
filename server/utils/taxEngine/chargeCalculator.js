// utils/accounting/taxEngine/chargeCalculator.js

const {
    round,
    calculateGST,
    validateTaxData
} = require("./helpers");

const calculateChargeTaxes = ({
    charges = [],
    taxType = "INTRA",
    precision = 2
}) => {

    let totals = {

        taxableAmount: 0,

        totalCGST: 0,
        totalSGST: 0,
        totalIGST: 0,
        totalCESS: 0,

        totalGST: 0,

        amount: 0

    };

    const calculatedCharges = charges.map((charge) => {

        validateTaxData({
            quantity: 0,
            rate: 0,
            discount: 0,
            gstRate: charge.gstRate,
            cessRate: charge.cessRate
        });

        const taxableAmount = round(
            Number(charge.taxableAmount || 0),
            precision
        );

        const gst = calculateGST({

            taxableAmount,

            gstRate: charge.gstRate,

            cessRate: charge.cessRate,

            taxType

        });

        const amount = round(
            taxableAmount + gst.totalGST,
            precision
        );

        totals.taxableAmount += taxableAmount;

        totals.totalCGST += gst.cgstAmount;
        totals.totalSGST += gst.sgstAmount;
        totals.totalIGST += gst.igstAmount;
        totals.totalCESS += gst.cessAmount;

        totals.totalGST += gst.totalGST;

        totals.amount += amount;

        return {

            ...charge,

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

    Object.keys(totals).forEach((key) => {
        totals[key] = round(totals[key], precision);
    });

    return {
        charges: calculatedCharges,
        totals
    };

};

module.exports = calculateChargeTaxes;