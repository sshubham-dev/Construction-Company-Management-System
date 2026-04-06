import React, { useState } from "react";

const SalesForm = () => {
  const [voucherNumber, setVoucherNumber] = useState("");
  const [date, setDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [items, setItems] = useState([{ description: "", quantity: 1, rate: 0, amount: 0, tax: 0 }]);

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0, tax: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = items.reduce((sum, item) => sum + item.tax, 0);
    const grandTotal = totalAmount + taxAmount;

    const sale = { voucherNumber, date, customerName, items, totalAmount, taxAmount, grandTotal, paymentMode };

    // Make API request to save sale (you'll replace this with your API endpoint)
    await fetch('/api/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create New Sales Voucher</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Voucher Number</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            value={voucherNumber}
            onChange={(e) => setVoucherNumber(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Date</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Customer Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Payment Mode</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            required
          >
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
            <option value="Credit">Credit</option>
          </select>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Items</h3>
          {items.map((item, index) => (
            <div key={index} className="mb-2 p-2 border rounded">
              <input
                type="text"
                className="w-full p-2 mb-2 border border-gray-300 rounded"
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleItemChange(index, "description", e.target.value)}
              />
              <input
                type="number"
                className="w-1/4 p-2 mb-2 border border-gray-300 rounded"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
              />
              <input
                type="number"
                className="w-1/4 p-2 mb-2 border border-gray-300 rounded"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => handleItemChange(index, "rate", e.target.value)}
              />
              <input
                type="number"
                className="w-1/4 p-2 mb-2 border border-gray-300 rounded"
                placeholder="Tax"
                value={item.tax}
                onChange={(e) => handleItemChange(index, "tax", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add Item
          </button>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-500 text-white rounded mt-4"
        >
          Save Voucher
        </button>
      </form>
    </div>
  );
};

export default SalesForm;
