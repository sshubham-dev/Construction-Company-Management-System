import React, { useState, useEffect } from "react";
import axios from "axios";

const ExpenseForm = ({ onClose, editId }) => {
  const [form, setForm] = useState({
    date: "",
    amount: 0,
    to: "",
    purpose: "",
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ledgers, setLedgers] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const ledgerRes = await axios.get("/api/v1/ledger");
        setLedgers(ledgerRes.data);
      } catch (error) {
        console.error("Error loading ledgers:", error);
      }
    };
    loadInitialData();
  }, []);

  // Load expense data if editing
  useEffect(() => {
    if (!editId) return;
    // console.log(editId)

    const fetchExpense = async () => {
      try {
        const { data } = await axios.get(`/api/v1/expenses/${editId}`);
        setForm({
          date: data.date?.slice(0, 10) || "",
          amount: data.amount || 0,
          to: data.to?._id || "",
          purpose: data.purpose || "",
          photo: null, // reset until changed
        });
setPhotoPreview(data.photo || null);
      } catch (err) {
        console.error("Error loading expense:", err);
      }
    };

    fetchExpense();
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, photo: e.target.files[0]}));
    setPhotoPreview(URL.createObjectURL(e.target.files[0]));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData();

  // Always append normal fields
  formData.append("date", form.date);
  formData.append("amount", form.amount);
  formData.append("to", form.to);
  formData.append("purpose", form.purpose);

  // Append photo only if new file is selected
  if (form.photo instanceof File) {
    formData.append("photo", form.photo);
  }

  try {
    let response;

    if (editId) {
      response = await axios.put(`/api/v1/expenses/${editId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      response = await axios.post("/api/v1/expenses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    onClose();
  } catch (err) {
    console.error("Error saving expense:", err);
  }

  setLoading(false);
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <div>
        <label className="block mb-1 font-medium">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">To Ledger</label>
        <select
          name="to"
          value={form.to}
          onChange={handleChange}
          className="w-full border px-3 py-2"
          required
        >
          <option value="">Select</option>
          {ledgers.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full border px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
          className="w-full border px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Bill Photo</label>
        {photoPreview && (
          <img
            src={photoPreview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border px-3 py-2"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-400 px-4 py-2 text-white rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="bg-green-600 px-4 py-2 text-white rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : editId ? "Update Expense" : "Save Expense"}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
