import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
axios.defaults.withCredentials = true;

const CreateSalary = ({ onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [form, setForm] = useState({
    employeeId: "",
    employeeName: "",
    employeeCode: "",
    department: "",
    month: moment().format("YYYY-MM-DD"),
    baseSalary: 0,
    workingDays: 0,
    daysWorked: 0,
    trafficScore: "",
    trafficBonus: 0,
    targetBonus: 0,
    otherAdditions: 0,
    otherDeductions: 0,
  });
  const [trafficlightBonus, setTrafficLightBonus] = useState(null);

  const [result, setResult] = useState(null);

  useEffect(() => {
    axios.get("/api/v1/employee").then((res) => {
      setEmployees(res.data);
    });
  }, []);

  const handleEmployeeSelect = (id) => {
    const emp = employees.find((e) => e._id === id);
    console.log(emp);
    setForm({
      ...form,
      employeeId: emp._id,
      employeeName: emp.name,
      employeeCode: emp.code,
      department: emp.department,
      baseSalary: emp.baseSalary,
    });
    setTrafficLightBonus(emp?.incentiveConfig?.trafficLight || 0);
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const attendanceResponse = await axios.get(
          `/api/v1/attendance/employee?employeeId=${form.employeeId}`,
        );

        const data = attendanceResponse.data;

        if (Array.isArray(data)) {
          const startOfMonth = dayjs(form.month).startOf("month");
          const endOfMonth = dayjs(form.month).endOf("month");

          const monthlyPresent = data.filter(
            (a) =>
              a.status.toLowerCase() === "present" &&
              dayjs(a.date).isBetween(startOfMonth, endOfMonth, null, "[]"),
          );
          console.log(monthlyPresent);
          setForm((prev) => ({
            ...prev,
            daysWorked: monthlyPresent.length,
            //   workingDays:,
          }));
        } else {
          console.error("Invalid attendance data:", data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchExpenses = async () => {
      const res = await axios.get("/api/v1/expenses/", {
        params: {
          employeeId: form.employeeId,
          month: form.month,
        },
      });

      console.log(res.data);

      const total = res.data?.expenses.reduce((sum, e) => sum + e.amount, 0);
      setExpenses(res.data?.expenses);
      setForm((prev) => ({
        ...prev,
        otherAdditions: total,
      }));
    };

    if (form.employeeId && form.month) {
      fetchAttendance();
      fetchExpenses();
      setForm((prev) => ({
        ...prev,
        workingDays: workingDaysInMonth(form.month),
      }));
    }
  }, [form.employeeId, form.month]);

  const workingDaysInMonth = (
    selectedMonth,
    weeklyOffDay = 0,
    extraHolidays = [],
  ) => {
    const year = moment(selectedMonth).year();
    const month = moment(selectedMonth).month(); // 0-based
    const totalDays = moment({ year, month }).daysInMonth();

    // Define fixed national holidays (same every year)
    const fixedHolidays = [
      moment(`${year}-01-01`), // New Year
      moment(`${year}-01-26`), // Republic Day
      moment(`${year}-08-15`), // Independence Day
      moment(`${year}-10-02`), // Gandhi Jayanti
    ];

    // Merge extraHolidays (festivals) + fixed ones
    const holidays = [...fixedHolidays, ...extraHolidays];

    let workingDays = 0;

    for (let day = 1; day <= totalDays; day++) {
      const currentDate = moment({ year, month, day });

      // Skip if it's the weekly off
      if (currentDate.day() === weeklyOffDay) continue;

      // Skip if it's in holidays list
      if (holidays.some((holiday) => currentDate.isSame(holiday, "day")))
        continue;

      workingDays++;
    }

    return workingDays;
  };

  const calculateSalary = () => {
    const perDay = form.baseSalary / form.workingDays;

    const leaveDeduction = form.baseSalary - perDay * form.daysWorked;

    const salaryAfterLeave = form.baseSalary - leaveDeduction;

    const esicEmployee = salaryAfterLeave * 0.0075;

    const esicEmployer = salaryAfterLeave * 0.0325;

    const totalAdditions =
      Number(form.trafficBonus) +
      Number(form.targetBonus) +
      Number(form.otherAdditions);

    const totalDeductions =
      Number(leaveDeduction) + Number(form.otherDeductions);

    const netSalary =
      Number(form.baseSalary) + totalAdditions - totalDeductions;

    setResult({
      leaveDeduction,
      esicEmployee,
      esicEmployer,
      totalAdditions,
      totalDeductions,
      netSalary,
    });
  };

  const saveSalary = async () => {
    await axios.post("/api/v1/payroll", {
      ...form,
      ...result,
    });

    onClose();
    alert("Salary saved");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Form Grid */}
      <form
        onSubmit={saveSalary}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Employee */}

        <div>
          <label className="text-sm text-gray-600">Employee</label>

          <select
            className="w-full border rounded-lg px-3 py-2"
            onChange={(e) => handleEmployeeSelect(e.target.value)}
          >
            <option>Select Employee</option>

            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}

        <div>
          <label className="text-sm text-gray-600">Month</label>

          <input
            type="month"
            className="w-full border rounded-lg px-3 py-2"
            onChange={(e) => setForm({ ...form, month: e.target.value })}
          />
        </div>

        {/* Base Salary */}

        <div>
          <label className="text-sm text-gray-600">Base Salary</label>

          <input
            type="number"
            value={form.baseSalary}
            className="w-full border rounded-lg px-3 py-2"
            onChange={(e) =>
              setForm({
                ...form,
                baseSalary: e.target.value,
              })
            }
          />
        </div>

        {/* Working Days */}

        <div>
          <label className="text-sm text-gray-600">Working Days</label>

          <input
            type="number"
            value={form.workingDays}
            className="w-full border rounded-lg px-3 py-2"
            onChange={(e) =>
              setForm({
                ...form,
                workingDays: e.target.value,
              })
            }
          />
        </div>

        {/* Days Worked */}

        <div>
          <label className="text-sm text-gray-600">Days Worked</label>

          <input
            type="number"
            value={form.daysWorked}
            className="w-full border rounded-lg px-3 py-2"
            onChange={(e) =>
              setForm({
                ...form,
                daysWorked: e.target.value,
              })
            }
          />
        </div>

        {/* Traffic Score */}

        <div>
          <label className="text-sm text-gray-600">Traffic Score</label>

          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            onChange={(e) =>
              setForm({
                ...form,
                trafficScore: e.target.value,
              })
            }
            min="0"
            max="100"
          />
        </div>

        {/* Target Bonus */}

        <div>
          <label className="text-sm text-gray-600">Target Bonus</label>

          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            value={form.trafficBonus}
            disabled
            min="0"
          />
        </div>

        {/* Other Deductions */}

        <div>
          <label className="text-sm text-gray-600">Other Deductions</label>

          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            onChange={(e) =>
              setForm({
                ...form,
                otherDeductions: e.target.value,
              })
            }
          />
        </div>

        {/* Other Addition */}

        <div>
          <label className="text-sm text-gray-600">Expenses</label>

          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            value={form.otherAdditions}
            onChange={(e) =>
              setForm({
                ...form,
                otherAdditions: e.target.value,
              })
            }
          />
        </div>

        {/* Buttons */}

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={calculateSalary}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Calculate Salary
          </button>
        </div>

        {/* Result */}

        {result && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Salary Breakdown</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>Leave Deduction: ₹{result.leaveDeduction.toFixed(2)}</div>

              <div>ESIC Employee: ₹{result.esicEmployee.toFixed(2)}</div>

              <div>ESIC Employer: ₹{result.esicEmployer.toFixed(2)}</div>

              <div>Total Additions: ₹{result.totalAdditions}</div>

              <div>Total Deductions: ₹{result.totalDeductions}</div>

              <div className="font-semibold text-green-600">
                Net Salary: ₹{result.netSalary}
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Save Salary
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateSalary;
