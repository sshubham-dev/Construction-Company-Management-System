// services/Collection/dashboard.service.js
const mongoose = require("mongoose");
const Collection = require("../../models/collection.models");

const MONTHS = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

/* ===========================================================
   BUILD FILTER
=========================================================== */

function buildMatch({
    companyId,
    fromDate,
    toDate,
    departmentId,
    businessUnitId,
    costCenterId,
}) {
    const match = {
        companyId: new mongoose.Types.ObjectId(companyId),
    };

    if (departmentId) {
        match.departmentId = new mongoose.Types.ObjectId(departmentId);
    }

    if (businessUnitId) {
        match.businessUnitId = new mongoose.Types.ObjectId(businessUnitId);
    }

    if (costCenterId) {
        match.costCenterId = new mongoose.Types.ObjectId(costCenterId);
    }

    if (fromDate || toDate) {
        match.date = {};

        if (fromDate) {
            match.date.$gte = new Date(fromDate);
        }

        if (toDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            match.date.$lte = end;
        }
    }

    return match;
}

/* ===========================================================
   KPI CARDS
=========================================================== */

async function getCards(match) {
    const result = await Collection.aggregate([
        {
            $match: match,
        },
        {
            $facet: {
                overall: [
                    {
                        $group: {
                            _id: null,
                            totalCollection: {
                                $sum: "$amount",
                            },
                            totalTransactions: {
                                $sum: 1,
                            },
                        },
                    },
                ],

                pending: [
                    {
                        $match: {
                            status: "pending",
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            amount: {
                                $sum: "$amount",
                            },
                            transactions: {
                                $sum: 1,
                            },
                        },
                    },
                ],

                approved: [
                    {
                        $match: {
                            status: "approved",
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            amount: {
                                $sum: "$amount",
                            },
                            transactions: {
                                $sum: 1,
                            },
                        },
                    },
                ],
            },
        },
    ]);

    const overall = result[0]?.overall?.[0] || {};
    const pending = result[0]?.pending?.[0] || {};
    const approved = result[0]?.approved?.[0] || {};

    return {
        totalCollection: overall.totalCollection || 0,

        totalTransactions: overall.totalTransactions || 0,

        averageCollection:
            overall.totalTransactions > 0
                ? Number(
                    (
                        overall.totalCollection /
                        overall.totalTransactions
                    ).toFixed(2)
                )
                : 0,

        pendingAmount: pending.amount || 0,

        pendingTransactions:
            pending.transactions || 0,

        approvedAmount:
            approved.amount || 0,

        approvedTransactions:
            approved.transactions || 0,
    };
}

/* ===========================================================
   DEPARTMENT REVENUE
=========================================================== */

async function getDepartmentRevenue(match) {
    const rows = await Collection.aggregate([
        {
            $match: match,
        },

        // Group by Department + Cost Center
        {
            $group: {
                _id: {
                    departmentId: "$departmentId",
                    costCenterId: "$costCenterId",
                },

                amount: {
                    $sum: "$amount",
                },

                transactions: {
                    $sum: 1,
                },
            },
        },

        // Cost Center
        {
            $lookup: {
                from: "costcenters",
                localField: "_id.costCenterId",
                foreignField: "_id",
                as: "costCenter",
            },
        },

        {
            $unwind: {
                path: "$costCenter",
                preserveNullAndEmptyArrays: true,
            },
        },

        // Department
        {
            $lookup: {
                from: "costcenters",
                localField: "_id.departmentId",
                foreignField: "_id",
                as: "department",
            },
        },

        {
            $unwind: {
                path: "$department",
                preserveNullAndEmptyArrays: true,
            },
        },

        // Regroup Department
        {
            $group: {
                _id: "$department._id",

                departmentName: {
                    $first: "$department.name",
                },

                amount: {
                    $sum: "$amount",
                },

                transactions: {
                    $sum: "$transactions",
                },

                services: {
                    $push: {
                        costCenterId: "$costCenter._id",
                        name: "$costCenter.name",
                        amount: "$amount",
                        transactions: "$transactions",
                    },
                },
            },
        },

        {
            $sort: {
                amount: -1,
            },
        },
    ]);

    const grandTotal = rows.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    return rows.map((item) => ({
        departmentId: item._id,

        name: item.departmentName,

        amount: item.amount,

        transactions: item.transactions,

        percentage:
            grandTotal === 0
                ? 0
                : Number(
                    (
                        (item.amount / grandTotal) *
                        100
                    ).toFixed(2)
                ),

        averageCollection:
            item.transactions === 0
                ? 0
                : Number(
                    (
                        item.amount /
                        item.transactions
                    ).toFixed(2)
                ),

        services: item.services.sort(
            (a, b) => b.amount - a.amount
        ),
    }));
}

/* ===========================================================
   MONTHLY TREND
=========================================================== */

async function getTrend(match, fromDate, toDate) {
    let isDaily = false;

    if (fromDate && toDate) {
        const start = new Date(fromDate);
        const end = new Date(toDate);

        const diff =
            (end.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24);

        isDaily = diff <= 31;
    }

    if (isDaily) {
        const rows = await Collection.aggregate([
            {
                $match: match,
            },

            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date",
                            },
                        },
                    },

                    amount: {
                        $sum: "$amount",
                    },

                    transactions: {
                        $sum: 1,
                    },
                },
            },

            {
                $sort: {
                    "_id.date": 1,
                },
            },
        ]);

        return {
            type: "daily",

            labels: rows.map((r) => r._id.date),

            data: rows.map((r) => ({
                label: r._id.date,
                amount: r.amount,
                transactions: r.transactions,
            })),
        };
    }

    const rows = await Collection.aggregate([
        {
            $match: match,
        },

        {
            $group: {
                _id: {
                    month: {
                        $month: "$date",
                    },

                    year: {
                        $year: "$date",
                    },
                },

                amount: {
                    $sum: "$amount",
                },

                transactions: {
                    $sum: 1,
                },
            },
        },

        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1,
            },
        },
    ]);

    return {
        type: "monthly",

        labels: rows.map(
            (r) => `${MONTHS[r._id.month]} ${r._id.year}`
        ),

        data: rows.map((r) => ({
            label: `${MONTHS[r._id.month]} ${r._id.year}`,
            amount: r.amount,
            transactions: r.transactions,
        })),
    };
}

/* ===========================================================
   TOP COST CENTERS
=========================================================== */

async function getTopCostCenters(
    match
) {
    return Collection.aggregate([
        {
            $match: match,
        },

        {
            $group: {
                _id:
                    "$costCenterId",

                amount: {
                    $sum:
                        "$amount",
                },

                transactions: {
                    $sum: 1,
                },
            },
        },

        {
            $lookup: {
                from:
                    "costcenters",

                localField:
                    "_id",

                foreignField:
                    "_id",

                as:
                    "costCenter",
            },
        },

        {
            $unwind:
                "$costCenter",
        },

        {
            $lookup: {
                from:
                    "costcenters",

                localField:
                    "costCenter.parentId",

                foreignField:
                    "_id",

                as:
                    "department",
            },
        },

        {
            $unwind: {
                path:
                    "$department",

                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $project: {
                _id: 0,

                costCenterId:
                    "$costCenter._id",

                name:
                    "$costCenter.name",

                department:
                    "$department.name",

                amount: 1,

                transactions: 1,
            },
        },

        {
            $sort: {
                amount: -1,
            },
        },

        {
            $limit: 10,
        },
    ]);
}

/* ===========================================================
   TOP CLIENTS
=========================================================== */

async function getTopClients(match) {
    return Collection.aggregate([
        {
            $match: match,
        },

        {
            $sort: {
                date: -1,
            },
        },

        {
            $group: {
                _id: "$clientLedgerId",

                amount: {
                    $sum: "$amount",
                },

                transactions: {
                    $sum: 1,
                },

                lastCollectionDate: {
                    $first: "$date",
                },

                medium: {
                    $first: "$medium",
                },
            },
        },

        {
            $lookup: {
                from: "ledgers",
                localField: "_id",
                foreignField: "_id",
                as: "ledger",
            },
        },

        {
            $unwind: "$ledger",
        },

        {
            $project: {
                _id: 0,

                ledgerId: "$ledger._id",

                name: "$ledger.name",

                phone: "$ledger.mailingDetails.phoneNo",

                email: "$ledger.mailingDetails.email",

                amount: 1,

                transactions: 1,

                averageCollection: {
                    $round: [
                        {
                            $divide: [
                                "$amount",
                                "$transactions",
                            ],
                        },
                        2,
                    ],
                },

                lastCollectionDate: 1,

                medium: 1,
            },
        },

        {
            $sort: {
                amount: -1,
            },
        },

        {
            $limit: 10,
        },
    ]);
}

/* ===========================================================
   COLLECTION MEDIUM
=========================================================== */
async function getCollectionMedium(match) {
    return Collection.aggregate([
        {
            $match: match,
        },

        {
            $group: {
                _id: "$medium",

                amount: {
                    $sum: "$amount",
                },

                transactions: {
                    $sum: 1,
                },
            },
        },

        {
            $project: {
                _id: 0,

                medium: "$_id",

                amount: 1,

                transactions: 1,
            },
        },

        {
            $sort: {
                amount: -1,
            },
        },
    ]);
}

/* ===========================================================
   RECENT COLLECTION
=========================================================== */
async function getRecentCollections(match) {
    return Collection.aggregate([
        {
            $match: match,
        },

        {
            $sort: {
                date: -1,
            },
        },

        {
            $limit: 20,
        },

        {
            $lookup: {
                from: "ledgers",
                localField: "clientLedgerId",
                foreignField: "_id",
                as: "client",
            },
        },

        {
            $unwind: "$client",
        },

        {
            $lookup: {
                from: "costcenters",
                localField: "costCenterId",
                foreignField: "_id",
                as: "costCenter",
            },
        },

        {
            $unwind: {
                path: "$costCenter",
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $project: {
                _id: 1,

                date: 1,

                amount: 1,

                status: 1,

                medium: 1,

                referenceNo: 1,

                narration: 1,

                client: "$client.name",

                costCenter: "$costCenter.name",
            },
        },
    ]);
}

/* ===========================================================
   MAIN
=========================================================== */

async function getCollectionDashboard(
    filters
) {
    const match =
        buildMatch(filters);

    const [
        cards,
        departmentRevenue,
        trend,
        topCostCenters,
        topClients,
    ] = await Promise.all([
        getCards(match),
        getDepartmentRevenue(match),
        getTrend(
            match,
            filters.fromDate,
            filters.toDate
        ),
        getTopCostCenters(match),
        getTopClients(match),
    ]);

    return {
        cards,
        departmentRevenue,
        trend,
        topCostCenters,
        topClients,
        filters,
    };
}

module.exports = {
    getCollectionDashboard,
};