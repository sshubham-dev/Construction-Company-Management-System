import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateCompany = ({ onClose, editId }) => {
  const [loading, setLoading] = useState(false);

  const emptyBank = { name: "", number: "", ifsc: "", branch: "" };

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    gstNo: "",
    panNo: "",
    isActive: true,
    address: {
      street: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    },
    bankAccounts: [],
  });

  const [employees, setEmployees] = useState([]);

  /* =========================
     LOAD DATA
  ========================== */
  useEffect(() => {
    if (editId) loadBU(editId);
  }, [editId]);

  const loadBU = async (id) => {
    try {
      const { data } = await axios.get(`/api/v1/company/${id}`);

      setForm({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        gstNo: data.gstNo || "",
        panNo: data.panNo || "",
        manager: data.manager?._id || "",
        isActive: data.isActive ?? true,
        address: data.address || {
          street: "",
          city: "",
          district: "",
          state: "",
          pincode: "",
        },
        bankAccounts: data.bankAccounts || [],
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
     BANK HANDLING
  ========================== */
  const addBank = () =>
    setForm((prev) => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, emptyBank],
    }));

  const updateBank = (i, field, value) => {
    const updated = [...form.bankAccounts];
    updated[i][field] = value;

    setForm((prev) => ({
      ...prev,
      bankAccounts: updated,
    }));
  };

  const removeBank = (index) => {
    const updated = [...form.bankAccounts];
    updated.splice(index, 1);

    setForm((prev) => ({
      ...prev,
      bankAccounts: updated,
    }));
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

      if (editId !== undefined) {
        await axios.put(`/api/v1/company/${editId}`, payload);
        onClose();
      } else {
        await axios.post("/api/v1/company", payload);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("Error saving company");
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

          {/* CONTACT */}
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
              name="address.state"
              label="State"
              value={form.address.state}
              onChange={handleChange}
            />
            <Input
              name="address.pincode"
              label="Pin Code"
              value={form.address.pincode}
              onChange={handleChange}
            />
          </Section>

          {/* BANK */}
          <Section title="Bank Accounts">
            {form.bankAccounts.map((b, i) => (
              <div key={i} className="border p-2 grid gap-2">
                <Input
                  value={b.name}
                  onChange={(e) => updateBank(i, "name", e.target.value)}
                  placeholder="Bank Name"
                />
                <Input
                  value={b.number}
                  onChange={(e) => updateBank(i, "number", e.target.value)}
                  placeholder="Account Number"
                />
                <Input
                  value={b.ifsc}
                  onChange={(e) => updateBank(i, "ifsc", e.target.value)}
                  placeholder="IFSC code"
                />
                <Input
                  value={b.branch}
                  onChange={(e) => updateBank(i, "branch", e.target.value)}
                  placeholder="Branch"
                />
                <button
                  onClick={() => removeBank(i)}
                  type="button"
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}

            <button type="button" onClick={addBank} className="btn-gray">
              + Add Bank
            </button>
          </Section>

          <Checkbox
            name="isActive"
            label="Active"
            checked={form.isActive}
            onChange={handleChange}
          />
        </Section>

        {/* ACTION */}
        <div className="text-right flex justify-end gap-4">
          <button disabled={loading} className="btn-primary">
            {loading ? "Saving..." : editId ? "Update" : "Create"}
          </button>
          <button onClick={() => onClose()} className="btn-primary">
            Cancel
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
        ),
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

export default CreateCompany;
