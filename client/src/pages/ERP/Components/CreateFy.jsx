import { useState } from "react";

const CreateFy = ({ open, onSave }) => {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
  });

  if (!open) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-4 bg-white">
      <Input
        label="Start Date"
        name="startDate"
        type="date"
        onChange={(e) =>
          setForm({
            ...form,

            startDate: e.target.value,
          })
        }
        value={form.startDate}
      />

      <Input
        label="End Date"
        name="endDate"
        type="date"
        onChange={(e) =>
          setForm({
            ...form,

            endDate: e.target.value,
          })
        }
        value={form.endDate}
      />

      <button
        onClick={() => onSave(form)}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
      >
        Create
      </button>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <input {...props} className="border rounded-lg px-3 py-2 w-full" />
  </div>
);

export default CreateFy;
