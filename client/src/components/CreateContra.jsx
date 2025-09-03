import React, { useEffect, useState } from "react";
import axios from "axios";

const CreateContra = ({ onClose }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        voucherNo: "",
        date: "",
        from: "",
        to: "",
        amount: 0,
        description: "",
    });
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response = await axios.get('/api/v1/ledger');
                const Ledgers = Array.isArray(response.data) ? response.data : [];
                const accountLedger = Ledgers.filter(ledger =>
                    ledger?.under && ledger.under.toLowerCase().includes("account")
                );
                setAccounts(accountLedger);
            } catch (error) {
                console.error("Error fetching ledgers:", error);
            }
        };

        const fetchVoucherNo = async () => {
            try {
                const response = await axios.get('/api/v1/contra/next-voucher');
                console.log(response.data);
                setForm(prev => ({ ...prev, voucherNo: response.data.voucherNo }));
            } catch (error) {
                console.error("Error fetching voucher number:", error);
            }
        };

        fetchAccount();
        fetchVoucherNo();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("/api/v1/contra", form);
            setForm({
                voucherNo: "",
                date: "",
                from: "",
                to: "",
                amount: 0,
                description: "",
            });
            onClose();
        } catch (error) {
            console.error("Error creating voucher:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Voucher No</label>
                    <input
                        name="voucherNo"
                        type="text"
                        value={form.voucherNo}
                        readOnly
                        disabled  // Prevent user changes
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">From Account</label>
                    <select
                        name="from"
                        value={form.from}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Select Account</option>
                        {accounts.map((account) => (
                            <option key={account._id} value={account._id}>{account.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">To Account</label>
                    <select
                        name="to"
                        value={form.to}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Select Account</option>
                        {accounts.map((account) => (
                            <option key={account._id} value={account._id}>{account.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        required
                        min={1}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                        type="text"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 text-white p-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {loading ? "Saving..." : "Create Voucher"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateContra;
