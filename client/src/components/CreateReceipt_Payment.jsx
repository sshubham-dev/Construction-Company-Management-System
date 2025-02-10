import React, { useState } from "react";

const CreateReceipt_Payment = ({ onClose, isOpen }) => {
    const [form, setForm] = useState({
        type: "receipt",
        receiptNo: "",
        paymentNo: "",
        date: "",
        from: "",
        to: "",
        amount: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [receipts, setReceipts] = useState([]);
    const [payments, setPayments] = useState([]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (form.type === "receipt") {
            setReceipts([...receipts, form]);
        } else {
            setPayments([...payments, form]);
        }
        setForm({
            type: "receipt",
            receiptNo: "",
            paymentNo: "",
            date: "",
            from: "",
            to: "",
            amount: "",
            description: "",
        });
    };

    if (!isOpen) return null
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
            <div className="bg-white py-7 px-5 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-[75vh] md:h-[80vh] md:mt-12 overflow-auto">
                <h2 className="text-2xl font-semibold mb-4">Create {form.type === 'payment' ? 'Payment' : 'Recipt'} Voucher</h2>
                <form onSubmit={handleSubmit} className="space-y-3 mb-5">
                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="border p-2 w-full"
                    >
                        <option value="receipt">Receipt</option>
                        <option value="payment">Payment</option>
                    </select>
                    {form.type === "receipt" ? (
                        <input
                            type="text"
                            name="receiptNo"
                            placeholder="Receipt No"
                            value={form.receiptNo}
                            onChange={handleChange}
                            className="border p-2 w-full"
                            required
                        />
                    ) : (
                        <input
                            type="text"
                            name="paymentNo"
                            placeholder="Payment No"
                            value={form.paymentNo}
                            onChange={handleChange}
                            className="border p-2 w-full"
                            required
                        />
                    )}
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        required
                    />
                    <select
                        name="from"
                        value={form.from}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        required>
                        <option value="">From</option>
                    </select>
                    <select
                        name="to"
                        value={form.to}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        required>
                        <option value="">To</option>
                    </select>
                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        value={form.amount}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        required
                    />

                    {/* <div className="grid grid-cols-1 gap-6 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Voucher No</label>
                    <input
                        type="text"
                        value={voucherNo}
                        onChange={(e) => setVoucherNo(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">From Account</label>
                    <select
                        name="fromAccount"
                        value={fromAccount}
                        onChange={(e) => setFromAccount(e.target.value)}
                        required
                        className="mt-1 block w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Select Account</option>
                        <option value="">Kotak Account</option>
                        <option value="">Cash</option>
                        <option value="">Utkarsh</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">To Account</label>
                    <select
                        name="toAccount"
                        value={toAccount}
                        onChange={(e) => setToAccount(e.target.value)}
                        required
                        className="mt-1 block w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Select Account</option>
                        <option value="">Kotak Account</option>
                        <option value="">Cash</option>
                        <option value="">Utkarsh</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div> */}

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
        </div >
    )
}

export default CreateReceipt_Payment