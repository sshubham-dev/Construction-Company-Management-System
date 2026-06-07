import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Modal from "../../../components/Modal";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import ExpenseForm from "../../../components/CreateExpenses";

const ExpenseReports = () => {
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState("");
  const [approval, setApproval] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [expenseLedgers, setExpenseLedgers] = useState([]);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [editFrom, setEditForm] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const loadLedgers = async () => {
      const { data } = await axios.get(
        `/api/v1/ledger?comapnyId=${user.companyId}`,
      );
      console.log(data.data);
      // Expense ledgers (Expenses group)
      setExpenseLedgers(
        data.data.filter((l) => l.groupId?.name.includes("Expenses")),
      );
    };

    loadLedgers();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [
    selectedEmployee,
    selectedMonth,
    selectedYear,
    status,
    approval,
    selectedType,
  ]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/v1/employee", {
        params: { companyId: user.companyId },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExpenses = async () => {
    const res = await axios.get("/api/v1/expenses", {
      params: {
        employeeId: selectedEmployee,
        month: selectedMonth,
        year: selectedYear,
        type: selectedType,
        approval,
        status,
      },
    });
    console.log(res.data.expenses);
    setExpenses(res.data.expenses);
  };

  const expenseLedgerOptions = useMemo(() => {
    return [
      {
        value: "",
        label: "All Expense Types",
      },
      ...expenseLedgers.map((l) => ({
        value: l._id,
        label: l.name,
      })),
    ];
  }, [expenseLedgers]);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const totalPosted = expenses
    .filter((e) => e.status === "Posted")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPending = expenses
    .filter((e) => e.isApproved === "For Approval")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalApproved = expenses
    .filter((e) => e.isApproved === "Approved")
    .reduce((sum, e) => sum + e.amount, 0);

  const postExpense = async (id) => {
    await axios.put(`/api/v1/expenses/post/${id}`);

    fetchExpenses();
  };

  const getStatusBadge = (expense) => {
    if (expense.status === "Cancelled") return "bg-red-100 text-red-700";
    if (expense.status === "Posted") return "bg-green-100 text-green-700";
    if (expense.isApproved === "Approved") return "bg-blue-100 text-blue-700";
    if (expense.isApproved === "Rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

    try {
      await axios.delete(`/api/v1/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete expense");
    }
  };

  const handleEditExpense = (id) => {
    setEditId(id);
    setEditForm(true);
  };

  return (
    <div className="max-w-full mx-autopy-6 space-y-5">
      <h1 className="text-xl font-semibold">Expense Reports</h1>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-white p-4 border rounded-lg">
        {/* Expenses type */}
        <Select
          options={expenseLedgerOptions}
          value={expenseLedgerOptions.find((o) => o.value === selectedType)}
          onChange={(opt) => setSelectedType(opt.value || "")}
          placeholder="Expense Type..."
          isClearable
          className="col-span-2"
        />

        {/* Employee */}
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="border rounded px-2 py-2 col-span-2"
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name}
            </option>
          ))}
        </select>

        {/* Month */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-2 py-2"
        >
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString("en", { month: "long" })}
            </option>
          ))}
        </select>

        {/* Year */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border rounded px-2 py-2"
        >
          <option value="">All Years</option>
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-2 py-2"
        >
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Posted">Posted</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Approval */}
        <select
          value={approval}
          onChange={(e) => setApproval(e.target.value)}
          className="border rounded px-2 py-2"
        >
          <option value="">All Approval</option>
          <option value="For Approval">For Approval</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded p-4">
          <p className="text-gray-500 text-sm">Total Expenses</p>
          <p className="text-lg font-semibold">
            ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white border rounded p-4">
          <p className="text-gray-500 text-sm">Approved</p>
          <p className="text-lg font-semibold text-blue-600">
            ₹{totalApproved.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white border rounded p-4">
          <p className="text-gray-500 text-sm">Pending Approval</p>
          <p className="text-lg font-semibold text-yellow-600">
            ₹{totalPending.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white border rounded p-4">
          <p className="text-gray-500 text-sm">Posted</p>
          <p className="text-lg font-semibold text-green-600">
            ₹{totalPosted.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Employee</th>
              <th className="p-3">Expense Type</th>
              <th className="p-3">Expense For</th>
              <th className="p-3">Narration</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Attachment</th>
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center p-5 text-gray-500">
                  No expenses found
                </td>
              </tr>
            )}

            {expenses.map((exp) => (
              <tr key={exp._id} className={`border-t ${getStatusBadge(exp)}`}>
                <td className="p-3">
                  {new Date(exp.date).toLocaleDateString("en-IN")}
                </td>

                <td className="p-3">{exp?.paidByLedger?.name}</td>

                <td className="p-3">{exp?.expenseLedger?.name || "-"}</td>
                <td className="p-3">
                  {exp?.expenseForLedger?.name || exp?.expenseFor?.name}
                </td>

                <td className="p-3">{exp.narration}</td>

                <td className="p-3 font-semibold">
                  ₹{exp.amount.toLocaleString("en-IN")}
                </td>

                <td className="p-3">
                  {exp.attachments?.length > 0 ? (
                    <button
                      onClick={() => setSelectedPhoto(exp.attachments)}
                      className="text-indigo-600"
                    >
                      View ({exp.attachments.length})
                    </button>
                  ) : (
                    "-"
                  )}
                </td>

                {/*  */}
                <td className="p-3">
                  {user?.department === "Accountant" ||
                    user?.department === "Account Head" && (
                      <>
                        {exp.status !== "Posted" &&
                          exp.isApproved === "Approved" && (
                            <button
                              onClick={() => postExpense(exp._id)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Post
                            </button>
                          )}
                      </>
                    )}
                  {/* Delete */}
                  {/* {exp.status !== "Posted" &&
                    (exp.isApproved === "For Approval" ||
                      exp.isApproved === "Rejected") && ( */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditExpense(exp._id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(exp._id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                  {/* )} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attachment Modal */}

      {selectedPhoto && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPhoto(null)}
          head="Attachments"
        >
          <div className="space-y-3">
            {selectedPhoto.map((file, i) => (
              <div key={i} className="border rounded p-2">
                {file.fileType === "image" ? (
                  <img
                    src={file.url}
                    className="max-h-[70vh] w-full object-contain"
                  />
                ) : (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Open PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
      <Modal
        isOpen={editFrom}
        onClose={() => setEditForm(false)}
        head="Edit Expenses"
      >
        <ExpenseForm onClose={() => setEditForm(false)} editId={editId} />
      </Modal>
    </div>
  );
};

export default ExpenseReports;
