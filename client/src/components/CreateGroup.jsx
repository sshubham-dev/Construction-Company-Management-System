import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

axios.defaults.withCredentials = true;

const GroupModal = ({ onClose, editId }) => {
  const [group, setGroup] = useState({
    name: "",
    parentId: "",
    nature: "",
  });
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [ledgerGroups, setLedgerGroup] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companies, setCompany] = useState([]);
  useEffect(() => {
    const fetchGroup = async () => {
      const response = await axios.get("/api/v1/ledger-group", {
        params: { companyId: user.companyId },
      });
      console.log(response.data);
      setLedgerGroup(response.data);
    };
    const fetchCompany = async () => {
      const res = await axios.get("/api/v1/company");
      console.log(res.data);
      setCompany(res.data);
    };
    fetchCompany();
    fetchGroup();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroup((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(group);
    try {
      const response = await axios.post("/api/v1/ledger-group", group);
      console.log("Group Data:", group);
      console.log(response);
      setLoading(false);
      onClose();
    } catch (error) {
      console.log(error);
      setLoading(false);
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

          {/* Company */}
          <div>
            <label className="block text-sm font-medium">Company</label>
            <select
              name="companyId"
              value={group.companyId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">Select Company</option>
              {companies.map((c, index) => (
                <option key={index} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Under Group */}
        <div>
          <label className="block text-sm font-medium">Under</label>
          <select
            name="parentId"
            value={group.parentId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Select Under Group</option>
            {ledgerGroups.map((ledgerGroup, index) => (
              <option key={index} value={ledgerGroup._id}>
                {ledgerGroup.name}
              </option>
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
            <option value="ASSET">ASSET</option>
            <option value="LIABILITY">LIABILITY</option>
            <option value="INCOME">INCOME</option>
            <option value="EXPENSES">EXPENSES</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupModal;
