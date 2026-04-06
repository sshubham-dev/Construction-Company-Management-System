import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-hot-toast";

axios.defaults.withCredentials = true;

const CreateStockGroup = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [group, setGroup] = useState({
    name: "",
    code: "",
    unit: [],
    defaultMargin: 0,
    isActive: true,
  });

  const [units, setUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     LOAD UNITS
  ========================== */
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await axios.post("/api/v1/work-details/name", { title: "Unit" });
        const options = res.data.description.map((u) => ({
          value: u.work,
          label: u.work,
        }));
        setUnits(options);
      } catch (err) {
        console.log("Error fetching units:", err.message);
      }
    };

    fetchUnits();
  }, []);

  /* =========================
     LOAD EDIT DATA
  ========================== */
  useEffect(() => {
    if (!isEdit) return;

    const loadGroup = async () => {
      const res = await axios.get(`/api/v1/stock-group/${editId}`);
      const data = res.data;

      setGroup(data);

      setSelectedUnits(
        (data.unit || []).map((u) => ({ value: u, label: u }))
      );
    };

    loadGroup();
  }, [editId]);

  /* =========================
     HANDLERS
  ========================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setGroup((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUnitChange = (selected) => {
    const values = selected ? selected.map((opt) => opt.value) : [];
    setSelectedUnits(selected);
    setGroup((prev) => ({ ...prev, unit: values }));
  };

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!group.name) {
        setLoading(false);
        return toast.error("Group name required");
      }

      if (isEdit) {
        await axios.put(`/api/v1/stock-group/${editId}`, group);
        toast.success("Group updated");
      } else {
        await axios.post("/api/v1/stock-group", group);
        toast.success("Group created");
      }

      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error saving group");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit Stock Group" : "Create Stock Group"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* BASIC INFO */}
        <Section title="Basic Information">
          <Input
            name="name"
            value={group.name}
            onChange={handleChange}
            placeholder="Group Name"
          />

          <Input
            name="code"
            value={group.code}
            onChange={handleChange}
            placeholder="Code (Optional)"
          />
        </Section>

        {/* UNIT */}
        <Section title="Allowed Units">
          <Select
            options={units}
            isMulti
            value={selectedUnits}
            onChange={handleUnitChange}
            placeholder="Select Units"
          />

          <p className="text-xs text-gray-500">
            Restricts which units can be used for items in this group
          </p>
        </Section>

        {/* MARGIN */}
        <Section title="Default Margin (%)">
          <Input
            type="number"
            name="defaultMargin"
            value={group.defaultMargin}
            onChange={handleChange}
            placeholder="Default Margin %"
          />
        </Section>

        {/* STATUS (EDIT ONLY) */}
        {isEdit && (
          <Section title="Status">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                checked={group.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </Section>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Group"
              : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStockGroup;

/* =========================
   UI HELPERS
========================= */

const Section = ({ title, children }) => (
  <div className="border rounded p-4 space-y-3 bg-white">
    <p className="text-sm font-medium">{title}</p>
    {children}
  </div>
);

const Input = ({ ...props }) => (
  <input {...props} className="border p-2 w-full rounded" />
);
