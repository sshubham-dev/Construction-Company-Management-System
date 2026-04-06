
import { useState } from "react";
import axios from "axios";

const CreatePayChallan = () => {
  const [items, setItems] = useState([
    { partyName: "", purpose: "", amount: "", mode: "CASH" }
  ]);

  const addRow = () => {
    setItems([...items, { partyName: "", purpose: "", amount: "", mode: "CASH" }]);
  };

  const handleChange = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const submit = async () => {
    const payload = {
      challanType: "MANUAL",
      items: items.map(i => ({
        isManual: true,
        partyName: i.partyName,
        purpose: i.purpose,
        approvedAmount: Number(i.amount),
        paymentMode: i.mode
      }))
    };

    await axios.post("/api/v1/payment-challans", payload);
    alert("Created");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Create Challan</h2>

      {items.map((item, i) => (
        <div key={i} className="border p-3 mb-3 rounded">
          <input
            placeholder="Party Name"
            className="border p-2 w-full mb-2"
            onChange={(e) => handleChange(i, "partyName", e.target.value)}
          />

          <input
            placeholder="Purpose"
            className="border p-2 w-full mb-2"
            onChange={(e) => handleChange(i, "purpose", e.target.value)}
          />

          <input
            type="number"
            placeholder="Amount"
            className="border p-2 w-full mb-2"
            onChange={(e) => handleChange(i, "amount", e.target.value)}
          />

          <select
            className="border p-2 w-full"
            onChange={(e) => handleChange(i, "mode", e.target.value)}
          >
            <option>CASH</option>
            <option>BANK</option>
            <option>UPI</option>
          </select>
        </div>
      ))}

      <button onClick={addRow} className="mb-3 text-blue-600">
        + Add Row
      </button>

      <button
        onClick={submit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Create Challan
      </button>
    </div>
  );
};

export default CreatePayChallan