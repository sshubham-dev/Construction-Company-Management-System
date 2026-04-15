// services/coa.service.js

const { Group, Ledger } = require("../../models/ledger.models");

const defaultGroups = [
  // 1. ASSET
  { name: "Current Assets", nature: "ASSET" },
  { name: "Fixed Assets", nature: "ASSET" },
  { name: "Investments", nature: "ASSET" },
  { name: "Loans & Advances (Assets)", nature: "ASSET" },

  // 2. LIABILITY
  { name: "Capital Account", nature: "LIABILITY" },
  { name: "Current Liabilities", nature: "LIABILITY" },
  { name: "Loans (Liability)", nature: "LIABILITY" },
  { name: "Suspense A/c", nature: "LIABILITY" },

  // 3. EXPENSES
  { name: "Direct Expenses", nature: "EXPENSES" },
  { name: "Indirect Expenses", nature: "EXPENSES" },
  { name: "Purchase Account", nature: "EXPENSES" },

  // 4. INCOME
  { name: "Direct Income", nature: "INCOME" },
  { name: "Indirect Income", nature: "INCOME" },
  { name: "Sales Account", nature: "INCOME" },

  { name: "Cash-in-Hand", nature: "ASSET", under: "Current Assets" },
  { name: "Bank Accounts", nature: "ASSET", under: "Current Assets" },
  { name: "Sundry Debtors", nature: "ASSET", under: "Current Assets" },
  {
    name: "Sundry Creditors",
    nature: "LIABILITY",
    under: "Current Liabilities",
  },
  { name: "Duties & Taxes", nature: "LIABILITY", under: "Current Liabilities" },
];

// ✅
const createDefaultCOA = async (companyId) => {
  const groupMap = {};

  // 🟢 1. Create PRIMARY groups (no 'under')
  for (let g of defaultGroups.filter((g) => !g.under)) {
    const group = await Group.create({
      name: g.name,
      nature: g.nature,
      companyId,
      isReserved: true,
      parentId: null, // ✅ primary
    });

    groupMap[g.name] = group._id;
  }

  // 🟡 2. Create SUB groups (with 'under')
  for (let g of defaultGroups.filter((g) => g.under)) {
    const parentId = groupMap[g.under];

    if (!parentId) {
      throw new Error(`Parent group not found for ${g.name}`);
    }

    const group = await Group.create({
      name: g.name,
      nature: g.nature,
      companyId,
      isReserved: true,
      parentId, // ✅ link to parent
    });

    groupMap[g.name] = group._id;
  }

  // 🔵 3. Create Ledgers
  await Ledger.create([
    {
      name: "Cash",
      groupId: groupMap["Cash-in-Hand"],
      companyId,
      category: "CASH",
    },
  ]);
};

module.exports = { createDefaultCOA };
