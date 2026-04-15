import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, Toaster } from "react-hot-toast";

const CreateStore = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [businessUnits, setBusinessUnits] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    name: "",
    type: "STORE",
    businessUnitId: "",

    isCentralStore: false,

    storeHead: "",
    storeIncharge: "",

    surcharge: {
      staffSalary: "",
      expenses: "",
      investment: "",
      profit: "",
    },

    address: {
      line1: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  useEffect(() => {
    fetchBusinessUnits();
    fetchEmployees();
  }, []);

  const fetchBusinessUnits = async () => {
    const res = await axios.get("/api/v1/business-unit");
    setBusinessUnits(res.data.map((b) => ({ value: b._id, label: b.name })));
  };

  const fetchEmployees = async () => {
    const res = await axios.get("/api/v1/employee");
    setEmployees(res.data.map((e) => ({ value: e._id, label: e.name })));
  };

  useEffect(() => {
    if (!isEdit) return;

    const loadStore = async () => {
      const res = await axios.get(`/api/v1/store/${editId}`);
      const data = res.data;

      setForm((prev) => ({
        ...prev,
        ...data,
        businessUnitId: data.businessUnitId?._id,
        storeHead: data.storeHead?._id,
        storeIncharge: data.storeIncharge?._id,
        surcharge: {
          staffSalary: data.surcharge?.staffSalary || "",
          expenses: data.surcharge?.expenses || "",
          investment: data.surcharge?.investment || "",
          profit: data.surcharge?.profit || "",
        },
      }));
    };

    loadStore();
  }, [editId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((p) => ({ ...p, address: { ...p.address, [key]: value } }));
    } else if (name.startsWith("surcharge.")) {
      const key = name.split(".")[1];
      setForm((p) => ({
        ...p,
        surcharge: { ...p.surcharge, [key]: value },
      }));
    } else if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: checked }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!form.name) return toast.error("Store name required");
      if (!form.businessUnitId) return toast.error("Business Unit required");
      if (!form.storeHead) return toast.error("Store Head required");
      if (!form.storeIncharge) return toast.error("Store Incharge required");

      const payload = {
        ...form,
        surcharge: {
          staffSalary: Number(form.surcharge.staffSalary) || 0,
          expenses: Number(form.surcharge.expenses) || 0,
          investment: Number(form.surcharge.investment) || 0,
          profit: Number(form.surcharge.profit) || 0,
        },
      };

      if (isEdit) {
        await axios.put(`/api/v1/store/${editId}`, payload);
        toast.success("Store updated");
      } else {
        await axios.post("/api/v1/store", payload);
        toast.success("Store created");
      }

      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving store");
    }
  };

  return (
    <div className="mx-auto space-y-6">


      {/* BASIC INFO */}
      <Section title="Basic Information">
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Store Name" />

        <Select
          options={businessUnits}
          value={businessUnits.find((b) => b.value === form.businessUnitId)}
          onChange={(v) => setForm((p) => ({ ...p, businessUnitId: v.value }))}
          isDisabled={isEdit}
          placeholder="Business Unit"
        />

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="input"
          disabled={isEdit}
        >
          <option value="STORE">Store Warehouse</option>
          <option value="SITE">Site Warehouse</option>
        </select>

        <Checkbox
          name="isCentralStore"
          label="Central Store"
          checked={form.isCentralStore}
          onChange={handleChange}
        />
      </Section>

      {/* ROLES */}
      <Section title="People Responsible">
        <Select
          options={employees}
          value={employees.find((e) => e.value === form.storeHead)}
          onChange={(v) => setForm((p) => ({ ...p, storeHead: v.value }))}
          placeholder="Store Head"
        />

        <Select
          options={employees}
          value={employees.find((e) => e.value === form.storeIncharge)}
          onChange={(v) => setForm((p) => ({ ...p, storeIncharge: v.value }))}
          placeholder="Store Incharge"
        />
      </Section>

      {/* SURCHARGE */}
      <Section title="Cost Overheads (%)">
        <Input name="surcharge.staffSalary" value={form.surcharge.staffSalary} onChange={handleChange} placeholder="Staff Salary %" />
        <Input name="surcharge.expenses" value={form.surcharge.expenses} onChange={handleChange} placeholder="Expenses %" />
        <Input name="surcharge.investment" value={form.surcharge.investment} onChange={handleChange} placeholder="Investment %" />
        <Input name="surcharge.profit" value={form.surcharge.profit} onChange={handleChange} placeholder="Profit %" />
      </Section>

      {/* ADDRESS */}
      <Section title="Address (Optional)">
        <Input name="address.line1" value={form.address.line1} onChange={handleChange} placeholder="Address Line" />
        <Input name="address.city" value={form.address.city} onChange={handleChange} placeholder="City" />
        <Input name="address.state" value={form.address.state} onChange={handleChange} placeholder="State" />
        <Input name="address.pincode" value={form.address.pincode} onChange={handleChange} placeholder="Pincode" />
      </Section>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
          {isEdit ? "Update Store" : "Create Store"}
        </button>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default CreateStore;

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

const Checkbox = ({ label, ...props }) => (
  <label className="flex items-center gap-2 text-sm">
    <input type="checkbox" {...props} /> {label}
  </label>
);