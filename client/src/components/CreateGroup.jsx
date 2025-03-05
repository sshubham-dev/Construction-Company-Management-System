import { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const GroupModal = ({ onClose }) => {
  const [group, setGroup] = useState({
    name: "",
    alias: "",
    under: "",
    nature: '',
  });

  const [ledgerGroup, setLedgerGroup] = useState([]);

  useEffect(()=>{
    
  },[])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroup((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/ledger-group', group)
      console.log("Group Data:", group);
      console.log(response)
      onClose();
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div>
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
            <option value="primary">Primary</option>
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

        <div>
          <label className="block text-sm font-medium">Nature</label>
          <select
            name="nature"
            value={group.nature}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="assets">Assets</option>
            <option value="liabilities">Liabilities</option>
            <option value="income">Income</option>
            <option value="expenses">Expenses</option>
          </select>
        </div>

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
  );
};

export default GroupModal;
