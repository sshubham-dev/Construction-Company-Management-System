const { Ledger, Group } = require("../../models/ledger.models");
const Voucher = require("../../models/voucher.models");


exports.getSummary = async (companyId) => {
  const vouchers = await Voucher.find({
    companyId,
    status: "POSTED",
  });

  let revenue = 0;
  let expenses = 0;

  for (let v of vouchers) {
    for (let e of v.entries) {
      // simple logic (can improve later)
      if (e.type === "CREDIT") revenue += e.amount;
      if (e.type === "DEBIT") expenses += e.amount;
    }
  }

  return {
    revenue,
    expenses,
  };
};

exports.getBalanceSheet = async (companyId) => {
  const ledgers = await Ledger.find({ companyId, isActive: true })
    .populate("groupId");

  const vouchers = await Voucher.find({
    companyId,
    status: "POSTED",
  });

  const ledgerMap = {};

  // init
  for (let l of ledgers) {
    ledgerMap[l._id] = {
      name: l.name,
      nature: l.groupId?.nature,
      balance: 0,
    };
  }

  // calculate balance
  for (let v of vouchers) {
    for (let e of v.entries) {
      const l = ledgerMap[e.ledgerId];
      if (!l) continue;

      if (e.type === "DEBIT") l.balance += e.amount;
      else l.balance -= e.amount;
    }
  }

  const assets = [];
  const liabilities = [];
  let profit = 0;

  for (let key in ledgerMap) {
    const l = ledgerMap[key];

    if (l.nature === "ASSET") {
      assets.push(l);
    } else if (l.nature === "LIABILITY") {
      liabilities.push(l);
    } else if (l.nature === "INCOME") {
      profit += l.balance;
    } else if (l.nature === "EXPENSE") {
      profit -= l.balance;
    }
  }

  return {
    assets,
    liabilities,
    equity: [
      {
        name: "Profit",
        balance: profit,
      },
    ],
  };
};

exports.getProfitAndLoss = async (companyId, fromDate, toDate) => {
  const match = {
    companyId,
    status: "POSTED",
  };

  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = new Date(fromDate);
    if (toDate) match.date.$lte = new Date(toDate);
  }

  const vouchers = await Voucher.find(match);

  const ledgerBalances = {};

  for (let v of vouchers) {
    for (let e of v.entries) {
      if (!ledgerBalances[e.ledgerId]) {
        ledgerBalances[e.ledgerId] = 0;
      }

      if (e.type === "DEBIT") ledgerBalances[e.ledgerId] += e.amount;
      else ledgerBalances[e.ledgerId] -= e.amount;
    }
  }

  const ledgers = await Ledger.find({
    _id: { $in: Object.keys(ledgerBalances) },
  }).populate("groupId");

  let income = [];
  let expenses = [];

  for (let l of ledgers) {
    const balance = ledgerBalances[l._id];

    if (l.groupId?.nature === "INCOME") {
      income.push({ name: l.name, amount: Math.abs(balance) });
    }

    if (l.groupId?.nature === "EXPENSE") {
      expenses.push({ name: l.name, amount: Math.abs(balance) });
    }
  }

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenses.reduce((s, i) => s + i.amount, 0);

  return {
    income,
    expenses,
    totalIncome,
    totalExpense,
    profit: totalIncome - totalExpense,
  };
};

exports.getTrialBalance = async (companyId, fromDate, toDate) => {
  const match = {
    companyId,
    status: "POSTED",
  };

  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = new Date(fromDate);
    if (toDate) match.date.$lte = new Date(toDate);
  }

  const vouchers = await Voucher.find(match);

  const ledgerMap = {};

  // Step 1: accumulate balances
  for (let v of vouchers) {
    for (let e of v.entries) {
      if (!ledgerMap[e.ledgerId]) {
        ledgerMap[e.ledgerId] = { debit: 0, credit: 0 };
      }

      if (e.type === "DEBIT") {
        ledgerMap[e.ledgerId].debit += e.amount;
      } else {
        ledgerMap[e.ledgerId].credit += e.amount;
      }
    }
  }

  // Step 2: attach ledger names
  const ledgers = await Ledger.find({
    _id: { $in: Object.keys(ledgerMap) },
  });

  const result = [];
  let totalDebit = 0;
  let totalCredit = 0;

  for (let l of ledgers) {
    const entry = ledgerMap[l._id];

    const debit = entry.debit;
    const credit = entry.credit;

    totalDebit += debit;
    totalCredit += credit;

    result.push({
      ledgerId: l._id,
      name: l.name,
      debit,
      credit,
    });
  }

  return {
    data: result,
    totalDebit,
    totalCredit,
    isBalanced: totalDebit === totalCredit,
  };
};

exports.getOutstanding = async (companyId, category) => {
  const ledgers = await Ledger.find({
    companyId,
    category,
    isActive: true,
  });

  const results = [];

  for (let ledger of ledgers) {
    const vouchers = await Voucher.find({
      companyId,
      status: "POSTED",
      "entries.ledgerId": ledger._id,
    });

    let debit = 0;
    let credit = 0;

    for (let v of vouchers) {
      for (let e of v.entries) {
        if (e.ledgerId.toString() !== ledger._id.toString())
          continue;

        if (e.type === "DEBIT") debit += e.amount;
        else credit += e.amount;
      }
    }

    let balance = debit - credit;

    results.push({
      ledgerId: ledger._id,
      name: ledger.name,
      debit,
      credit,
      balance,
    });
  }

  return results;
};

exports.getLedgerReport = async ({
  ledgerId,
  companyId,
  fromDate,
  toDate,
}) => {
  const match = {
    companyId,
    status: "POSTED",
    "entries.ledgerId": ledgerId,
  };

  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = new Date(fromDate);
    if (toDate) match.date.$lte = new Date(toDate);
  }

  const vouchers = await Voucher.find(match)
    .populate("entries.ledgerId")
    .sort({ date: 1 });

  let balance = 0;

  const transactions = [];

  for (let v of vouchers) {
    for (let e of v.entries) {
      if (e.ledgerId._id.toString() !== ledgerId.toString())
        continue;

      if (e.type === "DEBIT") balance += e.amount;
      else balance -= e.amount;

      transactions.push({
        date: v.date,
        voucherNo: v.voucherNo,
        type: v.type,
        narration: v.narration,
        debit: e.type === "DEBIT" ? e.amount : 0,
        credit: e.type === "CREDIT" ? e.amount : 0,
        balance,
      });
    }
  }

  return transactions;
};

exports.getBusinessUnitReport = async (companyId) => {
  const vouchers = await Voucher.find({
    companyId,
    status: "POSTED",
  });

  const result = {};

  for (let v of vouchers) {
    const bu = v.businessUnitId?.toString();
    if (!bu) continue;

    if (!result[bu]) {
      result[bu] = {
        revenue: 0,
        expense: 0,
      };
    }

    for (let e of v.entries) {
      if (e.type === "DEBIT") result[bu].expense += e.amount;
      else result[bu].revenue += e.amount;
    }
  }

  return result;
};

exports.getCostCenterReport = async (companyId) => {
  const vouchers = await Voucher.find({
    companyId,
    status: "POSTED",
  });

  const result = {};

  for (let v of vouchers) {
    const cc = v.costCenterId?.toString();
    if (!cc) continue;

    if (!result[cc]) {
      result[cc] = {
        revenue: 0,
        expense: 0,
      };
    }

    for (let e of v.entries) {
      if (e.type === "DEBIT") result[cc].expense += e.amount;
      else result[cc].revenue += e.amount;
    }
  }

  return result;
};

exports.getCombinedReport = async (companyId) => {
  const vouchers = await Voucher.find({
    companyId,
    status: "POSTED",
  });

  const result = {};

  for (let v of vouchers) {
    const bu = v.businessUnitId?.toString();
    const cc = v.costCenterId?.toString();

    if (!bu || !cc) continue;

    if (!result[bu]) result[bu] = {};
    if (!result[bu][cc]) {
      result[bu][cc] = {
        revenue: 0,
        expense: 0,
      };
    }

    for (let e of v.entries) {
      if (e.type === "DEBIT") result[bu][cc].expense += e.amount;
      else result[bu][cc].revenue += e.amount;
    }
  }

  return result;
};