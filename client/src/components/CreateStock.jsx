import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, Toaster } from "react-hot-toast";

const CreateStock = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    itemCode: "",
    name: "",
    category: "",
    unit: "",
    itemType: "CONSUMABLE",

    hsnCode: "",
    gstRate: 0,

    purchasePrice: 0,
    mrp: 0,
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const res = await axios.get("/api/v1/stock-group");
    setGroups(res.data.map((g) => ({ value: g.name, label: g.name })));
  };

  useEffect(() => {
    if (!isEdit) return;

    const loadStock = async () => {
      const res = await axios.get(`/api/v1/stock/${editId}`);
      const data = res.data;

      setForm({
        ...form,
        ...data,
      });
    };

    loadStock();
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.name) return toast.error("Item name required");
      if (!form.category) return toast.error("Category required");
      if (!form.unit) return toast.error("Unit required");

      const payload = {
        ...form,
        gstRate: Number(form.gstRate) || 0,
        purchasePrice: Number(form.purchasePrice) || 0,
        mrp: Number(form.mrp) || 0,
      };

      console.log(payload)

      if (editId !== undefined) {
        await axios.put(`/api/v1/stock/${editId}`, payload);
        toast.success("Item updated");
      } else {
        await axios.post("/api/v1/stock", payload);
        toast.success("Item created");
      }

      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving item");
    }
  };

  return (
    <div className="mx-auto space-y-4">

      {/* BASIC INFO */}
      <Section title="Basic Information">
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Item Name"
        />
        <Input
          name="itemCode"
          value={form.itemCode}
          onChange={handleChange}
          placeholder="Item Code"
        />
        <Input
          name="unit"
          value={form.unit}
          onChange={handleChange}
          placeholder="Unit (e.g. Bag, Kg, Nos)"
        />
      </Section>

      {/* GROUP */}
      <Section title="Grouping">
        <Select
          options={groups}
          value={groups.find((g) => g.value === form.category)}
          onChange={(v) => setForm((p) => ({ ...p, category: v?.value || "" }))}
          placeholder="Select Stock Group (Optional)"
          isClearable
        />
        <select
          name="itemType"
          value={form.itemType}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="CONSUMABLE">Consumable</option>
          <option value="ASSET">Asset</option>
        </select>
      </Section>

      {/* TAX */}
      <Section title="Tax Details">
        <Input
          name="hsnCode"
          value={form.hsnCode}
          onChange={handleChange}
          placeholder="HSN Code"
        />
        <Input
          type="number"
          name="gstRate"
          value={form.gstRate}
          onChange={handleChange}
          placeholder="GST %"
        />
      </Section>

      {/* PRICING */}
      <Section title="Pricing">
        <Input
          type="number"
          name="purchasePrice"
          value={form.purchasePrice}
          onChange={handleChange}
          placeholder="Purchase Price"
        />
        <Input
          type="number"
          name="mrp"
          value={form.mrp}
          onChange={handleChange}
          placeholder="MRP"
        />
      </Section>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 border rounded">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {isEdit ? "Update Item" : "Create Item"}
        </button>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default CreateStock;

/* UI Helpers */

const Section = ({ title, children }) => (
  <div className="border rounded p-4 space-y-3 bg-white">
    <p className="text-sm font-medium">{title}</p>
    {children}
  </div>
);

const Input = ({ ...props }) => (
  <input {...props} className="border p-2 w-full rounded" />
);
