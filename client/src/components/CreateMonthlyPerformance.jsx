import { useState } from "react";
import { generateMonthlyPerformance } from "./MonthlyPerformance/monthlyPerformance.api";
import { useNavigate } from "react-router-dom";

const CreateMonthlyPerformance = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employeeId: "",
    month: "",
    trafficLightRuleId: "",
  });

  const submit = async () => {
    if (!form.employeeId || !form.month || !form.trafficLightRuleId) {
      alert("All fields required");
      return;
    }

    await generateMonthlyPerformance(form);
    navigate("/monthly-performance");
  };

  return (
    <div className=" mx-auto space-y-4">
      <h1 className="text-xl font-semibold">
        Generate Monthly Performance
      </h1>

      <input
        className="border p-2 rounded w-full"
        placeholder="Employee ID"
        onChange={(e) =>
          setForm({ ...form, employeeId: e.target.value })
        }
      />

      <input
        type="month"
        className="border p-2 rounded w-full"
        onChange={(e) =>
          setForm({ ...form, month: e.target.value })
        }
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Traffic Light Rule ID"
        onChange={(e) =>
          setForm({
            ...form,
            trafficLightRuleId: e.target.value,
          })
        }
      />

      <button
        onClick={submit}
        className="bg-blue-600 text-white w-full py-2 rounded"
      >
        Generate
      </button>
    </div>
  );
};

export default CreateMonthlyPerformance;
