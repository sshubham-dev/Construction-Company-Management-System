const { Ledger, Group } = require("../../models/ledger.models"); 
const Voucher = require("../../models/voucher.models"); 
const mongoose = require("mongoose"); 


async function getMonthlySummary(match) {
    const result = await Voucher.aggregate([
    {
      $match: match,
    },

    {
      $group: {
        _id: null,

        // ============================================
        // Revenue
        //
        // Current
        // Receipt Voucher
        //
        // Future
        // Receipt Voucher
        // + Payment Voucher
        // where paidBy == CLIENT
        // ============================================

        revenue: {
          $sum: {
            $cond: [
              {
                $or: [
                  {
                    $eq: ["$type", "RECEIPT"],
                  },

                  // Future
                  // {
                  //   $and: [
                  //     {
                  //       $eq: ["$type", "PAYMENT"],
                  //     },
                  //     {
                  //       $eq: [
                  //         {
                  //           $ifNull: [
                  //             "$paidBy",
                  //             "COMPANY",
                  //           ],
                  //         },
                  //         "CLIENT",
                  //       ],
                  //     },
                  //   ],
                  // },
                ],
              },

              "$totalDebit",

              0,
            ],
          },
        },

        // ============================================
        // Expense
        //
        // Current
        // Payment Voucher
        //
        // Future
        // Company Payment
        // + Client Payment
        // ============================================

        expense: {
          $sum: {
            $cond: [
              {
                $eq: ["$type", "PAYMENT"],
              },

              "$totalDebit",

              0,
            ],
          },
        },

        receiptCount: {
          $sum: {
            $cond: [
              {
                $eq: ["$type", "RECEIPT"],
              },
              1,
              0,
            ],
          },
        },

        paymentCount: {
          $sum: {
            $cond: [
              {
                $eq: ["$type", "PAYMENT"],
              },
              1,
              0,
            ],
          },
        },

        voucherCount: {
          $sum: 1,
        },
      },
    },

    {
      $addFields: {
        profit: {
          $subtract: [
            "$revenue",
            "$expense",
          ],
        },
      },
    },

    {
      $project: {
        _id: 0,

        revenue: 1,

        expense: 1,

        profit: 1,

        receiptCount: 1,

        paymentCount: 1,

        voucherCount: 1,
      },
    },
  ]);

  return (
    result[0] || {
      revenue: 0,
      expense: 0,
      profit: 0,
      receiptCount: 0,
      paymentCount: 0,
      voucherCount: 0,
    }
  );
}

async function getMonthlyTrend(
  match,
  fromDate,
  toDate
) {
  const days =
    fromDate && toDate
      ? Math.ceil(
        (new Date(toDate) -
          new Date(fromDate)) /
        (1000 * 60 * 60 * 24)
      )
      : 30;

  const groupId =
    days <= 31
      ? {
        year: {
          $year: "$date",
        },
        month: {
          $month: "$date",
        },
        day: {
          $dayOfMonth: "$date",
        },
      }
      : {
        year: {
          $year: "$date",
        },
        month: {
          $month: "$date",
        },
      };

  return Voucher.aggregate([
    {
      $match: match,
    },

    {
      $group: {
        _id: groupId,

        revenue: {
          $sum: {
            $cond: [
              {
                $or: [
                  {
                    $eq: ["$type", "RECEIPT"],
                  },

                  // Future
                  // {
                  //   $and: [
                  //     {
                  //       $eq: ["$type", "PAYMENT"],
                  //     },
                  //     {
                  //       $eq: [
                  //         {
                  //           $ifNull: [
                  //             "$paidBy",
                  //             "COMPANY",
                  //           ],
                  //         },
                  //         "CLIENT",
                  //       ],
                  //     },
                  //   ],
                  // },
                ],
              },

              "$totalDebit",

              0,
            ],
          },
        },

        expense: {
          $sum: {
            $cond: [
              {
                $eq: ["$type", "PAYMENT"],
              },

              "$totalDebit",

              0,
            ],
          },
        },
      },
    },

    {
      $addFields: {
        profit: {
          $subtract: [
            "$revenue",
            "$expense",
          ],
        },
      },
    },

    {
      $project: {
        _id: 0,

        period: {
          $cond: [
            {
              $ifNull: [
                "$_id.day",
                false,
              ],
            },

            {
              $dateToString: {
                format: "%d %b",

                date: {
                  $dateFromParts: {
                    year: "$_id.year",
                    month: "$_id.month",
                    day: "$_id.day",
                  },
                },
              },
            },

            {
              $dateToString: {
                format: "%b %Y",

                date: {
                  $dateFromParts: {
                    year: "$_id.year",
                    month: "$_id.month",
                    day: 1,
                  },
                },
              },
            },
          ],
        },

        revenue: 1,

        expense: 1,

        profit: 1,
      },
    },

    {
      $sort: {
        period: 1,
      },
    },
  ]);
}

async function getCashBankBalance(companyId) {
  const result = await Ledger.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(companyId),
      },
    },

    {
      $lookup: {
        from: "groups",
        localField: "groupId",
        foreignField: "_id",
        as: "group",
      },
    },

    {
      $unwind: "$group",
    },

    {
      $group: {
        _id: null,

        cash: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$group.name",
                  "Cash-in-Hand",
                ],
              },
              "$currentBalance",
              0,
            ],
          },
        },

        bank: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$group.name",
                  "Bank Accounts",
                ],
              },
              "$currentBalance",
              0,
            ],
          },
        },
      },
    },

    {
      $project: {
        _id: 0,

        cash: 1,

        bank: 1,

        total: {
          $add: [
            "$cash",
            "$bank",
          ],
        },
      },
    },
  ]);

  return (
    result[0] || {
      cash: 0,
      bank: 0,
      total: 0,
    }
  );
}

function getRevenueCondition(includeClientPaid = false) {
  if (!includeClientPaid) {
    return { $eq: ["$type", "RECEIPT"] };
  }

  return {
    $or: [
      { $eq: ["$type", "RECEIPT"] },
      {
        $and: [
          { $eq: ["$type", "PAYMENT"] },
          { $eq: [{ $ifNull: ["$paidBy", "COMPANY"] }, "CLIENT"] },
        ],
      },
    ],
  };
}

// 
async function getMonthlyFinancialSummary(
  companyId,
  fromDate,
  toDate
) {
  const match = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };

  if (fromDate || toDate) {
    match.date = {};

    if (fromDate) {
      match.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      match.date.$lte = new Date(toDate);
    }
  }

  const [
    financial,
    balance,
    trend,
  ] = await Promise.all([
    getMonthlySummary(match),

    getCashBankBalance(companyId),

    getMonthlyTrend(match, fromDate, toDate),
  ]);

  return {
    summary: {
      revenue: financial.revenue,
      expense: financial.expense,
      profit: financial.profit,
      balance,
    },
    trend,
  };
}

module.exports = {
    getMonthlyFinancialSummary
}