import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";

const CollectionEntry = ({ onClose }) => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    clientLedgerId: "",
    receivedInto: "",
    amount: "",
    purpose: "",
    medium: "",
    referenceNo: "",
    narration: "",
    proofImage: null,
  });

  const PARTY_UNDER = ["Sundry Debtors", "Sundry Creditors"];
  const CASH_BANK_UNDER = ["Cash-in-Hand", "Bank Accounts", "Cash", "Bank"];

  useEffect(() => {
    axios.get("/api/v1/ledger").then((res) => setLedgers(res.data));
  }, []);

  const partyLedgers = useMemo(
    () => ledgers.filter((l) => PARTY_UNDER.includes(l.under)),
    [ledgers],
  );

  const cashBankLedgers = useMemo(
    () => ledgers.filter((l) => CASH_BANK_UNDER.includes(l.under)),
    [ledgers],
  );

  const mapOptions = (arr) =>
    arr.map((l) => ({
      value: l._id,
      label: `${l.name} (${l.referenceType || l.under})`,
    }));

  const updateForm = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.keys(form).forEach((k) => {
      fd.append(k, form[k]);
    });

    try {
      await axios.post("/api/v1/collection", fd);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Record Client Payment</h2>

      {/* DATE */}
      <input
        type="date"
        value={form.date}
        onChange={(e) => updateForm("date", e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* CLIENT */}
      <Select
        options={mapOptions(partyLedgers)}
        placeholder="Select Client"
        onChange={(v) => updateForm("clientLedgerId", v?.value || "")}
      />

      {/* RECEIVED INTO */}
      <Select
        options={mapOptions(cashBankLedgers)}
        placeholder="Received Into (Company Cash/Bank)"
        onChange={(v) => updateForm("receivedInto", v?.value || "")}
      />

      {/* AMOUNT */}
      <input
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => updateForm("amount", e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* PURPOSE */}
      <input
        type="text"
        placeholder="Purpose"
        value={form.purpose}
        onChange={(e) => updateForm("purpose", e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* MEDIUM */}
      <select
        value={form.medium}
        onChange={(e) => updateForm("medium", e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Payment Medium</option>
        <option value="cash">Cash</option>
        <option value="bank">Bank Transfer</option>
        <option value="upi">UPI</option>
        <option value="cheque">Cheque</option>
      </select>

      {/* REFERENCE */}
      <input
        placeholder="Reference No / UTR / Cheque No"
        value={form.referenceNo}
        onChange={(e) => updateForm("referenceNo", e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* PROOF IMAGE */}
      <input
        type="file"
        onChange={(e) => updateForm("proofImage", e.target.files[0])}
        className="border p-2 rounded w-full"
      />

      {/* NARRATION */}
      <textarea
        placeholder="Notes"
        value={form.narration}
        onChange={(e) => updateForm("narration", e.target.value)}
        className="border p-2 rounded w-full"
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>

        <button
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {loading ? "Saving..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default CollectionEntry;
