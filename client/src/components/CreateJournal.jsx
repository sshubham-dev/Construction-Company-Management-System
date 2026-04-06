import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

const CreateJournal = ({ onClose, refresh, editData }) => {
  const isEdit = Boolean(editData?._id);
  const [costCenters, setCostCenters] = useState([]);
  const [costCenterId, setCostCenterId] = useState("");
  const [ledgers, setLedgers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [narration, setNarration] = useState("");
  const [loading, setLoading] = useState(false);

  /* ======================
     FETCH LEDGERS
  ====================== */
  useEffect(() => {
    axios.get("/api/v1/ledger").then((res) => {
      setLedgers(res.data || []);
    });
    axios.get("/api/v1/cost-center").then((res) => {
      setCostCenters(res.data || []);
    });
  }, []);

  /* ======================
     EDIT LOAD
  ====================== */
  useEffect(() => {
    if (!isEdit) return;

    setDate(editData.date?.split("T")[0]);
    setNarration(editData.narration || "");
    setCostCenterId(editData.costCenterId?._id || "");
    setEntries(
      editData.entries.map((e) => ({
        ledgerId: e.ledgerId?._id || e.ledgerId,
        type: e.type,
        amount: e.amount,
      })),
    );
  }, [editData]);

  /* ======================
     ENTRY HANDLERS
  ====================== */
  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { ledgerId: "", type: "DEBIT", amount: "" },
    ]);
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  /* ======================
     TOTALS
  ====================== */
  const totals = entries.reduce(
    (acc, e) => {
      if (e.type === "DEBIT") acc.debit += Number(e.amount || 0);
      else acc.credit += Number(e.amount || 0);
      return acc;
    },
    { debit: 0, credit: 0 },
  );

  const isBalanced = totals.debit === totals.credit && totals.debit > 0;

  /* ======================
     SUBMIT
  ====================== */
  const handleSubmit = async () => {
    if (!isBalanced) {
      return alert("Debit and Credit must match");
    }

    setLoading(true);

    try {
      const payload = {
        date,
        narration,
        costCenterId,
        entries: entries.map((e) => ({
          ledgerId: e.ledgerId,
          type: e.type,
          amount: Number(e.amount),
        })),
      };

      if (isEdit) {
        await axios.put(`/api/v1/journal/${editData._id}`, payload);
      } else {
        await axios.post("/api/v1/journal", payload);
      }

      refresh && refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Error saving journal");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     OPTIONS
  ====================== */
  const ledgerOptions = ledgers.map((l) => ({
    value: l._id,
    label: l.name,
  }));

  const costCenterOptions = costCenters.map((c) => ({
    value: c._id,
    label: c.name,
  }));
  /* ======================
     UI
  ====================== */
  return (
    <div className="space-y-4">
      {/* DATE */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border rounded-lg p-2 text-sm"
      />

      {/* COST CENTER */}
      <Select
        options={costCenterOptions}
        value={costCenterOptions.find((o) => o.value === costCenterId)}
        onChange={(e) => setCostCenterId(e?.value || "")}
        placeholder="Select Cost Center (Optional)"
        isClearable
      />

      {/* ENTRIES */}
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={index}
            className="border rounded-lg p-3 bg-gray-50 space-y-2"
          >
            {/* ROW 1 */}
            <Select
              options={ledgerOptions}
              value={ledgerOptions.find((o) => o.value === entry.ledgerId)}
              onChange={(e) => updateEntry(index, "ledgerId", e?.value)}
              placeholder="Select Ledger"
            />

            {/* ROW 2 */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={entry.type}
                onChange={(e) => updateEntry(index, "type", e.target.value)}
                className="border p-2 rounded-lg text-sm"
              >
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>

              <input
                type="number"
                value={entry.amount}
                onChange={(e) => updateEntry(index, "amount", e.target.value)}
                placeholder="Amount"
                className="border p-2 rounded-lg text-sm"
              />
            </div>

            {/* REMOVE */}
            <div className="flex justify-end">
              <button
                onClick={() => removeEntry(index)}
                className="text-red-500 text-xs"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD ENTRY */}
      <button
        onClick={addEntry}
        className="w-full py-2 bg-green-600 text-white rounded-lg text-sm"
      >
        + Add Entry
      </button>

      {/* TOTAL */}
      <div className="flex justify-between text-sm font-medium">
        <span>Debit: {totals.debit}</span>
        <span>Credit: {totals.credit}</span>
      </div>

      {!isBalanced && <div className="text-red-500 text-xs">Not balanced</div>}

      {/* NARRATION */}
      <textarea
        value={narration}
        onChange={(e) => setNarration(e.target.value)}
        placeholder="Narration"
        className="w-full border rounded-lg p-2 text-sm"
      />

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onClose}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          {loading ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
};

export default CreateJournal;
