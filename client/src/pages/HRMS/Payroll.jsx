import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../../components/Modal";
import CreateSalary from "../../components/CreateSalary";

const Payroll = () => {
  const [salaries, setSalaries] = useState([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [createModal, setCreateModal] = useState(false);

  useEffect(() => {
    fetchSalary();
  }, []);

  const fetchSalary = async () => {
    const res = await axios.get("/api/v1/payroll");
    setSalaries(res.data);
  };

  const deleteSalary = async (id) => {
    if (!window.confirm("Delete salary record?")) return;
    await axios.delete(`/api/v1/payroll/${id}`);
    fetchSalary();
  };

  const filtered = salaries.filter((s) => {
    const matchSearch =
      s.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      s.employeeCode?.toLowerCase().includes(search.toLowerCase());

    const date = new Date(s.createdAt);

    const matchMonth = !month || date.getMonth() + 1 === Number(month);

    const matchYear = !year || date.getFullYear() === Number(year);

    return matchSearch && matchMonth && matchYear;
  });

  return (
    <div className="p-4 md:p-6">
      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Salary History</h1>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full md:w-auto"
          onClick={() => setCreateModal(true)}
        >
          + Calculate Salary
        </button>
      </div>

      {/* Filters */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <input
          type="text"
          placeholder="Search employee..."
          className="border rounded-lg px-3 py-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded-lg px-3 py-2 w-full"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">All Months</option>

          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString("default", {
                month: "long",
              })}
            </option>
          ))}
        </select>

        <select
          className="border rounded-lg px-3 py-2 w-full"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">All Years</option>

          {[2026, 2025, 2024].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Desktop Table */}

      <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Code</th>
              <th className="p-3">Department</th>
              <th className="p-3">Month</th>
              <th className="p-3">Net Salary</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((salary) => (
              <tr key={salary._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{salary.employeeName}</td>

                <td className="p-3">{salary.employeeCode}</td>

                <td className="p-3">{salary.department}</td>

                <td className="p-3">{salary.month}</td>

                <td className="p-3 font-semibold">₹{salary.netSalary}</td>

                <td className="p-3">
                  <div className="flex justify-center gap-3">
                    <button className="text-blue-600">View</button>

                    <button className="text-green-600">Edit</button>

                    <button className="text-purple-600">Download</button>

                    <button
                      className="text-red-600"
                      onClick={() => deleteSalary(salary._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}

      <div className="md:hidden space-y-4">
        {filtered.map((salary) => (
          <div key={salary._id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between mb-2">
              <div className="font-semibold">{salary.employeeName}</div>

              <div className="text-sm text-gray-500">{salary.month}</div>
            </div>

            <div className="text-sm text-gray-600">
              Code: {salary.employeeCode}
            </div>

            <div className="text-sm text-gray-600">
              Dept: {salary.department}
            </div>

            <div className="mt-2 font-medium">
              Net Salary: ₹{salary.netSalary}
            </div>

            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              <button className="text-blue-600">View</button>

              <button className="text-green-600">Edit</button>

              <button className="text-purple-600">Download</button>

              <button
                className="text-red-600"
                onClick={() => deleteSalary(salary._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        head="Calculate Salary"
      >
        <CreateSalary onClose={() => setCreateModal(false)} />
      </Modal>
    </div>
  );
};

export default Payroll;
