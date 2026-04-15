import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateBusinessUnit = ({ onClose, editId }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "",
    code: "",
    phone: "",
    email: "",
    manager: "",
    isActive: true,
    address: {
      city: "",
      district: "",
    },
    companyId: null,
  });

  const [employees, setEmployees] = useState([]);
  const [company, setCompany] = useState([]);
  /* =========================
     LOAD DATA
  ========================== */
  useEffect(() => {
    loadEmployees();
    fetchCompany();
    if (editId) loadBU(editId);
  }, [editId]);

  const loadEmployees = async () => {
    try {
      const res = await axios.get("/api/v1/employee?active=true");
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };
    const fetchCompany = async () => {
    const res = await axios.get("/api/v1/company");
    console.log(res.data);
    setCompany(res.data);
  };

  const loadBU = async (id) => {
    try {
      const { data } = await axios.get(`/api/v1/business-unit/${id}`);
      console.log(data)
      setForm({
        name: data.name || "",
        type: data.type || "",
        code: data.code || "",
        phone: data.phone || "",
        email: data.email || "",
        manager: data.manager._id || data.manager,
        isActive: data.isActive ?? true,
        address: data.address || {
          city: "",
          district: "",
        },
        companyId: data.companyId || null,
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     HANDLE CHANGE
  ========================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const k = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [k]: value },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };


  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
      };
      console.log("Payload:", payload);

      if (editId !== undefined) {
        await axios.put(`/api/v1/business-unit/${editId}`, payload);
      } else {
        await axios.post("/api/v1/business-unit", payload);
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving business unit");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* BASIC */}
        <Section title="Basic Information">
          <Input
            name="name"
            label="Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <SelectField
            name="type"
            label="Type"
            value={form.type}
            onChange={handleChange}
            options={[
              "Head Office",
              "Branch Office",
              "Project Office",
            ]}
          />

          {/* Code always readonly */}
          {form.code && (
            <div>
              <label className="text-xs text-gray-500">Code</label>
              <p className="font-medium">{form.code}</p>
            </div>
          )}

          {/* Manager ALWAYS visible */}
          <SelectField
            name="companyId"
            label="Company"
            value={form.companyId}
            onChange={handleChange}
            options={company.map((e) => ({
              label: e.name,
              value: e._id,
            }))}
          />

          <SelectField
            name="manager"
            label="Manager"
            value={form.manager}
            onChange={handleChange}
            options={employees.map((e) => ({
              label: e.name,
              value: e._id,
            }))}
          />

          <Checkbox
            name="isActive"
            label="Active"
            checked={form.isActive}
            onChange={handleChange}
          />
        </Section>

        {/* CONTACT */}
        <Section title="Contact & Compliance">
          <Input name="phone" label="Phone" value={form.phone} onChange={handleChange} />
          <Input name="email" label="Email" value={form.email} onChange={handleChange} />
        </Section>

        {/* ADDRESS */}
        <Section title="Address">
          <Input name="address.city" label="City" value={form.address.city} onChange={handleChange} />
          <Input name="address.district" label="District" value={form.address.district} onChange={handleChange} />
        </Section>

        {/* ACTION */}
        <div className="text-right">
          <button disabled={loading} className="btn-primary">
            {loading ? "Saving..." : editId ? "Update" : "Create"}
          </button>
        </div>

      </form>
    </div>
  );
};

/* ---------- UI COMPONENTS ---------- */

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

const SelectField = ({ label, options, ...props }) => (
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