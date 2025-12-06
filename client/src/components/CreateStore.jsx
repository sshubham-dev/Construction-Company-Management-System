import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import toast from "react-hot-toast";
import CreateStock from "./CreateStock";

const CreateStore = ({ onClose, editId }) => {
  const [businessUnits, setBusinessUnits] = useState([]);
  const [employees, setEmployees] = useState([]);

  const isEdit = Boolean(editId);

  const [form, setForm] = useState({
    name: "",
    businessUnitId: "",
    managesConsumables: true,
    managesAssets: true,
    allowDirectSalesToClients: true,
    allowInternalSalesToSites: true,
    stockValuationMethod: "FIFO",
    gstRate: 18,
    staff: [],
    expenseCategories: [],
  });

  const [expenseName, setExpenseName] = useState("");

  // Load business units and employees
  useEffect(() => {
    fetchBU();
    fetchEmployees();
  }, []);

  const fetchBU = async () => {
    const res = await axios.get("/api/businessunit");
    setBusinessUnits(
      res.data.map((bu) => ({ value: bu._id, label: bu.name }))
    );
  };

  const fetchEmployees = async () => {
    const res = await axios.get("/api/employees");
    setEmployees(
      res.data.map((emp) => ({ value: emp._id, label: emp.name }))
    );
  };

  // Load edit initial data
  useEffect(() => {
    if (isEdit) {
      setForm({
        ...form,
        ...editId,
        businessUnitId: editId.businessUnitId?._id || editId.businessUnitId,
        staff: editId.staff || [],
      });
    }
  }, [editId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = (field) => {
    setForm({ ...form, [field]: !form[field] });
  };

  const addExpenseCategory = () => {
    if (!expenseName.trim()) return;
    setForm({
      ...form,
      expenseCategories: [
        ...form.expenseCategories,
        { name: expenseName.trim() },
      ],
    });
    setExpenseName("");
  };

  const removeExpenseCategory = (index) => {
    const updated = [...form.expenseCategories];
    updated.splice(index, 1);
    setForm({ ...form, expenseCategories: updated });
  };

  const handleSubmit = async () => {
    try {
      if (!form.name) return toast.error("Store name is required");
      if (!form.businessUnitId)
        return toast.error("Business unit is required");

      const payload = {
        ...form,
        staff: form.staff.map((s) => s.value || s),
      };

      let res;

      if (isEdit) {
        res = await axios.put(`/api/store/${editId._id}`, payload);
        toast.success("Store updated");
      } else {
        res = await axios.post("/api/store", payload);
        toast.success("Store created");
      }

      onClose(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save store");
    }
  };

  return (
    <div className="p-5 w-[500px]">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Store" : "Create Store"}
      </h2>

      {/* Name */}
      <div className="mb-3">
        <label className="block mb-1">Store Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      {/* Business Unit */}
      <div className="mb-3">
        <label className="block mb-1">Business Unit</label>
        <Select
          options={businessUnits}
          value={businessUnits.find(
            (b) => b.value === form.businessUnitId
          )}
          onChange={(v) =>
            setForm({ ...form, businessUnitId: v.value })
          }
        />
      </div>

      {/* Staff */}
      <div className="mb-3">
        <label className="block mb-1">Assign Staff</label>
        <Select
          isMulti
          options={employees}
          value={employees.filter((e) =>
            form.staff.includes(e.value)
          )}
          onChange={(v) => setForm({ ...form, staff: v })}
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <label
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleToggle("managesConsumables")}
        >
          <input
            type="checkbox"
            checked={form.managesConsumables}
            readOnly
          />
          Manages Consumables
        </label>

        <label
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleToggle("managesAssets")}
        >
          <input
            type="checkbox"
            checked={form.managesAssets}
            readOnly
          />
          Manages Assets
        </label>

        <label
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleToggle("allowDirectSalesToClients")}
        >
          <input
            type="checkbox"
            checked={form.allowDirectSalesToClients}
            readOnly
          />
          Direct Sales to Clients
        </label>

        <label
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleToggle("allowInternalSalesToSites")}
        >
          <input
            type="checkbox"
            checked={form.allowInternalSalesToSites}
            readOnly
          />
          Internal Sales to Sites
        </label>
      </div>

      {/* Valuation Method */}
      <div className="mb-3">
        <label className="block mb-1">Stock Valuation</label>
        <select
          name="stockValuationMethod"
          value={form.stockValuationMethod}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="FIFO">FIFO</option>
          <option value="LIFO">LIFO</option>
          <option value="WeightedAverage">Weighted Average</option>
        </select>
      </div>

      {/* GST */}
      <div className="mb-3">
        <label className="block mb-1">GST Rate (%)</label>
        <input
          type="number"
          name="gstRate"
          value={form.gstRate}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      </div>

      {/* Expense Categories */}
      <div className="mb-3">
        <label className="block mb-1">Expense Categories</label>

        <div className="flex gap-2 mb-2">
          <input
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            className="border p-2 rounded flex-1"
            placeholder="Add expense name"
          />
          <button
            onClick={addExpenseCategory}
            className="bg-blue-600 text-white px-3 rounded"
          >
            Add
          </button>
        </div>

        {form.expenseCategories.map((c, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-sm border p-2 rounded mb-1"
          >
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

      {/* Submit */}
      <div className="text-right mt-6">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-5 py-2 rounded"
        >
          {isEdit ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
};

export default CreateStore;
