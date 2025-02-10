import { useState } from "react";

const GroupModal = ({ isOpen, onClose }) => {
  const [group, setGroup] = useState({
    name: "",
    alias: "",
    under: "",
    behavesLikeSubLedger: false,
    netDebitCreditBalances: false,
    usedForCalculation: false,
    purchaseInvoiceMethod: "",
    tdsDetails: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGroup((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Group Data:", group);
    onClose();
  };

  if (!isOpen) return null;

  return (
<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
<div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-fit  md:mt-12 overflow-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Create Group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Alias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={group.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Alias</label>
              <input
                type="text"
                name="alias"
                value={group.alias}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
          </div>

          {/* Under Group */}
          <div>
            <label className="block text-sm font-medium">Under</label>
            <select
              name="under"
              value={group.under}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="Capital Account">Capital Account</option>
              <option value="Bank Accounts">Bank Accounts</option>
              <option value="Cash-in-Hand">Cash-in-Hand</option>
              <option value="Current Assets">Current Assets</option>
              <option value="Current Liabilities">Current Liabilities</option>
              <option value="Direct Expenses">Direct Expenses</option>
              <option value="Direct Incomes">Direct Incomes</option>
              <option value="Fixed Assets">Fixed Assets</option>
              <option value="Investments">Investments</option>
              <option value="Loans & Advances (Asset)">Loans & Advances (Asset)</option>
              <option value="Sales Accounts">Sales Accounts</option>
              <option value="Sundry Debtors">Sundry Debtors</option>
              <option value="Sundry Creditors">Sundry Creditors</option>
            </select>
          </div>

          {/* Group Behavior Settings */}
          {/* <div className="flex flex-col space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="behavesLikeSubLedger"
                checked={group.behavesLikeSubLedger}
                onChange={handleChange}
                className="mr-2"
              />
              Group behaves like a sub-ledger
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="netDebitCreditBalances"
                checked={group.netDebitCreditBalances}
                onChange={handleChange}
                className="mr-2"
              />
              Net Debit/Credit Balances for Reporting
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="usedForCalculation"
                checked={group.usedForCalculation}
                onChange={handleChange}
                className="mr-2"
              />
              Used for Calculation (e.g., taxes, discounts)
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="tdsDetails"
                checked={group.tdsDetails}
                onChange={handleChange}
                className="mr-2"
              />
              Set/Alter TDS details
            </label>
          </div> */}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded-md">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
              Save Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;
