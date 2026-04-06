// services/coa.service.js

const { Group, Ledger } = require("../../models/ledger.models");

const defaultGroups = [
  { name: "Assets", nature: "ASSET" },
  { name: "Liabilities", nature: "LIABILITY" },
  { name: "Income", nature: "INCOME" },
  { name: "Expenses", nature: "EXPENSE" },

  { name: "Cash-in-Hand", nature: "ASSET" },
  { name: "Bank Accounts", nature: "ASSET" },
  { name: "Sundry Debtors", nature: "ASSET" },
  { name: "Fixed Assets", nature: "ASSET" },
  { name: "Investments", nature: "ASSET" },

  { name: "Sundry Creditors", nature: "LIABILITY" },
  { name: "Duties & Taxes", nature: "LIABILITY" },
  { name: "Capital Account", nature: "LIABILITY" },

  { name: "Direct Expenses", nature: "EXPENSE" },
  { name: "Indirect Expenses", nature: "EXPENSE" },
  { name: "Purchase Account", nature: "EXPENSE" },

  { name: "Direct Income", nature: "INCOME" },
  { name: "Sales Account", nature: "INCOME" },
  { name: "Indirect Income", nature: "INCOME" },
];

const createDefaultCOA = async (companyId) => {
  const groupMap = {};

  for (let g of defaultGroups) {
    const group = await Group.create({
      ...g,
      companyId,
      isReserved: true,
    });

    groupMap[g.name] = group._id;
  }

  // Create basic ledgers
  await Ledger.create([
    {
      name: "Cash",
      groupId: groupMap["Cash-in-Hand"],
      companyId,
      category: "CASH",
    },
    // {
    //   name: "Bank",
    //   groupId: groupMap["Bank Accounts"],
    //   companyId,
    //   category: "BANK",
    // },
  ]);
};

module.exports = { createDefaultCOA };
