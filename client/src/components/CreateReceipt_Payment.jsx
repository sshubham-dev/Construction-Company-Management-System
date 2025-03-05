import React, { useState } from "react";
import axios from 'axios'

const CreateReceipt_Payment = ({ onClose }) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (form.type === "receipt") {
                setReceipts([...receipts, form]);
                const response = await axios.post('/api/v1/receipt', form)
                console.log(response)
            } else {
                const response = await axios.post('/api/v1/payment', form)
                setPayments([...payments, form]);
                console.log(response)
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
            onClose()
        } catch (error) {
            console.log(error)
        }

    };

    return (
        <div >
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
                            
                        />
                    ) : (
                        <input
                            type="text"
                            name="paymentNo"
                            placeholder="Payment No"
                            value={form.paymentNo}
                            onChange={handleChange}
                            className="border p-2 w-full"
                            
                        />
                    )}
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        
                    />
                    <select
                        name="from"
                        value={form.from}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        >
                        <option value="">From</option>
                    </select>
                    <select
                        name="to"
                        value={form.to}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        >
                        <option value="">To</option>
                    </select>
                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        value={form.amount}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        
                    />

                    {/* <div className="grid grid-cols-1 gap-6 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Voucher No</label>
                    <input
                        type="text"
                        value={voucherNo}
                        onChange={(e) => setVoucherNo(e.target.value)}
                        
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">From Account</label>
                    <select
                        name="fromAccount"
                        value={fromAccount}
                        onChange={(e) => setFromAccount(e.target.value)}
                        
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
        </div >
    )
}

export default CreateReceipt_Payment