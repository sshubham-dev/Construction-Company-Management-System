import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import toast from "react-hot-toast";

const CreateStockItem = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);

  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    code: "",

    groupId: "",
    categoryId: "",

    unit: "",

    itemType: "INVENTORY",
    procurementMode:"STORE_STOCK",

    defaultPurchaseRate: 0,

    brand: "",
    specification: "",
    description: "",

    isActive: true,
  });

  /* =========================
     LOAD MASTERS
  ========================== */

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const [groupRes, categoryRes] = await Promise.all([
        axios.get("/api/v1/stock-group"),
        axios.get("/api/v1/stock-category"),
      ]);

      setGroups(
        (groupRes.data.data || []).map((g) => ({
          value: g._id,
          label: g.name,
        })),
      );

      setCategories(
        (categoryRes.data.data || []).map((c) => ({
          value: c._id,
          label: c.name,
        })),
      );
    } catch (err) {
      toast.error("Failed to load master data");
    }
  };

  /* =========================
     LOAD EDIT ITEM
  ========================== */

  useEffect(() => {
    if (!isEdit) return;

    const loadItem = async () => {
      try {
        const res = await axios.get(`/api/v1/stock-item/${editId}`);

        const data = res.data.data;

        setForm({
          name: data.name || "",
          code: data.code || "",

          groupId: data.groupId?._id || "",

          categoryId: data.categoryId?._id || "",

          unit: data.unit || "",

          itemType: data.itemType || "INVENTORY",

          defaultPurchaseRate: data.defaultPurchaseRate || 0,

          brand: data.brand || "",

          specification: data.specification || "",

          description: data.description || "",

          isActive: data.isActive ?? true,
        });
      } catch (err) {
        toast.error("Failed to load item");
      }
    };

    loadItem();
  }, [editId]);

  /* =========================
     HANDLERS
  ========================== */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumber = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value === "" ? "" : Number(value),
    }));
  };

  /* =========================
     VALIDATION
  ========================== */

  const validate = () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return false;
    }

    if (!form.groupId) {
      toast.error("Group required");
      return false;
    }

    if (!form.categoryId) {
      toast.error("Category required");
      return false;
    }

    if (!form.unit.trim()) {
      toast.error("Unit required");
      return false;
    }

    return true;
  };

  /* =========================
     SUBMIT
  ========================== */

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!validate()) return;

      setLoading(true);

      const payload = {
        ...form,

        name: form.name.trim(),

        code: form.code.trim().toUpperCase(),

        defaultPurchaseRate: Number(form.defaultPurchaseRate) || 0,
      };

      if (isEdit) {
        await axios.put(`/api/v1/stock-item/${editId}`, payload);

        toast.success("Item updated");
      } else {
        await axios.post("/api/v1/stock-item", payload);

        toast.success("Item created");
      }

      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* HEADER */}
      <div className="mb-5">
        <h2 className="text-lg md:text-xl font-semibold">
          {isEdit ? "Edit Stock Item" : "Create Stock Item"}
        </h2>

        <p className="text-sm text-gray-500">
          Configure item and stock behavior
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* BASIC */}

        <Section title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Item Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="UltraTech Cement"
            />

            <Input
              label="Item Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="UTC-001"
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional notes"
          />
        </Section>

        {/* CLASSIFICATION */}

        <Section title="Classification">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SelectField
              label="Stock Group"
              options={groups}
              value={groups.find((g) => g.value === form.groupId)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  groupId: v?.value || "",
                }))
              }
            />

            <SelectField
              label="Stock Category"
              options={categories}
              value={categories.find((c) => c.value === form.categoryId)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  categoryId: v?.value || "",
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="Bag / Kg / Nos"
            />

            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">
                Item Type
              </label>

              <select
                name="itemType"
                value={form.itemType}
                onChange={handleChange}
                className="border rounded-lg px-3 py-3 w-full"
              >
                <option value="INVENTORY">Inventory</option>

                <option value="MATERIAL">Material</option>

                <option value="ASSET">Asset</option>

                <option value="SERVICE">Service</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">
                Order Mode
              </label>

              <select
                name="procurementMode"
                value={form.procurementMode}
                onChange={handleChange}
                className="border rounded-lg px-3 py-3 w-full"
              >
                <option value="STORE_STOCK">STORE_STOCK</option>

                <option value="DIRECT_PROCUREMENT">DIRECT_PROCUREMENT</option>

                <option value="BOTH">Asset</option>
              </select>
            </div>
          </div>
        </Section>

        {/* PURCHASE */}

        <Section title="Purchase Defaults">
          <Input
            label="Default Purchase Rate"
            type="number"
            value={form.defaultPurchaseRate}
            onChange={(e) =>
              handleNumber("defaultPurchaseRate", e.target.value)
            }
            placeholder="0"
          />
        </Section>

        {/* OPTIONAL */}

        <Section title="Additional Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Brand"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="UltraTech"
            />

            <Input
              label="Specification"
              name="specification"
              value={form.specification}
              onChange={handleChange}
              placeholder="50kg OPC Grade"
            />
          </div>

          {isEdit && (
            <Toggle
              label="Active Item"
              checked={form.isActive}
              name="isActive"
              onChange={handleChange}
            />
          )}
        </Section>

        {/* ACTIONS */}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            disabled={loading}
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Item" : "Create Item"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStockItem;

/* =========================
   HELPERS
========================= */

const Section = ({ title, children }) => (
  <div className="border rounded-xl p-4 bg-white space-y-4">
    <h2 className="text-sm font-semibold">{title}</h2>

    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <input {...props} className="border rounded-lg px-3 py-2 w-full" />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <textarea
      {...props}
      rows={3}
      className="border rounded-lg px-3 py-2 w-full"
    />
  </div>
);

const Toggle = ({ label, checked, name, onChange }) => (
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={checked} name={name} onChange={onChange} />

    <span className="text-sm">{label}</span>
  </label>
);

const SelectField = ({ label, options, value, onChange }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <Select options={options} value={value} onChange={onChange} isClearable />
  </div>
);
