import { useState } from "react";

const employees = [
  { id: "EMP-001", name: "Shubham Kumar" },
  { id: "EMP-002", name: "Rahul Singh" },
];

const templates = [
  { id: "TLT-001", name: "Design Engineer – Monthly" },
  { id: "TLT-002", name: "Site Incharge – Monthly" },
];

const AssignForm = ({ onAssign }) => {
  const [form, setForm] = useState({
    employeeId: "",
    templateId: "",
    startMonth: "",
  });

  const submit = () => {
    if (!form.employeeId || !form.templateId || !form.startMonth) return;

    const employee = employees.find(e => e.id === form.employeeId);
    const template = templates.find(t => t.id === form.templateId);

    onAssign({
      id: `ASSIGN-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      templateId: template.id,
      templateName: template.name,
      startMonth: form.startMonth,
      status: "Active",
    });

    setForm({ employeeId: "", templateId: "", startMonth: "" });
  };

  return (
    <div className="border rounded p-4 bg-gray-50">
      <h2 className="font-medium mb-4">New Assignment</h2>

      <div className="grid grid-cols-3 gap-4">
        <select
          className="border rounded px-3 py-2"
          value={form.employeeId}
          onChange={(e) =>
            setForm({ ...form, employeeId: e.target.value })
          }
        >
          <option value="">Select Employee</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          value={form.templateId}
          onChange={(e) =>
            setForm({ ...form, templateId: e.target.value })
          }
        >
          <option value="">Select Template</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <input
          type="month"
          className="border rounded px-3 py-2"
          value={form.startMonth}
          onChange={(e) =>
            setForm({ ...form, startMonth: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={submit}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Assign
        </button>
      </div>
    </div>
  );
};

export default AssignForm;
