import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const adjustmentMethods = [
  { value: "Advance", label: "Advance" },
  { value: "New Ref", label: "New Ref" },
  { value: "Agst Ref", label: "Against Ref" },
  { value: "On Account", label: "On Account" },
];

const CreateJournal = ({ onClose }) => {
  const [ledgers, setLedgers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [voucherNo, setVoucherNo] = useState("");
  const [date, setDate] = useState("");
  const [narration, setNarration] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLedgers = async () => {
      const res = await axios.get("/api/v1/ledger");
      setLedgers(res.data);
    };
    const generateVoucherNo = async () => {
      const res = await axios.get("/api/v1/journal/next-voucher");
      setVoucherNo(res.data.voucherNo);
    };
    fetchLedgers();
    generateVoucherNo();
  }, []);

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      {
        account: null,
        type: "From", // or 'To'
        amount: 0,
        method: null,
        reference: "",
      },
    ]);
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const isBalanced = () => {
    const totalFrom = entries
      .filter((e) => e.type === "From")
      .reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const totalTo = entries
      .filter((e) => e.type === "To")
      .reduce((acc, e) => acc + Number(e.amount || 0), 0);
    return totalFrom === totalTo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBalanced()) {
      alert("Debit and credit amounts must be equal!");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/v1/journal", {
        voucherNo,
        date,
        narration,
        entries,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-5">
      <h2 className="text-xl font-semibold">Create Journal Entry</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          value={voucherNo}
          readOnly
          className="border p-2 rounded w-full"
          placeholder="Voucher No"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="space-y-5">
        {entries.map((entry, index) => (
          <div
            key={index}
            className="p-4 border rounded-md space-y-3 bg-white shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <Select
                options={ledgers.map((l) => ({
                  value: l._id,
                  label: l.name,
                }))}
                placeholder="Account"
                value={ledgers
                  .map((l) => ({ value: l._id, label: l.name }))
                  .find((opt) => opt.value === entry.account)}
                onChange={(e) => updateEntry(index, "account", e.value)}
              />
              <select
                className="border p-2 rounded"
                value={entry.type}
                onChange={(e) => updateEntry(index, "type", e.target.value)}
              >
                <option value="From">From (Debit)</option>
                <option value="To">To (Credit)</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={entry.amount}
                onChange={(e) =>
                  updateEntry(index, "amount", parseFloat(e.target.value) || 0)
                }
                className="border p-2 rounded"
              />
              <Select
                options={adjustmentMethods}
                placeholder="Adjustment"
                onChange={(e) => updateEntry(index, "method", e.value)}
              />
              <input
                type="text"
                placeholder="Reference"
                value={entry.reference}
                onChange={(e) =>
                  updateEntry(index, "reference", e.target.value)
                }
                className="border p-2 rounded"
              />
            </div>
          </div>
        ))}
        <button
          onClick={addEntry}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Entry
        </button>
      </div>

      <textarea
        className="border w-full p-2 rounded mt-4"
        placeholder="Narration"
        value={narration}
        onChange={(e) => setNarration(e.target.value)}
      />

      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Submit Journal"}
        </button>
      </div>
    </div>
  );
};

export default CreateJournal;