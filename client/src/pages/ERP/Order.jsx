import React, { useState } from 'react';
// import './App.css';

const Order = () => {
  const [voucherNumber, setVoucherNumber] = useState('');
  const [date, setDate] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierAccount, setSupplierAccount] = useState('');
  const [items, setItems] = useState([
    { item: '', description: '', quantity: 0, rate: 0, amount: 0, tax: 0 },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [paymentMode, setPaymentMode] = useState('');
  const [narration, setNarration] = useState('');

  const handleItemChange = (index, e) => {
    const values = [...items];
    values[index][e.target.name] = e.target.value;
    if (e.target.name === 'quantity' || e.target.name === 'rate') {
      values[index].amount = values[index].quantity * values[index].rate;
      values[index].tax = (values[index].amount * 0.05).toFixed(2); // For example, 5% tax
    }
    setItems(values);
    calculateTotal(values);
  };

  const addItem = () => {
    setItems([
      ...items,
      { item: '', description: '', quantity: 0, rate: 0, amount: 0, tax: 0 },
    ]);
  };

  const calculateTotal = (items) => {
    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const taxAmount = items.reduce((sum, item) => sum + parseFloat(item.tax || 0), 0);
    const grandTotal = totalAmount + taxAmount;

    setTotalAmount(totalAmount);
    setTaxAmount(taxAmount);
    setGrandTotal(grandTotal);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const purchaseData = {
      voucherNumber,
      date,
      supplierName,
      supplierAccount,
      items,
      totalAmount,
      taxAmount,
      grandTotal,
      paymentMode,
      narration,
    };
    console.log(purchaseData); // This is where you'd send it to your backend
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Purchase Voucher</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Voucher Number</label>
            <input
              type="text"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={voucherNumber}
              onChange={(e) => setVoucherNumber(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
          <input
            type="text"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier Account</label>
          <input
            type="text"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            value={supplierAccount}
            onChange={(e) => setSupplierAccount(e.target.value)}
            required
          />
        </div>

        {items.map((item, index) => (
          <div key={index} className="border p-4 mb-4 rounded-md">
            <h3 className="font-semibold">Item {index + 1}</h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Item</label>
                <input
                  type="text"
                  name="item"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={item.item}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Rate</label>
                <input
                  type="number"
                  name="rate"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={item.rate}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={item.amount}
                  readOnly
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Tax</label>
                <input
                  type="number"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={item.tax}
                  readOnly
                />
              </div>
            </div>
          </div>
        ))}

        <div>
          <button
            type="button"
            className="p-2 bg-blue-500 text-white rounded-md"
            onClick={addItem}
          >
            Add Item
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
          <select
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            required
          >
            <option value="">Select Payment Mode</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
            <option value="Credit">Credit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Narration</label>
          <textarea
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Total Amount</label>
            <input
              type="number"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={totalAmount}
              readOnly
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Tax Amount</label>
            <input
              type="number"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={taxAmount}
              readOnly
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Grand Total</label>
            <input
              type="number"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              value={grandTotal}
              readOnly
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 p-2 bg-green-500 text-white rounded-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Order;
