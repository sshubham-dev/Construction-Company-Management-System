import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateBusinessUnit = ({ onClose, editId }) => {
  const [form, setForm] = useState({
    name: "",
    type: "",
    code: "",
    phone: "",
    email: "",
    gstNo: "",
    panNo: "",
    manager: "",
    isActive: true,
    address: { street: "", city: "", district: "", state: "", pincode: "" },
    geo: { lat: "", lng: "" },
    bankAccounts: [],
  });

  const emptyBank = { name: "", number: "", ifsc: "", branch: "" };
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadBU(editId);
    loadEmployees();
  }, [editId]);

  const loadEmployees = async () => {
    const res = await axios.get("/api/v1/employee?active=true");
    setEmployees(res.data || []);
  };

  const loadBU = async (id) => {
    const res = await axios.get(`/api/v1/business-unit/${id}`);
    setForm(res.data);
    console.log(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("address.")) {
      const key = name.split(".")[1];
      setForm({ ...form, address: { ...form.address, [key]: value } });
    } else if (name.includes("geo.")) {
      const key = name.split(".")[1];
      setForm({ ...form, geo: { ...form.geo, [key]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addBank = () => {
    setForm({ ...form, bankAccounts: [...form.bankAccounts, emptyBank] });
  };

  const updateBank = (i, field, value) => {
    const updated = [...form.bankAccounts];
    updated[i][field] = value;
    setForm({ ...form, bankAccounts: updated });
  };

  const saveBU = async (e) => {
    e.preventDefault();
    try {
      if (editId !== undefined && editId) {
        await axios.put(`/api/v1/business-unit/${editId}`, form);
        onClose();
        resetForm();
      } else {
        await axios.post("/api/v1/business-unit", form);
        onClose();
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "",
      code: "",
      phone: "",
      email: "",
      gstNo: "",
      panNo: "",
      manager: "",
      isActive: true,
      address: { street: "", city: "", district: "", state: "", pincode: "" },
      geo: { lat: "", lng: "" },
      bankAccounts: [],
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Business Unit</h2>

      <form onSubmit={saveBU} className="mb-6 space-y-4">
        <h2 className="text-lg font-medium">
          {editId ? "Edit Business Unit" : "Add Business Unit"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="name"
            className="border p-2"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="type"
            className="border p-2"
            placeholder="Type"
            value={form.type}
            onChange={handleChange}
          />

          <input
            name="code"
            className="border p-2"
            placeholder="Code"
            value={form.code}
            onChange={handleChange}
          />

          <input
            name="phone"
            className="border p-2"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            name="email"
            className="border p-2"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="gstNo"
            className="border p-2"
            placeholder="GST"
            value={form.gstNo}
            onChange={handleChange}
          />

          <input
            name="panNo"
            className="border p-2"
            placeholder="PAN"
            value={form.panNo}
            onChange={handleChange}
          />

          {editId && (
            <div>
              {/* <label className="block text-sm mb-1">Manager</label> */}
              <select
                name="manager"
                value={form.manager}
                onChange={handleChange}
                className="border p-2 w-full"
              >
                <option value="">Select Manager</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeNo})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="address.street"
            className="border p-2"
            placeholder="Street"
            value={form.address.street}
            onChange={handleChange}
          />
          <input
            name="address.city"
            className="border p-2"
            placeholder="City"
            value={form.address.city}
            onChange={handleChange}
          />
          <input
            name="address.district"
            className="border p-2"
            placeholder="District"
            value={form.address.district}
            onChange={handleChange}
          />
          <input
            name="address.state"
            className="border p-2"
            placeholder="State"
            value={form.address.state}
            onChange={handleChange}
          />
          <input
            name="address.pincode"
            className="border p-2"
            placeholder="Pincode"
            value={form.address.pincode}
            onChange={handleChange}
          />
        </div>

        {/* GEO */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="geo.lat"
            className="border p-2"
            placeholder="Latitude"
            value={form?.geo?.lat}
            onChange={handleChange}
          />
          <input
            name="geo.lng"
            className="border p-2"
            placeholder="Longitude"
            value={form?.geo?.lng}
            onChange={handleChange}
          />
        </div>

        {/* BANK ACCOUNTS */}
        <div>
          <h3 className="font-medium mb-2">Bank Accounts</h3>
          {form.bankAccounts.map((b, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 mb-2">
              <input
                className="border p-2"
                placeholder="Name"
                value={b.name}
                onChange={(e) => updateBank(i, "name", e.target.value)}
              />
              <input
                className="border p-2"
                placeholder="Number"
                value={b.number}
                onChange={(e) => updateBank(i, "number", e.target.value)}
              />
              <input
                className="border p-2"
                placeholder="IFSC"
                value={b.ifsc}
                onChange={(e) => updateBank(i, "ifsc", e.target.value)}
              />
              <input
                className="border p-2"
                placeholder="Branch"
                value={b.branch}
                onChange={(e) => updateBank(i, "branch", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addBank}
            className="px-3 py-1 bg-gray-700 text-white rounded"
          >
            + Add Bank
          </button>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          {editId ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
};

export default CreateBusinessUnit;
