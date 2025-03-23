import React, { useEffect, useState } from "react";
import axios from 'axios';
import Select from "react-select";

const CreateReceipt_Payment = ({ onClose }) => {
    const [form, setForm] = useState({
        type: "receipt",
        receiptNo: "",
        paymentNo: "",
        date: "",
        from: "",
        to: "",
        amount: 0,
        description: "",
        paymentFor: '',
        invoice: '',
        paymentDetails: "",
    });
    const [loading, setLoading] = useState(false);
    const [receipts, setReceipts] = useState([]);
    const [payments, setPayments] = useState([]);
    const [ledgers, setLedger] = useState([]);

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                const response = await axios.get('/api/v1/ledger')
                setLedger(response.data)
            } catch (error) {
                console.log(error)
            }
        };
        fetchLedger();
    }, [])

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value ? value : "" });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log(form)
        try {
            // if (form.type === "receipt") {
            //     setReceipts([...receipts, form]);
            //     const response = await axios.post('/api/v1/receipt', form)
            //     console.log(response)
            // } else {
            //     const response = await axios.post('/api/v1/payment', form)
            //     setPayments([...payments, form]);
            //     console.log(response)
            // }
            // setForm({
            //     type: "receipt",
            //     receiptNo: "",
            //     paymentNo: "",
            //     date: "",
            //     from: "",
            //     to: "",
            //     amount: "",
            //     description: "",
            // });
            // onClose()
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
                    onChange={(e) => handleChange("type", e.target.value)}
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
                        onChange={(e) => handleChange("receiptNo", e.target.value)}
                        className="border p-2 w-full"

                    />
                ) : (
                    <input
                        type="text"
                        name="paymentNo"
                        placeholder="Payment No"
                        value={form.paymentNo}
                        onChange={(e) => handleChange("paymentNo", e.target.value)}
                        className="border p-2 w-full"

                    />
                )}
                <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className="border p-2 w-full"
                />
                <Select
                    name="from"
                    options={ledgers.map(ledger => ({ value: ledger._id, label: ledger.name }))}
                    // value={ledgers.find(ledger => ledger._id === form.from) || null}
                    onChange={(e) => handleChange("from", e.value)}
                    placeholder="From"
                />

                <Select
                    name="to"
                    options={ledgers.map(ledger => ({ value: ledger._id, label: ledger.name }))}
                    // value={ledgers.find(ledger => ledger._id === form.to) || null}
                    onChange={(e) => handleChange("to", e.value)}
                    placeholder="To"
                />

                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    min='0'
                    className="border p-2 w-full"
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
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