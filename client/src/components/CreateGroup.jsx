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

  const [ledgerGroups, setLedgerGroup] = useState([]);

  useEffect(()=>{
    const fetchGroup = async () => {
      const response = await axios.get('/api/v1/ledger-group')
      setLedgerGroup(response.data)
    };
    fetchGroup();
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
            <option value="Primary">Primary</option>
            <option value="Assets">Assets</option>
            <option value="Liability">Liability</option>
            <option value="Expenses">Expenses</option>
            <option value="Income">Income</option>
            {ledgerGroups.map((ledgerGroup, index) => (
              <option key={index} value={ledgerGroup.name}>{ledgerGroup.name}</option>
            ))}
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
            <option value="">Nature of Group</option>
            <option value="Assets">Assets</option>
            <option value="Liability">Liability</option>
            <option value="Income">Income</option>
            <option value="Expenses">Expenses</option>
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
