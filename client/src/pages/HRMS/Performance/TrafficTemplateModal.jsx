import { useState } from "react";

const mockTasks = [
  { id: "TASK-001", name: "Site Inspection" },
  { id: "TASK-002", name: "Drawing Submission" },
  { id: "TASK-003", name: "Bill Processing" },
];

const roles = [
  "Accountant",
  "Marketing",
  "Ceo",
  "Site Incharge",
  "Site Supervisor",
  "Design Engineer",
  "Quality Engineer",
  "Store Incharge",
  "H.R",
  "Account Head",
  "Store Helper",
  "Developer",
];

const TrafficTemplateModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    role: "",
    green: 90,
    amber: 70,
    greenBonus: 2000,
    redPenalty: 1000,
    tasks: [],
  });

  const toggleTask = (taskId) => {
    setForm((prev) => ({
      ...prev,
      tasks: prev.tasks.includes(taskId)
        ? prev.tasks.filter((id) => id !== taskId)
        : [...prev.tasks, taskId],
    }));
  };

  const submit = () => {
    if (!form.name || !form.role || form.tasks.length === 0) return;

    onSave({
      id: `TLT-${Date.now()}`,
      name: form.name,
      role: form.role,
      thresholds: {
        green: Number(form.green),
        amber: Number(form.amber),
      },
      bonus: {
        green: Number(form.greenBonus),
        red: -Number(form.redPenalty),
      },
      tasks: form.tasks,
      status: "Active",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded p-6">
        <h2 className="text-lg font-semibold mb-4">
          Create Traffic Light Template
        </h2>

        <div className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Template Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <select
            className="w-full border rounded px-3 py-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Thresholds */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Green ≥ %"
              value={form.green}
              onChange={(e) => setForm({ ...form, green: e.target.value })}
            />
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Amber ≥ %"
              value={form.amber}
              onChange={(e) => setForm({ ...form, amber: e.target.value })}
            />
          </div>

          {/* Bonus */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Green Bonus"
              value={form.greenBonus}
              onChange={(e) => setForm({ ...form, greenBonus: e.target.value })}
            />
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Red Penalty"
              value={form.redPenalty}
              onChange={(e) => setForm({ ...form, redPenalty: e.target.value })}
            />
          </div>

          {/* Task Selection */}
          <div>
            <p className="text-sm font-medium mb-2">Select Tasks</p>
            <div className="space-y-2">
              {mockTasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.tasks.includes(task.id)}
                    onChange={() => toggleTask(task.id)}
                  />
                  {task.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrafficTemplateModal;
