import React, { useState } from 'react';

const CreateJournal = ({ isOpen, onClose }) => {
    const [journalType, setJournalType] = useState(''); // State for selected journal type
    const [voucherNumber, setVoucherNumber] = useState('');
    const [date, setDate] = useState('');
    const [narration, setNarration] = useState('');
    const [journalEntries, setJournalEntries] = useState([{ account: '', debit: 0, credit: 0 }]);
    const [stockItems, setStockItems] = useState([{ item: '', quantity: 0, rate: 0, amount: 0, adjustmentType: 'Increase', reason: '' }]);
    const [submittedData, setSubmittedData] = useState(null);


    const handleJournalTypeChange = (e) => {
        setJournalType(e.target.value);
    };

    const addJournalEntry = (e) => {
        e.preventDefault()
        setJournalEntries([...journalEntries, { account: '', debit: 0, credit: 0 }]);
    };

    const addStockItem = (e) => {
        e.preventDefault()
        setStockItems([...stockItems, { item: '', quantity: 0, rate: 0, amount: 0, adjustmentType: 'Increase', reason: '' }]);
    };

    const updateJournalEntry = (index, field, value) => {
        const newEntries = [...journalEntries];
        newEntries[index][field] = value;
        setJournalEntries(newEntries);
    };

    const updateStockItem = (index, field, value) => {
        const newItems = [...stockItems];
        newItems[index][field] = value;

        // Calculate amount when quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
            const quantity = Number(newItems[index].quantity);
            const rate = Number(newItems[index].rate);
            newItems[index].amount = quantity * rate;
        }

        setStockItems(newItems);
    };

    const totalJournalDebit = journalEntries.reduce((sum, e) => sum + Number(e.debit), 0);
    const totalJournalCredit = journalEntries.reduce((sum, e) => sum + Number(e.credit), 0);

    const submitForm = (e) => {
        e.preventDefault();
        const data = {
            voucherNumber,
            date,
            narration,
            journalType,
            journalEntries,
            stockItems,
            totalDebit: totalJournalDebit,
            totalCredit: totalJournalCredit,
        };
        setSubmittedData(data);
        console.log('Submitted Data:', data);
    };

    if (!isOpen) return null
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
            <div className="bg-white px-5 py-8 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-[75vh] md:h-[80vh] md:mt-12 overflow-auto">
                <h2 className="text-xl font-bold mb-4">Journal Entry</h2>
                <form className="space-y-4" onSubmit={submitForm}>
                    {/* <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={journalType} onChange={handleJournalTypeChange}>
                        <option value="">Select Journal Type</option>
                        <option value="journal">Journal</option>
                        <option value="stock">Stock Journal</option>
                    </select> */}

                    <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Voucher Number" value={voucherNumber} onChange={(e) => setVoucherNumber(e.target.value)} />

                    <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

                    <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Narration" value={narration} onChange={(e) => setNarration(e.target.value)} />

                    {/* {journalType === 'journal' && (
                        <> */}
                    <h3 className="text-lg font-bold">Entries</h3>
                    {journalEntries.map((entry, index) => (
                        <div key={index} className="flex flex-col sm:flex-row md:flex-row lg:flex-row gap-2">
                            <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={entry.account} onChange={(e) => updateJournalEntry(index, 'account', e.target.value)}>
                                <option value="">Select Account</option>
                            </select>
                            
                            <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Debit" value={entry.debit} onChange={(e) => updateJournalEntry(index, 'debit', e.target.value)} />

                            <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Credit" value={entry.credit} onChange={(e) => updateJournalEntry(index, 'credit', e.target.value)} />
                        </div>
                    ))}
                    <button onClick={addJournalEntry} className="mt-4 px-4 py-2 bg-gray-300 rounded">Add Journal Entry</button>
                    <div className="mt-4 flex justify-between flex-col sm:flex-row md:flex-row lg:flex-row">
                        <strong>Total Debit: </strong>{totalJournalDebit}
                        <strong>Total Credit: </strong>{totalJournalCredit}
                    </div>
                    {/* </>
                    )} */}
                    {/* 
                    {journalType === 'stock' && (
                        <>
                            <h3 className="text-lg font-bold">Stock Items</h3>
                            {stockItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-3 gap-3">
                                    <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Item ID" value={item.item} onChange={(e) => updateStockItem(index, 'item', e.target.value)} />
                                    <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Quantity" value={item.quantity} onChange={(e) => updateStockItem(index, 'quantity', e.target.value)} />
                                    <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Rate" value={item.rate} onChange={(e) => updateStockItem(index, 'rate', e.target.value)} />
                                    <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Amount" value={item.amount} readOnly />
                                    <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={item.adjustmentType} onChange={(e) => updateStockItem(index, 'adjustmentType', e.target.value)}>
                                        <option value="Increase">Increase</option>
                                        <option value="Decrease">Decrease</option>
                                    </select>
                                    <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Reason" value={item.reason} onChange={(e) => updateStockItem(index, 'reason', e.target.value)} />
                                </div>
                            ))}
                            <button onClick={addStockItem} className="mt-3 px-4 py-2 bg-gray-300 rounded">Add Stock Item</button>
                        </>
                    )} */}

                    <div className="flex justify-end gap-4 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white p-2 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={submitForm}
                            className=" bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Submit
                        </button>
                    </div>
                    {/* <button onClick={submitForm} className="mt-3 px-4 py-2 bg-blue-500 text-white rounded">Submit</button> */}
                </form>
            </div>
        </div>
    );

}

export default CreateJournal