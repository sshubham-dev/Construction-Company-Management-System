// utils/accounting/taxEngine/gstSummary.js

const { round } = require("./helpers");

/**
 * Build GST Summary
 *
 * Groups items and charges by:
 * GST Rate
 * +
 * CESS Rate
 *
 * Returns one row per GST slab.
 */

const buildGSTSummary = ({
    items = [],
    charges = [],
    precision = 2
}) => {

    const summaryMap = new Map();

    const rows = [
        ...items.map(item => ({ ...item, type: "ITEM" })),
        ...charges.map(charge => ({ ...charge, type: "CHARGE" }))
    ];

    rows.forEach((row) => {

        const gstRate = Number(row.gstRate || 0);
        const cessRate = Number(row.cessRate || 0);

        // Group only by tax slab
        const key = `${gstRate}_${cessRate}`;
        if (!summaryMap.has(key)) {

            summaryMap.set(key, {

                gstRate,
                cessRate,

                cgstRate: Number(row.cgstRate || 0),
                sgstRate: Number(row.sgstRate || 0),
                igstRate: Number(row.igstRate || 0),

                taxableAmount: 0,

                cgst: 0,
                sgst: 0,
                igst: 0,
                cess: 0,

                totalGST: 0,

                itemCount: 0,
                chargeCount: 0

            });

        }

        const summary = summaryMap.get(key);

        summary.taxableAmount += Number(row.taxableAmount || 0);

        summary.cgst += Number(row.cgstAmount || 0);
        summary.sgst += Number(row.sgstAmount || 0);
        summary.igst += Number(row.igstAmount || 0);
        summary.cess += Number(row.cessAmount || 0);

        // Use already calculated totalGST if available
        summary.totalGST += Number(
            row.totalGST ??
            (
                Number(row.cgstAmount || 0) +
                Number(row.sgstAmount || 0) +
                Number(row.igstAmount || 0) +
                Number(row.cessAmount || 0)
            )
        );

        if (row.type === "ITEM") {
            summary.itemCount++;
        } else {
            summary.chargeCount++;
        }

    });

    return Array.from(summaryMap.values())
    sort((a, b) => {
        if (a.gstRate !== b.gstRate) {
            return a.gstRate - b.gstRate;
        }
        return a.cessRate - b.cessRate;
    })
        .map(summary => ({

            ...summary,

            taxableAmount: round(summary.taxableAmount, precision),

            cgst: round(summary.cgst, precision),
            sgst: round(summary.sgst, precision),
            igst: round(summary.igst, precision),
            cess: round(summary.cess, precision),

            totalGST: round(summary.totalGST, precision)

        }));

};

module.exports = buildGSTSummary;