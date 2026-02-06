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
  const [loading, setLoading] = useState(false);
  const emptyBank = { name: "", number: "", ifsc: "", branch: "" };
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
    if (editId) loadBU(editId);
  }, [editId]);

  const loadEmployees = async () => {
    const res = await axios.get("/api/v1/employee?active=true");
    setEmployees(res.data || []);
  };

  const loadBU = async (id) => {
    const { data } = await axios.get(`/api/v1/business-unit/${id}`);

    setForm({
      name: data.name || "",
      type: data.type || "",
      code: data.code || "",
      phone: data.phone || "",
      email: data.email || "",
      gstNo: data.gstNo || "",
      panNo: data.panNo || "",
      manager: data.manager?._id || "",
      isActive: data.isActive ?? true,
      address: data.address || form.address,
      geo: data.geo || form.geo,
      bankAccounts: data.bankAccounts || [],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const k = name.split(".")[1];
      setForm({ ...form, address: { ...form.address, [k]: value } });
    } else if (name.startsWith("geo.")) {
      const k = name.split(".")[1];
      setForm({ ...form, geo: { ...form.geo, [k]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addBank = () =>
    setForm({ ...form, bankAccounts: [...form.bankAccounts, emptyBank] });

  const updateBank = (i, field, value) => {
    const updated = [...form.bankAccounts];
    updated[i][field] = value;
    setForm({ ...form, bankAccounts: updated });
  };
  const removeBank = (index) => {
    const updated = [...form.bankAccounts];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, bankAccounts: updated }));
  };
  const saveBU = async (e) => {
    e.preventDefault();

    if (editId) {
      await axios.put(`/api/v1/business-unit/${editId}`, form);
    } else {
      await axios.post("/api/v1/business-unit", form);
    }
    onClose();
  };

  return (
    <div className="mx-auto">
      <h2 className="text-lg font-semibold mb-4">
        {editId ? "Edit Business Unit" : "Create Business Unit"}
      </h2>

      <form onSubmit={saveBU} className="space-y-6">
        {/* BASIC INFO */}
        <Section title="Basic Information">
          <Input
            name="name"
            label="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Select
            name="type"
            label="Type"
            value={form.type}
            onChange={handleChange}
            required
            options={["Head Office", "Branch Office", "Project Office"]}
          />
          {editId && (
            <div>
              <label className="text-xs text-gray-500">Code</label>
              <p className="font-medium">{form.code}</p>
            </div>
          )}

          {editId && (
            <Select
              name="manager"
              label="Manager"
              value={form.manager}
              onChange={handleChange}
              options={employees.map((e) => ({
                label: e.name,
                value: e._id,
              }))}
            />
          )}
          <Checkbox
            name="isActive"
            label="Active"
            checked={form.isActive}
            onChange={handleChange}
          />
        </Section>

        {/* CONTACT & COMPLIANCE */}
        <Section title="Contact & Compliance">
          <Input
            name="phone"
            label="Phone"
            value={form.phone}
            onChange={handleChange}
          />
          <Input
            name="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            name="gstNo"
            label="GST No"
            value={form.gstNo}
            onChange={handleChange}
          />
          <Input
            name="panNo"
            label="PAN No"
            value={form.panNo}
            onChange={handleChange}
          />
        </Section>

        {/* ADDRESS */}
        <Section title="Address">
          <Input
            name="address.street"
            label="Street"
            value={form.address.street}
            onChange={handleChange}
          />
          <Input
            name="address.city"
            label="City"
            value={form.address.city}
            onChange={handleChange}
          />
          <Input
            name="address.district"
            label="District"
            value={form.address.district}
            onChange={handleChange}
          />
          <Input
            name="address.state"
            label="State"
            value={form.address.state}
            onChange={handleChange}
          />
          <Input
            name="address.pincode"
            label="Pincode"
            value={form.address.pincode}
            onChange={handleChange}
          />
        </Section>

        {/* GEO */}
        <Section title="Location (Optional)">
          <Input
            name="geo.lat"
            label="Latitude"
            value={form.geo.lat}
            onChange={handleChange}
          />
          <Input
            name="geo.lng"
            label="Longitude"
            value={form.geo.lng}
            onChange={handleChange}
          />
        </Section>

        {/* BANK ACCOUNTS */}
        <Section title="Bank Accounts">
          {form.bankAccounts.map((b, i) => (
            <div key={i} className="border p-3 rounded mb-3">
              <Input
                placeholder="Bank Name"
                value={b.name}
                onChange={(e) => updateBank(i, "name", e.target.value)}
              />
              <Input
                placeholder="Account Number"
                value={b.number}
                onChange={(e) => updateBank(i, "number", e.target.value)}
              />
              <Input
                placeholder="IFSC"
                value={b.ifsc}
                onChange={(e) => updateBank(i, "ifsc", e.target.value)}
              />
              <Input
                placeholder="Branch"
                value={b.branch}
                onChange={(e) => updateBank(i, "branch", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeBank(i)}
                className="text-red-600 text-sm mt-2"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addBank}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          >
            + Add Bank
          </button>
        </Section>

        <div className="text-right">
          <button
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            {loading ? "Saving..." : editId ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ---------- Reusable UI ---------- */

const Section = ({ title, children }) => (
  <div>
    <h3 className="font-medium mb-2">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    {label && <label className="text-sm">{label}</label>}
    <input {...props} className="border p-2 w-full rounded" />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    {label && <label className="text-sm">{label}</label>}
    <select {...props} className="border p-2 w-full rounded">
      <option value="">Select</option>
      {options.map((o, i) =>
        typeof o === "string" ? (
          <option key={i} value={o}>
            {o}
          </option>
        ) : (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        )
      )}
    </select>
  </div>
);

const Checkbox = ({ label, ...props }) => (
  <label className="flex items-center gap-2">
    <input type="checkbox" {...props} />
    {label}
  </label>
);

export default CreateBusinessUnit;
