const { Ledger, Group, CostCenter } = require("../../models/ledger.models");
const Voucher = require("../../models/voucher.models");
const mongoose = require("mongoose");

// ✅
const getSummary = async (
  companyId,
  fromDate,
  toDate
) => {
  const filter = {
    companyId,
    // status: "POSTED",
  };

  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate) {
      filter.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      filter.date.$lte = new Date(toDate);
    }
  }

  const vouchers = await Voucher.find(filter)
    .populate({
      path: "entries.ledgerId",
      populate: {
        path: "groupId",
      },
    });

  let income = 0;
  let expense = 0;

  let cash = 0;
  let bank = 0;

  let receivable = 0;
  let payable = 0;

  for (const voucher of vouchers) {
    for (const entry of voucher.entries) {
      const ledger = entry.ledgerId;
      const group = ledger?.groupId;

      if (!group) continue;

      const amount = entry.amount;

      // Income

      if (
        group.nature === "INCOME" &&
        entry.type === "CREDIT"
      ) {
        income += amount;
      }

      // Expense

      if (
        group.nature === "EXPENSES" &&
        entry.type === "DEBIT"
      ) {
        expense += amount;
      }

      // Cash

      if (
        group.name === "Cash-in-Hand"
      ) {
        cash +=
          entry.type === "DEBIT"
            ? amount
            : -amount;
      }

      // Bank

      if (
        group.name === "Bank Accounts"
      ) {
        bank +=
          entry.type === "DEBIT"
            ? amount
            : -amount;
      }

      // Receivable

      if (
        ledger.referenceType === "Client"
      ) {
        receivable +=
          entry.type === "DEBIT"
            ? amount
            : -amount;
      }

      // Payable

      if (
        [
          "Supplier",
          "Contractor",
          "Employee",
        ].includes(
          ledger.referenceType
        )
      ) {
        payable +=
          entry.type === "CREDIT"
            ? amount
            : -amount;
      }
    }
  }

  return {
    revenue: Number(income.toFixed(2)),
    expenses: Number(expense.toFixed(2)),
    profit: Number(income - expense),

    cash: Number(cash.toFixed(2)),
    bank: Number(bank.toFixed(2)),

    receivable: Number(receivable.toFixed(2)),
    payable: Number(payable.toFixed(2)),

    netWorth:
      Number(cash +
        bank +
        receivable -
        payable),
  };
};

// ✅
const getBalanceSheet = async (
  companyId,
  fromDate,
  toDate
) => {
  const groups = await Group.find({
    companyId,
  });
  const filter = {
    companyId,
    // status: "POSTED",
  };

  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate) {
      filter.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      filter.date.$lte = new Date(toDate);
    }
  }

  const assets = [];
  const liabilities = [];

  let totalAssets = 0;
  let totalLiabilities = 0;

  for (const group of groups) {
    const ledgers = await Ledger.find({
      groupId: group._id,
    });

    let balance = 0;

    for (const ledger of ledgers) {
      const vouchers = await Voucher.find({
        filter,
        "entries.ledgerId": ledger._id,
      });

      let debit = 0;
      let credit = 0;

      for (const voucher of vouchers) {
        for (const entry of voucher.entries) {
          if (
            String(entry.ledgerId) !==
            String(ledger._id)
          )
            continue;

          if (entry.type === "DEBIT")
            debit += entry.amount;
          else credit += entry.amount;
        }
      }

      balance += debit - credit;
    }

    if (group.nature === "ASSET") {
      assets.push({
        group: group.name,
        amount: balance,
      });

      totalAssets += balance;
    }

    if (
      group.nature === "LIABILITY"
    ) {
      liabilities.push({
        group: group.name,
        amount: Math.abs(balance),
      });

      totalLiabilities += Math.abs(
        balance
      );
    }
  }

  return {
    assets,
    liabilities,
    totalAssets: Number(totalAssets.toFixed(2)),
    totalLiabilities: Number(totalLiabilities.toFixed(2)),
  };
};

// ✅
const getProfitAndLoss = async (
  companyId,
  fromDate,
  toDate
) => {
  const filter = {
    companyId,
    // status: "POSTED",
  };

  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate) {
      filter.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      filter.date.$lte = new Date(toDate);
    }
  }

  const groups = await Group.find({
    companyId,
  });

  const incomeGroups = groups.filter(
    (g) => g.nature === "INCOME"
  );

  const expenseGroups = groups.filter(
    (g) => g.nature === "EXPENSES"
  );

  const incomeRows = [];
  const expenseRows = [];

  let totalIncome = 0;
  let totalExpense = 0;

  for (const group of incomeGroups) {
    const ledgers = await Ledger.find({
      groupId: group._id,
    });

    let amount = 0;

    for (const ledger of ledgers) {
      const vouchers = await Voucher.find({
        filter,
        "entries.ledgerId": ledger._id,
      });

      for (const voucher of vouchers) {
        for (const entry of voucher.entries) {
          if (
            String(entry.ledgerId) ===
            String(ledger._id) &&
            entry.type === "CREDIT"
          ) {
            amount += entry.amount;
          }
        }
      }
    }

    incomeRows.push({
      group: group.name,
      amount,
    });

    totalIncome += amount;
  }

  for (const group of expenseGroups) {
    const ledgers = await Ledger.find({
      groupId: group._id,
    });

    let amount = 0;

    for (const ledger of ledgers) {
      const vouchers = await Voucher.find({
        companyId,
        "entries.ledgerId": ledger._id,
      });

      for (const voucher of vouchers) {
        for (const entry of voucher.entries) {
          if (
            String(entry.ledgerId) ===
            String(ledger._id) &&
            entry.type === "DEBIT"
          ) {
            amount += entry.amount;
          }
        }
      }
    }

    expenseRows.push({
      group: group.name,
      amount,
    });

    totalExpense += amount;
  }

  return {
    incomeRows,
    expenseRows,
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpense: Number(totalExpense.toFixed(2)),
    netProfit:
      Number(totalIncome - totalExpense),
  };
};

// ✅
const getTrialBalance = async (
  companyId,
  fromDate,
  toDate
) => {
  const filter = {
    companyId,
    // status: "POSTED",
  };

  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate) {
      filter.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      filter.date.$lte = new Date(toDate);
    }
  }

  const ledgers = await Ledger.find({
    companyId,
  }).populate("groupId");

  const rows = [];

  let totalDebit = 0;
  let totalCredit = 0;

  for (const ledger of ledgers) {
    const vouchers = await Voucher.find({
      filter,
      status: { $ne: "CANCELLED" },
      "entries.ledgerId": ledger._id,
    });

    let debit = 0;
    let credit = 0;

    for (const voucher of vouchers) {
      for (const entry of voucher.entries) {
        if (
          String(entry.ledgerId) !==
          String(ledger._id)
        )
          continue;

        if (entry.type === "DEBIT")
          debit += entry.amount;
        else credit += entry.amount;
      }
    }

    rows.push({
      ledgerId: ledger._id,
      ledgerName: ledger.name,
      group: ledger.groupId?.name,
      debit,
      credit,
    });

    totalDebit += debit;
    totalCredit += credit;
  }

  return {
    rows,
    totalDebit: Number(totalDebit.toFixed(2)),
    totalCredit: Number(totalCredit.toFixed(2)),
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
  };
};

// ✅
const getOutstanding = async (companyId, fromDate, toDate, partyType) => {
  const filter = {
    companyId,
    // status: "POSTED",
  };

  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate) {
      filter.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      filter.date.$lte = new Date(toDate);
    }
  }


  const partyFilter = {};

  if (partyType && partyType !== "ALL") {
    partyFilter.referenceType = partyType;
  }

  const ledgers = await Ledger.find({
    companyId,
    ...partyFilter,
  }).lean();

  if (!ledgers.length) {
    return {
      partyType,
      totalBalance: 0,
      count: 0,
      rows: [],
    };
  }

  const results = [];

  let totalBalance = 0;

  for (const ledger of ledgers) {
    const vouchers = await Voucher.find({
      filter,
      status: { $ne: "CANCELLED" },
      "entries.ledgerId": ledger._id,
    }).select("entries");

    let debit = 0;
    let credit = 0;

    for (const voucher of vouchers) {
      for (const entry of voucher.entries) {
        if (
          entry.ledgerId.toString() !==
          ledger._id.toString()
        )
          continue;

        if (entry.type === "DEBIT") {
          debit += Number(entry.amount || 0);
        } else {
          credit += Number(entry.amount || 0);
        }
      }
    }

    const balance = debit - credit;

    totalBalance += Math.abs(balance);

    results.push({
      ledgerId: ledger._id,

      name: ledger.name,

      partyType: ledger.referenceType,

      phone:
        ledger?.mailingDetails?.phone || "",

      debit,

      credit,

      balance,

      balanceType:
        balance > 0
          ? "RECEIVABLE"
          : balance < 0
            ? "PAYABLE"
            : "SETTLED",

      absoluteBalance: Math.abs(balance),
    });
  }

  results.sort(
    (a, b) =>
      b.absoluteBalance -
      a.absoluteBalance
  );

  const receivableRows = results.filter(
    r => r.balanceType === "RECEIVABLE"
  );

  const payableRows = results.filter(
    r => r.balanceType === "PAYABLE"
  );

  const settledRows = results.filter(
    r => r.balanceType === "SETTLED"
  );

  const totalReceivable = receivableRows.reduce(
    (sum, r) => sum + r.absoluteBalance,
    0
  );

  const totalPayable = payableRows.reduce(
    (sum, r) => sum + r.absoluteBalance,
    0
  );

  return {
    summary: {
      receivable: Number(totalReceivable.toFixed(2)),
      payable: Number(totalPayable.toFixed(2)),
      netBalance: Number(
        (totalReceivable - totalPayable).toFixed(2)
      ),

      totalParties: results.length,

      receivableCount: receivableRows.length,

      payableCount: payableRows.length,

      settledCount: settledRows.length,
    },

    rows: results,
  };
};

// ✅
const getLedgerReport = async ({
  ledgerId,
  companyId,
  fromDate,
  toDate,
}) => {
  const ledger = await Ledger.findById(ledgerId);

  if (!ledger) {
    throw new Error("Ledger not found");
  }

  const query = {
    companyId,
    status: { $ne: "CANCELLED" },
    "entries.ledgerId": ledgerId,
  };

  if (fromDate || toDate) {
    query.date = {};

    if (fromDate) {
      query.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      query.date.$lte = new Date(
        new Date(toDate).setHours(23, 59, 59, 999)
      );
    }
  }

  const vouchers = await Voucher.find(query)
    .populate("costCenterId")
    .sort({ date: 1 });

  let runningBalance = ledger.openingBalance || 0;

  const transactions = [];

  let totalDebit = 0;
  let totalCredit = 0;

  for (const voucher of vouchers) {
    const entry = voucher.entries.find(
      (e) => String(e.ledgerId) === String(ledgerId)
    );

    if (!entry) continue;

    let debit = 0;
    let credit = 0;

    if (entry.type === "DEBIT") {
      debit = entry.amount;
      totalDebit += debit;
      runningBalance += debit;
    } else {
      credit = entry.amount;
      totalCredit += credit;
      runningBalance -= credit;
    }

    transactions.push({
      date: voucher.date,
      voucherNo: voucher.voucherNo,
      voucherType: voucher.type,
      narration: voucher.narration,
      costCenter: voucher.costCenterId?.name || "-",
      debit,
      credit,
      balance: runningBalance,
    });
  }

  return {
    ledger: {
      id: ledger._id,
      name: ledger.name,
      openingBalance: Number(ledger.openingBalance.toFixed(2)) || 0,
    },

    summary: {
      openingBalance: Number(ledger.openingBalance.toFixed(2)) || 0,
      totalDebit: Number(totalDebit.toFixed(2)),
      totalCredit: Number(totalCredit.toFixed(2)),
      closingBalance: Number(runningBalance.toFixed(2)),
    },

    transactions,
  };
};

// 
const getBusinessUnitReport = async (
  companyId,
  fromDate,
  toDate
) => {
  const filter = {
    companyId,
    // status: "POSTED",
    businessUnitId: { $ne: null },
  };

  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate) {
      filter.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      filter.date.$lte = new Date(toDate);
    }
  }

  const vouchers = await Voucher.find(filter)
    .populate("businessUnitId")
    .populate({
      path: "entries.ledgerId",
      populate: {
        path: "groupId",
      },
    });

  const report = {};

  for (const voucher of vouchers) {
    const bu = voucher.businessUnitId;

    if (!bu) continue;

    if (!report[bu._id]) {
      report[bu._id] = {
        businessUnitId: bu._id,
        name: bu.name,

        income: 0,
        expense: 0,
        profit: 0,
      };
    }

    for (const entry of voucher.entries) {
      const ledger = entry.ledgerId;
      const group = ledger?.groupId;

      if (!group) continue;

      if (
        group.nature === "INCOME" &&
        entry.type === "CREDIT"
      ) {
        report[bu._id].income += entry.amount;
      }

      if (
        group.nature === "EXPENSES" &&
        entry.type === "DEBIT"
      ) {
        report[bu._id].expense += entry.amount;
      }
    }
  }

  return Object.values(report).map((row) => ({
    ...row,
    profit: row.income - row.expense,
  }));
};

// ✅
const getCostCenterReport = async (
  companyId,
  fromDate,
  toDate,
) => {
  const filter = {
    companyId,
    // status: "POSTED",
    costCenterId: { $ne: null },
  };

  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate) {
      filter.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      filter.date.$lte = new Date(toDate);
    }
  }

  const vouchers = await Voucher.find(filter)
    .populate("costCenterId")
    .populate({
      path: "entries.ledgerId",
      populate: {
        path: "groupId",
      },
    });

  const report = {};

  for (const voucher of vouchers) {
    const cc = voucher.costCenterId;

    if (!cc) continue;

    if (!report[cc._id]) {
      report[cc._id] = {
        costCenterId: cc._id,
        name: cc.name,
        type: cc.type,

        income: 0,
        expense: 0,
        profit: 0,
      };
    }

    for (const entry of voucher.entries) {
      const ledger = entry.ledgerId;
      const group = ledger?.groupId;

      if (!group) continue;

      if (
        group.nature === "INCOME" &&
        entry.type === "CREDIT"
      ) {
        report[cc._id].income += entry.amount;
      }

      if (
        group.nature === "EXPENSES" &&
        entry.type === "DEBIT"
      ) {
        report[cc._id].expense += entry.amount;
      }
    }
  }

  return Object.values(report)
    .map((row) => ({
      ...row,
      profit: row.income - row.expense,
    }))
    .sort((a, b) => b.profit - a.profit);
};

// ✅
const getCashFlowReport = async (
  companyId,
  fromDate,
  toDate
) => {
  const filter = {
    companyId,
    // status: "POSTED",
  };

  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate)
      filter.date.$gte = new Date(fromDate);

    if (toDate)
      filter.date.$lte = new Date(toDate);
  }

  const vouchers = await Voucher.find(filter)
    .populate({
      path: "entries.ledgerId",
      populate: {
        path: "groupId",
      },
    });

  let inflow = 0;
  let outflow = 0;

  const inflowBreakup = {};
  const outflowBreakup = {};

  const addInflow = (name, amount) => {
    inflow += amount;
    inflowBreakup[name] =
      (inflowBreakup[name] || 0) + amount;
  };

  const addOutflow = (name, amount) => {
    outflow += amount;
    outflowBreakup[name] =
      (outflowBreakup[name] || 0) + amount;
  };

  for (const voucher of vouchers) {
    /* =====================
       RECEIPTS
    ===================== */

    if (voucher.type === "RECEIPT") {
      const amount = voucher.totalCredit;

      let category = "Other Receipt";

      for (const entry of voucher.entries) {
        const ledger = entry.ledgerId;

        if (!ledger) continue;

        if (ledger.referenceType === "Client") {
          category = "Client Collection";
          break;
        }

        if (
          ledger.groupId?.nature ===
          "LIABILITY"
        ) {
          category = "Advance Received";
        }
      }

      addInflow(category, amount);
    }

    /* =====================
       PAYMENTS
    ===================== */

    if (voucher.type === "PAYMENT") {
      const amount = voucher.totalDebit;

      let category = "Other Payment";

      for (const entry of voucher.entries) {
        const ledger = entry.ledgerId;

        if (!ledger) continue;

        if (
          ledger.referenceType ===
          "Supplier"
        ) {
          category =
            "Supplier Payment";
          break;
        }

        if (
          ledger.referenceType ===
          "Contractor"
        ) {
          category =
            "Contractor Payment";
          break;
        }

        if (
          ledger.referenceType ===
          "Employee"
        ) {
          category =
            "Employee Payment";
          break;
        }

        if (
          ledger.groupId?.nature ===
          "EXPENSES"
        ) {
          category =
            "Operating Expense";
        }
      }

      addOutflow(category, amount);
    }
  }

  return {
    inflow,
    outflow,

    netCashFlow:
      inflow - outflow,

    inflowBreakup,
    outflowBreakup,
  };
};

// ✅
const getCashFlowDetails = async (
  companyId,
  category,
  fromDate,
  toDate
) => {

  const filter = {
    companyId,
    // status: "POSTED",
  };

  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate)
      filter.date.$gte =
        new Date(fromDate);

    if (toDate)
      filter.date.$lte =
        new Date(toDate);
  }

  const vouchers =
    await Voucher.find(filter)
      .populate("costCenterId")
      .populate({
        path: "entries.ledgerId",
        populate: {
          path: "groupId",
        },
      });

  const result = [];

  for (const voucher of vouchers) {

    let matched = false;
    let partyName = "";
    let partyLedgerId = "";

    for (const entry of voucher.entries) {

      const ledger =
        entry.ledgerId;

      if (!ledger) continue;

      switch (category) {

        case "Client Collection":

          if (
            ledger.referenceType ===
            "Client"
          ) {
            matched = true;
            partyName =
              ledger.name;
            partyLedgerId = ledger._id;
          }

          break;

        case "Supplier Payment":

          if (
            ledger.referenceType ===
            "Supplier"
          ) {
            matched = true;
            partyName =
              ledger.name;
            partyLedgerId = ledger._id;
          }

          break;

        case "Contractor Payment":

          if (
            ledger.referenceType ===
            "Contractor"
          ) {
            matched = true;
            partyName =
              ledger.name;
            partyLedgerId = ledger._id;
          }

          break;

        case "Employee Payment":

          if (
            ledger.referenceType ===
            "Employee"
          ) {
            matched = true;
            partyName =
              ledger.name;
            partyLedgerId = ledger._id;
          }

          break;

        case "Operating Expense":

          if (
            ledger.groupId?.nature ===
            "EXPENSES"
          ) {
            matched = true;
            partyName =
              ledger.name;
            partyLedgerId = ledger._id;
          }

          break;

        case "Advance Received":

          if (
            ledger.groupId?.nature ===
            "LIABILITY"
          ) {
            matched = true;
            partyName =
              ledger.name;
            partyLedgerId = ledger._id;
          }

          break;

        case "Operating Expense":

          if (
            ledger.groupId?.nature ===
            "LIABILITY"
          ) {
            matched = true;
            partyName =
              ledger.name;
            partyLedgerId = ledger._id;
          }

          break;

        default:
          break;
      }
    }

    if (!matched) continue;

    result.push({
      voucherId: voucher._id,
      voucherNo:
        voucher.voucherNo,
      date: voucher.date,
      voucherType:
        voucher.type,
      narration:
        voucher.narration,

      costCenter:
        voucher.costCenterId
          ?.name || "-",

      party: partyName,
      partyLedgerId,

      amount:
        voucher.type ===
          "PAYMENT"
          ? voucher.totalDebit
          : voucher.totalCredit,
    });
  }

  return result.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );
};

// ✅
async function getSiteTable(match) {
  return await Voucher.aggregate([
    {
      $match: match,
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
      $unwind: "$costCenter",
    },

    {
      $match: {
        "costCenter.type": {
          $regex: /^SITE$/i
        },
      },
    },

    {
      $group: {
        _id: "$costCenterId",

        siteName: {
          $first: "$costCenter.name",
        },

        // =====================================================
        // Revenue Logic
        //
        // Current
        // --------
        // Receipt Voucher
        //
        // Future
        // --------
        // Receipt Voucher
        // +
        // Payment Voucher
        // where paidBy == CLIENT
        //
        // A client-paid payment increases project revenue
        // because the client settled the project amount
        // directly with a supplier, contractor, employee,
        // consultant, or other approved party.
        // =====================================================

        revenue: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$type",
                  "RECEIPT",
                ],
              },
              "$totalDebit",
              0,
            ],
          },
        },

        // future revenue: {
        //   $sum: {
        //     $cond: [
        //       {
        //         $or: [
        //           {
        //             $eq: ["$type", "RECEIPT"],
        //           },
        //           {
        //             $and: [
        //               {
        //                 $eq: ["$type", "PAYMENT"],
        //               },
        //               {
        //                 $eq: [
        //                   {
        //                     $ifNull: [
        //                       "$paidBy",
        //                       "COMPANY",
        //                     ],
        //                   },
        //                   "CLIENT",
        //                 ],
        //               },
        //             ],
        //           },
        //         ],
        //       },
        //       "$totalDebit",
        //       0,
        //     ],
        //   },
        // },

        // =====================================================
        // Expense Logic
        //
        // Every Payment Voucher is treated as a project expense.
        //
        // paidBy = COMPANY
        //      Company paid.
        //
        // paidBy = CLIENT
        //      Client paid directly on behalf of company.
        //
        // Both increase project expense.
        // =====================================================


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
                $eq: [
                  "$type",
                  "RECEIPT",
                ],
              },
              1,
              0,
            ],
          },
        },

        // future receiptCount: {
        //   $sum: {
        //     $cond: [
        //       {
        //         $or: [
        //           {
        //             $eq: ["$type", "RECEIPT"],
        //           },
        //           {
        //             $and: [
        //               {
        //                 $eq: ["$type", "PAYMENT"],
        //               },
        //               {
        //                 $eq: [
        //                   {
        //                     $ifNull: [
        //                       "$paidBy",
        //                       "COMPANY",
        //                     ],
        //                   },
        //                   "CLIENT",
        //                 ],
        //               },
        //             ],
        //           },
        //         ],
        //       },
        //       1,
        //       0,
        //     ],
        //   },
        // },

        paymentCount: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$type",
                  "PAYMENT",
                ],
              },
              1,
              0,
            ],
          },
        },

        voucherCount: {
          $sum: 1,
        },

        clientPaid: {
          $sum: {
            $cond: [
              {
                $eq: [
                  {
                    $ifNull: [
                      "$paidBy",
                      "COMPANY",
                    ],
                  },
                  "CLIENT",
                ],
              },
              "$totalDebit",
              0,
            ],
          },
        },

        companyPaid: {
          $sum: {
            $cond: [
              {
                $eq: [
                  {
                    $ifNull: [
                      "$paidBy",
                      "COMPANY",
                    ],
                  },
                  "COMPANY",
                ],
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
      $addFields: {
        margin: {
          $cond: [
            {
              $gt: [
                "$revenue",
                0,
              ],
            },
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$profit",
                        "$revenue",
                      ],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
            0,
          ],
        },
      },
    },

    {
      $project: {
        _id: 0,

        costCenterId: "$_id",

        siteName: 1,

        revenue: 1,

        expense: 1,

        profit: 1,

        margin: 1,

        voucherCount: 1,

        receiptCount: 1,

        paymentCount: 1,
      },
    },

    {
      $sort: {
        profit: -1,
      },
    },
  ]);
}

// ✅
async function getSiteAnalysis(companyId) {
  const match = {
    companyId: new mongoose.Types.ObjectId(companyId),
    costCenterId: { $ne: null },
  };

  const sites = await getSiteTable(match);

  const summary = sites.reduce(
    (acc, site) => {
      acc.revenue += site.revenue;
      acc.expense += site.expense;
      acc.profit += site.profit;

      return acc;
    },
    {
      revenue: 0,
      expense: 0,
      profit: 0,
    }
  );
  summary.margin =
    summary.revenue > 0
      ? Number(
        (
          (summary.profit / summary.revenue) *
          100
        ).toFixed(2)
      )
      : 0;

  summary.totalSites = sites.length;

  summary.profitableSites = sites.filter(
    (x) => x.profit > 0
  ).length;

  summary.lossMakingSites = sites.filter(
    (x) => x.profit < 0
  ).length;

  return {
    summary,
    sites,
  };
}

// 
async function getFinancialSummary(
  companyId,
  fromDate,
  toDate
) {
  const [
    pnl,
    summary,
    investment,
  ] = await Promise.all([
    getProfitAndLoss(
      companyId,
      fromDate,
      toDate
    ),

    getSummary(
      companyId,
      fromDate,
      toDate
    ),

    Ledger.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(
            companyId
          ),
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
        $match: {
          "group.name": {
            $in: [
              "Fixed Assets",
              "Investments",
            ],
          },
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$currentBalance",
          },
        },
      },
    ]),
  ]);

  return {
    income: pnl.totalIncome || 0,

    expenses: pnl.totalExpense || 0,

    profit: pnl.netProfit || 0,

    balance: {
      cash: summary.cash || 0,

      bank: summary.bank || 0,

      total:
        (summary.cash || 0) +
        (summary.bank || 0),
    },

    investment:
      investment[0]?.total || 0,
  };
}

// 
const getDashboard = async (
  companyId,
  fromDate,
  toDate
) => {
  const filter = {
    companyId,
    // status: "POSTED",
  };

  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate) {
      filter.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      filter.date.$lte = new Date(toDate);
    }
  }

  const [
    summary,
    pnl,
    cashFlow,
    costCenters,
    clients,
    suppliers,
    contractors,
    employees,
    recentVouchers,
    financialSummary,
  ] = await Promise.all([

    getSummary(companyId, fromDate,
      toDate),

    getProfitAndLoss(companyId, fromDate,
      toDate),

    getCashFlowReport(companyId, fromDate,
      toDate),

    getCostCenterReport(companyId, fromDate,
      toDate),

    getOutstanding(companyId, fromDate,
      toDate, "Client"),

    getOutstanding(companyId, fromDate,
      toDate, "Supplier"),

    getOutstanding(companyId, fromDate,
      toDate, "Contractor"),

    getOutstanding(companyId, fromDate,
      toDate, "Employee"),
    getFinancialSummary(
      companyId,
      fromDate,
      toDate
    ),

    Voucher.find(filter)
      // status: "POSTED")
      .sort({ date: -1 })
      .limit(20)
  ]);

  const clientRows = Array.isArray(clients)
    ? clients
    : clients?.rows || [];

  const supplierRows = Array.isArray(suppliers)
    ? suppliers
    : suppliers?.rows || [];

  const contractorRows = Array.isArray(contractors)
    ? contractors
    : contractors?.rows || [];

  const employeeRows = Array.isArray(employees)
    ? employees
    : employees?.rows || [];

  const receivable =
    clientRows?.filter(
      x => x.balanceType === "RECEIVABLE"
    ).reduce(
      (s, x) => s + x.absoluteBalance,
      0
    );

  const payable =
    [...supplierRows,
    ...contractorRows,
    ...employeeRows]
      ?.rows?.filter(
        x => x.balanceType === "PAYABLE"
      )
      .reduce(
        (s, x) => s + x.absoluteBalance,
        0
      );

  return {
    financialSummary,
    kpi: {

      cash:
        Number(summary.cash.toFixed(2)) || 0,

      receivable: Number(receivable?.toFixed(2)),

      payable: Number(payable),

      profit:
        Number(pnl.netProfit.toFixed(2)) || 0,
    },

    revenueExpense: {
      revenue:
        Number(pnl.totalIncome.toFixed(2)),

      expense:
        Number(pnl.totalExpense.toFixed(2)),
    },

    cashFlow: {

      inflow:
        Number(cashFlow.inflow.toFixed(2)),

      outflow:
        Number(cashFlow.outflow.toFixed(2)),

      net:
        Number(cashFlow.netCashFlow.toFixed(2)),
    },

    departments:
      costCenters
        .sort(
          (a, b) =>
            b.profit > a.profit
        )
        .slice(0, 5),

    topReceivables:
      clientRows
        .filter(
          x =>
            x.balanceType ===
            "RECEIVABLE"
        )
        .sort(
          (a, b) =>
            b.absoluteBalance -
            a.absoluteBalance
        )
        .slice(0, 5),

    topPayables:
      [...supplierRows,
      ...contractorRows]
        .filter(
          x =>
            x.balanceType ===
            "PAYABLE"
        )
        .sort(
          (a, b) =>
            b.absoluteBalance -
            a.absoluteBalance
        )
        .slice(0, 5),

    recentVouchers
  };
};





module.exports = {
  getOutstanding,
  getLedgerReport,
  getBalanceSheet,
  getProfitAndLoss,
  getSummary,
  getTrialBalance,
  getBusinessUnitReport,
  getCostCenterReport,
  getCashFlowReport,
  getSiteAnalysis,
  getCashFlowDetails,
  getDashboard,
}