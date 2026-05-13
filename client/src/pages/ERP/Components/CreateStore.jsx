import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import toast from "react-hot-toast";

const CreateStore = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);

  const [businessUnits, setBusinessUnits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [costCenters, setCostCenters] = useState([]);

  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "WAREHOUSE",
    businessUnitId: "",
    costCenterId: "",
    storeHead: "",
    storeIncharge: "",
    address: {
      line1: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  /* =========================
     LOAD MASTER DATA
  ========================== */
  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const [buRes, empRes, ccRes] = await Promise.all([
        axios.get("/api/v1/business-unit"),
        axios.get("/api/v1/employee"),
        axios.get("/api/v1/cost-center"),
      ]);
      console.log(empRes.data);
      setBusinessUnits(
        buRes.data.map((b) => ({ value: b._id, label: b.name })),
      );
      setEmployees(
        empRes.data.map((e) => ({ value: e.userId, label: e.name })),
      );
      setCostCenters(
        ccRes.data.map((c) => ({
          value: c._id,
          label: c?.name + "-" + c?.createdAt,
        })),
      );
    } catch {
      toast.error("Failed to load master data");
    }
  };

  /* =========================
     LOAD EDIT DATA
  ========================== */
  useEffect(() => {
    if (!isEdit) return;

    const loadStore = async () => {
      try {
        const res = await axios.get(`/api/v1/store/${editId}`);
        const d = res.data.data;
        console.log(d);
        setForm({
          name: d.name || "",
          code: d.code || "",
          type: d.type || "WAREHOUSE",
          businessUnitId: d.businessUnitId?._id || "",
          costCenterId: d.costCenterId?._id || "",
          storeHead: d.storeHead?._id || "",
          storeIncharge: d.storeIncharge?._id || "",
          address: {
            line1: d.address?.line1 || "",
            city: d.address?.city || "",
            state: d.address?.state || "",
            pincode: d.address?.pincode || "",
          },
        });
      } catch (err) {
        console.log(err);
        toast.error("Failed to load store");
      }
    };

    loadStore();
  }, [editId]);

  /* =========================
     HANDLER
  ========================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((p) => ({
        ...p,
        address: { ...p.address, [key]: value },
      }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async () => {
    try {
      if (!form.name.trim()) return toast.error("Name required");
      if (!form.businessUnitId) return toast.error("Business unit required");
      if (!form.storeHead) return toast.error("Store head required");
      if (!form.storeIncharge) return toast.error("Store incharge required");

      const payload = {
        ...form,
        name: form.name.trim(),
        code: form.code?.trim(),
        // companyId: user?.companyId,
      };

      setLoading(true);

      if (editId !== undefined) {
        await axios.put(`/api/v1/store/${editId}`, payload);
        toast.success("Store updated");
      } else {
        await axios.post(`/api/v1/store`, payload);
        toast.success("Store created");
      }

      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* BASIC */}
      <Section title="Basic Info">
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Store Name"
        />

        <Input
          name="code"
          value={form.code}
          onChange={handleChange}
          placeholder="Store Code"
        />

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          disabled={isEdit}
        >
          <option value="WAREHOUSE">Warehouse</option>
          <option value="SITE">Site</option>
        </select>

        <Select
          options={businessUnits}
          value={businessUnits.find((b) => b.value === form.businessUnitId)}
          onChange={(v) => setForm((p) => ({ ...p, businessUnitId: v.value }))}
          placeholder="Business Unit"
        />

        <Select
          options={costCenters}
          value={costCenters.find((c) => c.value === form.costCenterId)}
          onChange={(v) => setForm((p) => ({ ...p, costCenterId: v.value }))}
          placeholder="Cost Center"
        />
      </Section>

      {/* PEOPLE */}
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

      {/* ADDRESS */}
      <Section title="Address">
        <Input
          name="address.line1"
          value={form.address.line1}
          onChange={handleChange}
          placeholder="Address"
        />
        <Input
          name="address.city"
          value={form.address.city}
          onChange={handleChange}
          placeholder="City"
        />
        <Input
          name="address.state"
          value={form.address.state}
          onChange={handleChange}
          placeholder="State"
        />
        <Input
          name="address.pincode"
          value={form.address.pincode}
          onChange={handleChange}
          placeholder="Pincode"
        />
      </Section>

      {/* ACTION */}
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="border px-4 py-2 rounded">
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update Store" : "Create Store"}
        </button>
      </div>
    </div>
  );
};

export default CreateStore;

/* HELPERS */

const Section = ({ title, children }) => (
  <div className="border rounded p-4 space-y-3 bg-white">
    <p className="text-sm font-medium">{title}</p>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className="border p-2 w-full rounded" />
);
