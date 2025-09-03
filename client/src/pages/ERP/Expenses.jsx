import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal';
import ExpenseForm from '../../components/CreateExpenses';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get('/api/v1/expenses');
        setExpenses(response.data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };
    fetchExpenses();

    // Sample data
    setExpenses([
      {
        _id: '1',
        date: '2025-07-18',
        amount: 10000,
        from: { name: 'Sonu (Site Incharge)' },
        to: { name: 'Devi Mandap Site' },
        type: 'Cement Purchase',
        purpose: '10 bags of cement purchased',
        photo: 'https://via.placeholder.com/150',
      },
      {
        _id: '2',
        date: '2025-07-20',
        amount: 2000,
        from: { name: 'Sonu (Site Incharge)' },
        to: { name: 'Devi Mandap Site' },
        type: 'Labour Payment',
        purpose: 'Payment for supply labour',
        photo: 'https://via.placeholder.com/150',
      },
      {
        _id: '3',
        date: '2025-07-18',
        amount: 1200,
        from: { name: 'Sonu (Site Incharge)' },
        to: { name: 'Head Office' },
        type: 'Electrical',
        purpose: 'Office light purchase',
        photo: 'https://via.placeholder.com/150',
      },
    ]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Expenses</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md"
        >
          + Add Expense
        </button>
      </div>

      {/* Modal for Form */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} head="Record Expenses">
        <ExpenseForm onClose={() => setShowForm(false)} />
      </Modal>

      {/* Modal for Photo View */}
      {selectedPhoto && (
        <Modal isOpen={true} onClose={() => setSelectedPhoto(null)} head="Expense Bill Photo">
          <img src={selectedPhoto} alt="Expense Bill" className="w-full max-h-[75vh] object-contain rounded" />
        </Modal>
      )}

      {/* Expense Table */}
      {expenses.length === 0 ? (
        <p className="text-center text-gray-600">No expenses recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse shadow rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-800 text-sm">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">From</th>
                <th className="px-4 py-2 text-left">To</th>
                <th className="px-4 py-2 text-left">Purpose</th>
                <th className="px-4 py-2 text-left">Photo</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense._id}
                  className="border-b border-gray-200 hover:bg-gray-50 text-sm"
                >
                  <td className="px-4 py-2">
                    {new Date(expense.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                      ₹{expense.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-2">{expense.from?.name || '-'}</td>
                  <td className="px-4 py-2">{expense.to?.name || '-'}</td>
                  <td className="px-4 py-2">{expense.purpose}</td>
                  <td className="px-4 py-2">
                    {expense.photo ? (
                      <button
                        onClick={() => setSelectedPhoto(expense.photo)}
                        className="text-indigo-600 underline text-xs hover:text-indigo-800"
                      >
                        View Photo
                      </button>
                    ) : (
                      <span className="text-gray-500 text-xs">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Floating Button */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg text-2xl"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Expenses;
