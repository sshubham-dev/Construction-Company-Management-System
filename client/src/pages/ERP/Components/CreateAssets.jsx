import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-hot-toast";

axios.defaults.withCredentials = true;

const CreateAssets = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);

  const [stores, setStores] = useState([]);

  const [items, setItems] = useState([]);

  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    assetCode: "",
    name: "",

    itemId: "",
    storeId: "",

    status: "AVAILABLE",

    condition: "GOOD",

    serialNo: "",

    purchaseDate: "",

    purchasePrice: 0,

    assignedTo: "",

    maintenanceIntervalDays: 0,

    isRentable: false,

    rentPerDay: 0,

    remarks: "",

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
      const [itemsRes, storesRes, usersRes] = await Promise.all([
        axios.get("/api/v1/stock-item"),
        axios.get("/api/v1/store"),
        axios.get("/api/v1/user/lists"),
      ]);
      console.log(itemsRes.data.data);
      /* ONLY ASSET ITEMS */

      const assetItems = (itemsRes.data.data || []).filter(
        (i) => i.itemType === "ASSET",
      );

      setItems(
        assetItems.map((i) => ({
          value: i._id,
          label: i.name,
        })),
      );

      setStores(
        (storesRes.data.data || []).map((s) => ({
          value: s._id,
          label: s.name,
        })),
      );

      setUsers(
        (usersRes.data || []).map((u) => ({
          value: u._id,
          label: u.userName,
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     LOAD EDIT
  ========================== */

  useEffect(() => {
    if (!isEdit) return;

    const loadAsset = async () => {
      try {
        const res = await axios.get(`/api/v1/assets/${editId}`);

        const data = res.data.data;

        setForm({
          assetCode: data.assetCode || "",

          name: data.name || "",

          itemId: data.itemId?._id || "",

          storeId: data.storeId?._id || "",

          status: data.status || "AVAILABLE",

          condition: data.condition || "GOOD",

          serialNo: data.serialNo || "",

          purchaseDate: data.purchaseDate?.split("T")[0] || "",

          purchasePrice: data.purchasePrice || 0,

          assignedTo: data.assignedTo?._id || "",

          maintenanceIntervalDays: data.maintenanceIntervalDays || 0,

          isRentable: data.isRentable || false,

          rentPerDay: data.rentPerDay || 0,

          remarks: data.remarks || "",

          isActive: data.isActive ?? true,
        });
      } catch (err) {
        toast.error("Failed to load asset");
      }
    };

    loadAsset();
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
    if (!form.assetCode) {
      toast.error("Asset code required");
      return false;
    }

    if (!form.name) {
      toast.error("Asset name required");
      return false;
    }

    if (!form.itemId) {
      toast.error("Item required");
      return false;
    }

    if (!form.storeId) {
      toast.error("Store required");
      return false;
    }

    return true;
  };

  /* =========================
     SUBMIT
  ========================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        ...form,
      };

      if (isEdit) {
        await axios.put(`/api/v1/assets/${editId}`, payload);

        toast.success("Asset updated");
      } else {
        await axios.post("/api/v1/assets", payload);

        toast.success("Asset created");
      }

      onClose();
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.message || "Failed to save asset");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */

  return (
    <div className="max-w-4xl mx-auto">
      {/* HEADER */}

      <div className="mb-5">
        <h2 className="text-xl font-semibold">
          {isEdit ? "Edit Asset" : "Create Asset"}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Register and manage physical assets
        </p>
      </div>

      {/* FORM */}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* BASIC */}

        <Section title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Asset Code"
              name="assetCode"
              value={form.assetCode}
              onChange={handleChange}
              placeholder="AST-0001"
            />

            <Input
              label="Asset Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Dell Latitude Laptop"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Asset Item"
              options={items}
              value={items.find((i) => i.value === form.itemId)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  itemId: v?.value || "",
                }))
              }
            />

            <SelectField
              label="Store"
              options={stores}
              value={stores.find((s) => s.value === form.storeId)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  storeId: v?.value || "",
                }))
              }
            />
          </div>
        </Section>

        {/* STATUS */}

        <Section title="Status & Condition">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectInput
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={["AVAILABLE", "ISSUED", "MAINTENANCE", "SCRAP"]}
            />

            <SelectInput
              label="Condition"
              name="condition"
              value={form.condition}
              onChange={handleChange}
              options={["NEW", "GOOD", "DAMAGED", "SCRAP"]}
            />

            <Input
              label="Serial No"
              name="serialNo"
              value={form.serialNo}
              onChange={handleChange}
              placeholder="SN-001"
            />
          </div>
        </Section>

        {/* PURCHASE */}

        <Section title="Purchase Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Purchase Date"
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleChange}
            />

            <Input
              label="Purchase Price"
              type="number"
              value={form.purchasePrice}
              onChange={(e) => handleNumber("purchasePrice", e.target.value)}
            />
          </div>
        </Section>

        {/* ASSIGNMENT */}

        <Section title="Assignment">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Assigned To"
              options={users}
              value={users.find((u) => u.value === form.assignedTo)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  assignedTo: v?.value || "",
                }))
              }
            />

            <Input
              label="Maintenance Interval (Days)"
              type="number"
              value={form.maintenanceIntervalDays}
              onChange={(e) =>
                handleNumber("maintenanceIntervalDays", e.target.value)
              }
            />
          </div>
        </Section>

        {/* RENT */}

        <Section title="Rental Settings">
          <div className="space-y-4">
            <Toggle
              label="Rentable Asset"
              checked={form.isRentable}
              name="isRentable"
              onChange={handleChange}
            />

            {form.isRentable && (
              <Input
                label="Rent Per Day"
                type="number"
                value={form.rentPerDay}
                onChange={(e) => handleNumber("rentPerDay", e.target.value)}
              />
            )}
          </div>
        </Section>

        {/* REMARKS */}

        <Section title="Remarks">
          <Textarea
            label="Remarks"
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            placeholder="Additional notes..."
          />
        </Section>

        {/* ACTIVE */}

        {isEdit && (
          <Section title="Status">
            <Toggle
              label="Active Asset"
              checked={form.isActive}
              name="isActive"
              onChange={handleChange}
            />
          </Section>
        )}

        {/* ACTIONS */}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Asset" : "Create Asset"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssets;

/* =========================
   HELPERS
========================= */

const Section = ({ title, children }) => (
  <div className="bg-white border rounded-xl p-4 space-y-4">
    <h2 className="font-medium text-sm">{title}</h2>

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
      rows={4}
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

const SelectInput = ({ label, options, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <select {...props} className="border rounded-lg px-3 py-2 w-full">
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);
