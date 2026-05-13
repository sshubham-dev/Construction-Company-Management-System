import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Select from "react-select";

const CreateCategory = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);
  const [categories, setCategory] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get("/api/v1/stock-category");
        setCategory(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategory();
  }, []);
  /* =========================
     LOAD EDIT DATA
  ========================== */
  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        const res = await axios.get(`/api/v1/stock-category/${editId}`);
        const d = res.data.data;

        setForm({
          name: d.name || "",
          code: d.code || "",
          description: d.description || "",
          isActive: d.isActive ?? true,
        });
      } catch {
        toast.error("Failed to load category");
      }
    };

    load();
  }, [editId]);

  /* =========================
     HANDLER
  ========================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!form.name.trim()) {
        return toast.error("Name required");
      }

      const payload = {
        ...form,
        name: form.name.trim(),
        code: form.code?.trim(),
      };

      setLoading(true);

      if (isEdit) {
        await axios.put(`/api/v1/stock-category/${editId}`, payload);
        toast.success("Category updated");
      } else {
        await axios.post(`/api/v1/stock-category`, payload);
        toast.success("Category created");
      }

      onClose();
    } catch (err) {
      console.log(err)
      toast.error(err.response?.data?.error || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Section title="Basic Info">
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Category Name"
        />

        <Select
          placeholder="Parent"
          options={categories.map((s) => ({ value: s._id, label: s.name }))}
          onChange={handleChange}
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 w-full rounded"
        />
      </Section>

      {isEdit && (
        <Section title="Status">
          <label className="flex gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            Active
          </label>
        </Section>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="border px-3 py-2 rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default CreateCategory;

/* helpers */
const Section = ({ title, children }) => (
  <div className="border p-4 rounded space-y-3 bg-white">
    <p className="text-sm font-medium">{title}</p>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className="border p-2 w-full rounded" />
);
