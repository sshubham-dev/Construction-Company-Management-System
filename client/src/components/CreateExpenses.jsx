import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseForm = ({ onClose }) => {
    const [form, setForm] = useState({
        date: '',
        amount: '',
        to: '',   // site/office/store ledger
        purpose: '',
        photo: null,
    });

    const [ledgers, setLedgers] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [ledgerRes, userRes] = await Promise.all([
                    axios.get('/api/v1/ledger'),
                    // axios.get('/api/v1/auth/me'),
                ]);
                setLedgers(ledgerRes.data);
                // setUser(userRes.data);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadInitialData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setForm((prev) => ({ ...prev, photo: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (const key in form) {
            formData.append(key, form[key]);
        }
        if (user?.ledgerId) {
            formData.append('from', user.ledgerId);
        }

        try {
            const response = await axios.post('/api/v1/expenses', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Expense recorded:', response.data);
            onClose();
        } catch (error) {
            console.error('Error saving expense:', error);
        }
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
                    // required
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">To (Site/Office/Store Ledger)</label>
                <select
                    name="to"
                    value={form.to}
                    onChange={handleChange}
                    className="w-full border px-3 py-2"
                    // required
                >
                    <option value="">Select To</option>
                    {ledgers.map((l) => (
                        <option key={l._id} value={l._id}>{l.name}</option>
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
                    placeholder="Amount"
                    className="w-full border px-3 py-2"
                    // required
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">Narration / Description</label>
                <textarea
                    name="purpose"
                    value={form.purpose}
                    onChange={handleChange}
                    placeholder="Purpose of expense"
                    className="w-full border px-3 py-2"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">Bill Photo</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border px-3 py-2"
                    required
                />
            </div>

            <div className="flex justify-end gap-4">
                <button type="button" onClick={onClose} className="bg-gray-400 px-4 py-2 text-white rounded">Cancel</button>
                <button type="submit" className="bg-green-600 px-4 py-2 text-white rounded">Save Expense</button>
            </div>
        </form>
    );
};

export default ExpenseForm;
