import { useState } from "react";

const TrafficLightRuleForm = () => {
  const [rule, setRule] = useState({
    greenAbove: 90,
    amberAbove: 70,
    notes: "",
    status: "Active",
  });

  const [rules, setRules] = useState([
  {
    _id: "1",
    greenAbove: 90,
    amberAbove: 70,
    notes: "Default rule",
    status: "Active",
  },
]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (e) => {
    const { name, value } = e.target;
    setRule({ ...rule, [name]: value });
  };

  const handleEdit = (rule) => {
    setRule(rule);
  };

  const handleDelete = (id) => {
    setRules((prev) => prev.filter((r) => r._id !== id));
  };

  const handleSubmit = async () => {
    setError("");

    const green = Number(rule.greenAbove);
    const amber = Number(rule.amberAbove);

    if (amber >= green) {
      setError("Amber percentage must be less than Green percentage");
      return;
    }

    if (green > 100 || amber > 100 || green < 0 || amber < 0) {
      setError("Percentage must be between 0 and 100");
      return;
    }

    try {
      setLoading(true);

      // 🔗 API CALL (replace later)
      console.log("Saving Traffic Light Rule:", rule);

      // await api.post("/traffic-light-rule", rule);

      alert("Traffic Light Rule saved successfully");
    } catch (err) {
      setError("Failed to save traffic light rule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 mt-4">
      <div className="space-y-6 max-w-xl">
        <h1 className="text-xl font-semibold">Traffic Light Rules</h1>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Green Above (%)</label>
            <input
              type="number"
              name="greenAbove"
              min={0}
              max={100}
              value={rule.greenAbove}
              onChange={update}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Amber Above (%)</label>
            <input
              type="number"
              name="amberAbove"
              min={0}
              max={100}
              value={rule.amberAbove}
              onChange={update}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={rule.notes}
          onChange={update}
          className="border p-2 rounded w-full"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4 items-center">
          <select
            name="status"
            value={rule.status}
            onChange={update}
            className="border p-2 rounded"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Rule"}
          </button>
        </div>
      </div>
      <TrafficLightRuleList
        rules={rules}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

const TrafficLightRuleList = ({ rules, onEdit, onDelete }) => {
  return (
    <div className="mt-10">

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Green ≥ (%)</th>
            <th className="p-2 text-left">Amber ≥ (%)</th>
            <th className="p-2 text-left">Notes</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {rules.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No traffic light rules found
              </td>
            </tr>
          )}

          {rules.map((rule) => (
            <tr key={rule._id} className="border-t">
              <td className="p-2">{rule.greenAbove}%</td>
              <td className="p-2">{rule.amberAbove}%</td>
              <td className="p-2">{rule.notes || "-"}</td>

              <td className="p-2 text-center">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    rule.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {rule.status}
                </span>
              </td>

              <td className="p-2 text-center space-x-2">
                <button
                  onClick={() => onEdit(rule)}
                  className="text-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(rule._id)}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrafficLightRuleForm;
