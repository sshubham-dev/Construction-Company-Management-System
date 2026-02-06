import { useState } from "react";
const departments = [
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
];

const TaskTemplateModal = () => {
  const [task, setTask] = useState({
    name: "",
    role: "",
    frequency: "Daily",
    verificationMethod: "SYSTEM",
    verifiedBy: "",
    deadLine: "",
    refferenceID: "",
    status: "Active",
    description: "",
    enabled: true,
  });

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setTask({
      ...task,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  const handleSubmit = (e) =>{};

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Task Template</h1>
      <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <input
          name="name"
          placeholder="Task Name"
          value={task.name}
          onChange={update}
          className="border p-2 rounded col-span-2"
        />

        <select
          name="role"
          placeholder="Role"
          value={task.role}
          onChange={update}
          className="border p-2 rounded"
        >
          {departments.map((department, index) => (
            <option key={index} value={department}>
              {department}
            </option>
          ))}
        </select>

        <select
          name="frequency"
          value={task.frequency}
          onChange={update}
          className="border p-2 rounded"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>

        <select
          name="verificationMethod"
          value={task.verificationMethod}
          onChange={update}
          className="border p-2 rounded"
        >
          <option value="SYSTEM">System</option>
          <option value="APPROVAL">Approval</option>
          <option value="MIXED">Mixed</option>
        </select>

        <input
          name="verifiedBy"
          placeholder="Verified By (Role)"
          value={task.verifiedBy}
          onChange={update}
          className="border p-2 rounded"
        />

        <input
          name="deadLine"
          placeholder="Deadline (eg: Every Friday)"
          value={task.deadLine}
          onChange={update}
          className="border p-2 rounded"
        />
      </div>

      <textarea
        name="description"
        placeholder="Description"
        value={task.description}
        onChange={update}
        className="border p-2 rounded w-full"
      />

      <div className="grid grid-cols-2 gap-4 items-center">
        <select
          name="status"
          value={task.status}
          onChange={update}
          className="border p-2 rounded"
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enabled"
            checked={task.enabled}
            onChange={update}
          />
          Enabled
        </label>

      </div>

      <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Task
      </button>
      </form>
    </div>
  );
};

export default TaskTemplateModal;
