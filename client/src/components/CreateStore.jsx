import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, Toaster } from "react-hot-toast";

const CreateStore = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [businessUnits, setBusinessUnits] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    businessUnitId: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    },

    managesConsumables: true,
    managesAssets: true,
    allowDirectSalesToClients: true,
    allowInternalSalesToSites: true,
    allowOfficeItemIssue: true,

    stockValuationMethod: "FIFO",
    defaultConsumableRateSource: "StoreRate",
    gstRate: 18,

    minimumStockAlert: {
      enabled: true,
      level: 10,
    },

    assetTrackingEnabled: true,

    // ---- Store Roles ----
    storeHead: "",
    storeIncharge: "",
    helper: "",

    expenseCategories: [],
  });

  const [expenseName, setExpenseName] = useState("");

  /* =========================
     LOAD MASTER DATA
  ========================== */
  useEffect(() => {
    fetchBusinessUnits();
    fetchEmployees();
  }, []);

  const fetchBusinessUnits = async () => {
    const res = await axios.get("/api/v1/business-unit");
    console.log(res.data);
    setBusinessUnits(res.data.map((bu) => ({ value: bu._id, label: bu.name })));
  };

  const fetchEmployees = async () => {
    const res = await axios.get("/api/v1/employee");
    setEmployees(res.data.map((e) => ({ value: e._id, label: e.name })));
  };

  /* =========================
     LOAD EDIT DATA
  ========================== */
  useEffect(() => {
    if (!isEdit) return;

    const loadStore = async () => {
      try {
        const res = await axios.get(`/api/v1/store/${editId}`);
        console.log(res.data);
        setForm({
          ...res.data,
          businessUnitId: res.data.businessUnitId?._id || "",
          storeHead: res.data.storeHead?._id || "",
          storeIncharge: res.data.storeIncharge?._id || "",
          helper: res.data.helper?._id || "",
        });
      } catch (err) {
        console.error("Load store error:", err);
      }
    };

    loadStore();
  }, [editId]);

  /* =========================
     HANDLERS
  ========================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((p) => ({ ...p, address: { ...p.address, [key]: value } }));
    } else if (name.startsWith("minimumStockAlert.")) {
      const key = name.split(".")[1];
      setForm((p) => ({
        ...p,
        minimumStockAlert: {
          ...p.minimumStockAlert,
          [key]: type === "checkbox" ? checked : value,
        },
      }));
    } else if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: checked }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const addExpenseCategory = () => {
    if (!expenseName.trim()) return;

    setForm((p) => ({
      ...p,
      expenseCategories: [...p.expenseCategories, { name: expenseName.trim() }],
    }));

    setExpenseName("");
  };

  const removeExpenseCategory = (index) => {
    const updated = [...form.expenseCategories];
    updated.splice(index, 1);
    setForm((p) => ({ ...p, expenseCategories: updated }));
  };

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async () => {
    try {
      if (!form.businessUnitId) {
        return toast.error("Business Unit is required");
      }

      if (!form.storeHead) {
        return toast.error("Store Head is required");
      }

      if (!form.storeIncharge) {
        return toast.error("Store Incharge is required");
      }

      const payload = { ...form };

      if (isEdit) {
        await axios.put(`/api/v1/store/${editId}`, payload);
        toast.success("Store updated successfully");
      } else {
        await axios.post("/api/v1/store", payload);
        toast.success("Store created successfully");
      }

      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save store");
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit Store" : "Create Store"}
      </h2>

      {/* Business Unit */}
      <Select
        options={businessUnits}
        value={businessUnits.find((b) => b.value === form.businessUnitId)}
        onChange={(v) => setForm((p) => ({ ...p, businessUnitId: v.value }))}
        isDisabled={isEdit}
        placeholder="Select Business Unit"
      />

      {/* Store Roles */}
      <div className="space-y-2">
        <Select
          options={employees}
          value={employees.find((e) => e.value === form.storeHead)}
          onChange={(v) => setForm((p) => ({ ...p, storeHead: v.value }))}
          placeholder="Select Store Head (Accounts / Owner)"
        />

        <Select
          options={employees}
          value={employees.find((e) => e.value === form.storeIncharge)}
          onChange={(v) => setForm((p) => ({ ...p, storeIncharge: v.value }))}
          placeholder="Select Store Incharge"
        />

        <Select
          options={employees}
          value={employees.find((e) => e.value === form.helper)}
          onChange={(v) => setForm((p) => ({ ...p, helper: v?.value || "" }))}
          placeholder="Select Helper (Optional)"
          isClearable
        />
      </div>

      {/* Address */}
      <input
        name="address.line1"
        placeholder="Address Line 1"
        className="border p-2 w-full"
        value={form.address.line1}
        onChange={handleChange}
      />
      <input
        name="address.city"
        placeholder="City"
        className="border p-2 w-full"
        value={form.address.city}
        onChange={handleChange}
      />
      <input
        name="address.state"
        placeholder="State"
        className="border p-2 w-full"
        value={form.address.state}
        onChange={handleChange}
      />
      <input
        name="address.pincode"
        placeholder="Pincode"
        className="border p-2 w-full"
        value={form.address.pincode}
        onChange={handleChange}
      />

      {/* Toggles */}
      {[
        "managesConsumables",
        "managesAssets",
        "allowDirectSalesToClients",
        "allowInternalSalesToSites",
        "allowOfficeItemIssue",
        "assetTrackingEnabled",
      ].map((f) => (
        <label key={f} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name={f}
            checked={form[f]}
            onChange={handleChange}
          />
          {f.replace(/([A-Z])/g, " $1")}
        </label>
      ))}

      {/* Inventory Rules */}
      <select
        name="stockValuationMethod"
        value={form.stockValuationMethod}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="FIFO">FIFO</option>
        <option value="LIFO">LIFO</option>
        <option value="WeightedAverage">Weighted Average</option>
      </select>

      <select
        name="defaultConsumableRateSource"
        value={form.defaultConsumableRateSource}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="StoreRate">Store Rate</option>
        <option value="MRP">MRP</option>
        <option value="PurchaseRate">Purchase Rate</option>
      </select>

      <input
        type="number"
        name="gstRate"
        value={form.gstRate}
        onChange={handleChange}
        className="border p-2 w-full"
        placeholder="GST Rate %"
      />

      {/* Expense Categories */}
      <div>
        <div className="flex gap-2">
          <input
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            className="border p-2 flex-1"
            placeholder="Expense category"
          />
          <button
            onClick={addExpenseCategory}
            className="bg-blue-600 text-white px-3 rounded"
          >
            Add
          </button>
        </div>

        {form.expenseCategories.map((c, i) => (
          <div key={i} className="flex justify-between text-sm border p-2 mt-1">
            {c.name}
            <button
              onClick={() => removeExpenseCategory(i)}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white w-full py-2 rounded"
      >
        {isEdit ? "Update Store" : "Create Store"}
      </button>
      <Toaster position="top-right" />
    </div>
  );
};

export default CreateStore;
