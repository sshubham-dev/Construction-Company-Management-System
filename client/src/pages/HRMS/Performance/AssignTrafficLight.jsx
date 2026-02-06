import { useState } from "react";
import AssignForm from "./AssignForm";
import AssignedList from "./AssignedList";

const AssignTrafficLight = () => {
  const [assignments, setAssignments] = useState([
    {
      id: "ASSIGN-001",
      employeeId: "EMP-001",
      employeeName: "Shubham Kumar",
      templateId: "TLT-001",
      templateName: "Design Engineer – Monthly",
      startMonth: "2025-01",
      status: "Active",
    },
  ]);

  const addAssignment = (data) => {
    setAssignments((prev) => [...prev, data]);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Assign Traffic Light</h1>

      <AssignForm onAssign={addAssignment} />

      <AssignedList assignments={assignments} />
    </div>
  );
};

export default AssignTrafficLight;
