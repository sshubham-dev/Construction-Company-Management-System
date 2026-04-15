import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const GroupModal = ({ onClose, editId, onSave }) => {
  const [group, setGroup] = useState({
    name: "",
    parentId: null,
    nature: "",
    companyId: "",
  });

  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupRes, companyRes] = await Promise.all([
        axios.get("/api/v1/ledger-group", {
          params: { companyId: user.companyId },
        }),
        axios.get("/api/v1/company"),
      ]);

      setLedgerGroups(groupRes.data);
      setCompanies(companyRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Prefill for edit
  useEffect(() => {
    if (editId) {
      const fetchGroup = async () => {
        const res = await axios.get(`/api/v1/ledger-group/${editId}`);
        setGroup({
          name: res.data.name || "",
          companyId: res.data.companyId?._id || null,
          parentId: res.data.parentId?._id || null,
          nature: res.data.nature || "",
        });
      };
      fetchGroup();
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroup((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;

      if (editId) {
        res = await axios.put(`/api/v1/ledger-group/${editId}`, group);
      } else {
        res = await axios.post("/api/v1/ledger-group", group);
      }

      onSave(res.data);
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name + Company */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Name</label>
          <input
            name="name"
            value={group.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label>Company</label>
          <select
            name="companyId"
            value={group.companyId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Parent */}
      <div>
        <label>Under</label>
        <select
          name="parentId"
          value={group.parentId}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="null">Primary</option>
          {ledgerGroups
            .filter((g) => g._id !== editId)
            .map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
        </select>
      </div>

      {/* Nature */}
      <div>
        <label>Nature</label>
        <select
          name="nature"
          value={group.nature}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select</option>
          <option value="ASSET">ASSET</option>
          <option value="LIABILITY">LIABILITY</option>
          <option value="INCOME">INCOME</option>
          <option value="EXPENSES">EXPENSE</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Saving..." : editId ? "Update Group" : "Create Group"}
        </button>
      </div>
    </form>
  );
};

export default GroupModal;
