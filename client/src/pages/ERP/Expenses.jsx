import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../components/Modal";
import ExpenseForm from "../../components/CreateExpenses";
import { useSelector } from "react-redux";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editFrom, setEditForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const { user } = useSelector((state) => state.auth);
  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth]);
  const fetchExpenses = async () => {
    try {
      const response = await axios.get("/api/v1/expenses", {
        params: {
          userId: user._id,
          month: selectedMonth,
        },
      });
      setExpenses(response.data.expenses);
      console.log("Fetched Expenses:", response.data.expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const filteredExpenses = expenses?.filter((expense) => {
    const expDate = new Date(expense.date);
    return (
      expDate.getMonth() + 1 === Number(selectedMonth) &&
      expDate.getFullYear() === Number(selectedYear)
    );
  });

  const handleEditExpense = (id) => {
    setEditId(id);
    setEditForm(true);
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

  const getStatusBadge = (expense) => {
    if (expense.status === "Cancelled") return "bg-red-100 text-red-700";
    if (expense.status === "Posted") return "bg-green-100 text-green-700";
    if (expense.isApproved === "Approved") return "bg-blue-100 text-blue-700";
    if (expense.isApproved === "Rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusLabel = (expense) => {
    if (expense.status === "Cancelled") return "CANCELLED";
    if (expense.status === "Posted") return "POSTED";
    if (expense.isApproved === "Approved") return "APPROVED";
    if (expense.isApproved === "Rejected") return "REJECTED";
    return "FOR APPROVAL";
  };

  const handleCancelExpense = async (id) => {
    if (!window.confirm("Cancel this expense?")) return;

    try {
      await axios.put(`/api/v1/expenses/cancel/${id}`);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel expense");
    }
  };

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPosted = filteredExpenses
    .filter((e) => e.status === "Posted")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPending = filteredExpenses
    .filter((e) => e.isApproved === "For Approval")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalApproved = filteredExpenses
    .filter((e) => e.isApproved === "Approved")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-2 py-4 space-y-4 ">
      {/* Modal for Form */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        head="Record Expenses"
      >
        <ExpenseForm onClose={() => setShowForm(false)} />
      </Modal>
      <Modal
        isOpen={editFrom}
        onClose={() => setEditForm(false)}
        head="Edit Expenses"
      >
        <ExpenseForm onClose={() => setEditForm(false)} editId={editId} />
      </Modal>

      {/* Modal for Photo View */}
      {selectedPhoto && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPhoto(null)}
          head="Expense Attachments"
        >
          <div className="space-y-3">
            {selectedPhoto.map((file, idx) => (
              <div key={idx} className="border rounded p-2 bg-gray-50">
                {file.fileType === "image" ? (
                  <img
                    src={file.url}
                    alt="Attachment"
                    className="w-full max-h-[70vh] object-contain rounded"
                  />
                ) : (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline"
                  >
                    Open PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {/* Month Filter */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("en", { month: "long" })}
            </option>
          ))}
        </select>

        {/* Year Filter */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
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

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
          No expenses found for the selected month.
        </div>
      ) : (
        filteredExpenses.map((expense) => (
          <div
            key={expense._id}
            className="bg-white rounded-lg border border-gray-200 px-5 py-4 space-y-3"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  {expense.narration || "Expense"}
                </h3>
                <p className="text-sm text-gray-500">
                  For: {expense.expenseForLedger?.name || expense.expenseFor?.name}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  ₹{expense.amount.toLocaleString("en-IN")}
                </p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(
                    expense,
                  )}`}
                >
                  {getStatusLabel(expense)}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <p>
                Date:{" "}
                {new Date(expense.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              {/* Attachments */}
              {expense.attachments?.length > 0 ? (
                <button
                  onClick={() => setSelectedPhoto(expense.attachments)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View Attachments ({expense.attachments.length})
                </button>
              ) : (
                <span className="text-gray-400">No Attachment</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              {/* Edit */}
              {expense.status === "Draft" && (
                // (expense.isApproved === "For Approval" ||
                //   expense.isApproved === "Rejected") &&
                <button
                  onClick={() => handleEditExpense(expense._id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )}

              {/* Delete */}
              {expense.status === "Draft" &&
                (expense.isApproved === "For Approval" ||
                  expense.isApproved === "Rejected") && (
                  <button
                    onClick={() => handleDeleteExpense(expense._id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                )}

              {/* Cancel */}
              {expense.status === "Posted" && (
                <button
                  onClick={() => handleCancelExpense(expense._id)}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Floating Button (Mobile) */}
      <div className="fixed bottom-[70px] right-6 sm:hidden z-50">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full shadow-lg text-2xl"
        >
          +
        </button>
      </div>

      {/* Add Expense Button (Desktop) */}
      <div className="hidden right-6 fixed bottom-[70px] sm:flex justify-end mt-6 z-50">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Add Expenses
        </button>
      </div>
    </div>
  );
};

export default Expenses;
