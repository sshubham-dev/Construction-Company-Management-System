import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../components/Modal";
import ExpenseForm from "../../components/CreateExpenses";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editFrom, setEditForm] = useState(false);
  const [editId, setEditId] = useState(null);
  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchExpenses();
  }, []);
      const fetchExpenses = async () => {
      try {
        const response = await axios.get("/api/v1/expenses");
        setExpenses(response.data);
        console.log("Fetched Expenses:", response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

  const filteredExpenses = expenses.filter((expense) => {
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
          head="Expense Bill Photo"
        >
          <img
            src={selectedPhoto}
            alt="Expense Bill"
            className="w-full max-h-[75vh] object-contain rounded"
          />
        </Modal>
      )}

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

      {/* Expense List */}
      {filteredExpenses.map((expense, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Left */}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {expense.purpose}
              </h3>

              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                ₹{expense.amount.toLocaleString()}
              </span>
            </div>

            {/* Status Badge */}
            <span
              className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold
        ${
          expense.status === "approved"
            ? "bg-blue-100 text-blue-700"
            : expense.status === "paid"
            ? "bg-green-100 text-green-700"
            : expense.status === "rejected"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
            >
              {expense?.status.toUpperCase() || "For Approval"}
            </span>

            {/* Extra Info */}
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-500">
              <p>
                <span className="font-medium text-gray-700">To:</span>{" "}
                {expense.to?.name || "-"}
              </p>
              <p>
                <span className="font-medium text-gray-700">Date:</span>{" "}
                {new Date(expense.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Right section */}
          <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center gap-3">
            {/* Photo */}
            {expense.photo ? (
              <button
                onClick={() => setSelectedPhoto(expense.photo)}
                className="text-indigo-600 underline text-sm hover:text-indigo-800"
              >
                View Photo
              </button>
            ) : (
              <span className="text-gray-400 text-sm">No Photo</span>
            )}

            {/* Edit */}
            <button
              onClick={() => handleEditExpense(expense._id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>

            {/* Delete */}
            <button
              onClick={() => handleDeleteExpense(expense._id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

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
