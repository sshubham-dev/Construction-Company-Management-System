import { useState } from "react";


const CreateTaskTemplate = ({ onSave }) => {
  const [form, setForm] = useState({
    role: "Site Supervisor",
    name: "",
    type: "MANUAL",
    frequency: "WEEKLY",
    weight: 5,
    excludeFromScore: false,
    approvalRequired: true,
    deadlineMode: "DAY_OF_WEEK",
    deadlineValue: "MONDAY"
  });

  const submit = () => {
    onSave({
      id: crypto.randomUUID(),
      role: form.role,
      name: form.name,
      type: form.type,
      frequency: form.frequency,
      weight: Number(form.weight),
      excludeFromScore: form.excludeFromScore,
      approvalRequired: form.approvalRequired,
      deadline: {
        mode: form.deadlineMode,
        value: form.deadlineValue
      }
    });
  };

  return (
    <div className="bg-white border rounded p-4 space-y-3">
      <h2 className="font-medium">Create Task Template</h2>

      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Task Name"
          className="border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="border p-2 rounded"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option>Site Supervisor</option>
          <option>Design</option>
          <option>Marketing</option>
          <option>Accounts</option>
        </select>

        <select
          className="border p-2 rounded"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="MANUAL">Manual</option>
          <option value="SYSTEM">System</option>
        </select>

        <select
          className="border p-2 rounded"
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value })}
        >
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
        </select>

        <input
          type="number"
          placeholder="Weight"
          className="border p-2 rounded"
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
        />

        <select
          className="border p-2 rounded"
          value={form.deadlineValue}
          onChange={(e) =>
            setForm({ ...form, deadlineValue: e.target.value })
          }
        >
          <option>MONDAY</option>
          <option>TUESDAY</option>
          <option>WEDNESDAY</option>
          <option>THURSDAY</option>
          <option>FRIDAY</option>
          <option>SATURDAY</option>
        </select>
      </div>

      <div className="flex gap-4 text-sm">
        <label>
          <input
            type="checkbox"
            checked={form.excludeFromScore}
            onChange={(e) =>
              setForm({ ...form, excludeFromScore: e.target.checked })
            }
          />{" "}
          Exclude from score
        </label>

        <label>
          <input
            type="checkbox"
            checked={form.approvalRequired}
            onChange={(e) =>
              setForm({ ...form, approvalRequired: e.target.checked })
            }
          />{" "}
          Approval required
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={submit}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Save Template
        </button>
      </div>
    </div>
  );
}

export default CreateTaskTemplate