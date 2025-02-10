import React, { useEffect, useState } from "react";
import axios from "axios";

const CreateContra = ({ onClose, isOpen }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        voucherNo: "",
        date: "",
        from: "",
        to: "",
        amount: "",
        description: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const newVoucher = {
            voucherNo,
            date,
            description,
            from,
            to,
            amount,
        };

        console.log("Voucher created:", form);
        try {
            const response = await axios.post("/api/contra", newVoucher);
            // Reset form
            setForm({
                voucherNo: "",
                date: "",
                from: "",
                to: "",
                amount: "",
                description: "",
            })
        } catch (error) {
            console.error("Error creating voucher:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
            <div className="bg-white px-5 py-7 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-[75vh] md:h-[80vh] md:mt-12 overflow-auto">
                <h2 className="text-2xl font-semibold mb-4">Create Contra Voucher</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Voucher No</label>
                            <input
                                name="voucherNo"
                                type="text"
                                value={form.voucherNo}
                                onChange={handleChange}
                                required
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
                                <option value="kotak">Kotak Account</option>
                                <option value="cash">Cash</option>
                                <option value="utkarsh">Utkarsh</option>
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
                                <option value="kotak">Kotak Account</option>
                                <option value="cash">Cash</option>
                                <option value="utkarsh">Utkarsh</option>
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
                            className=" bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {loading ? "Saving..." : "Create Voucher"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContra