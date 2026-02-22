import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";

const CreateReceipt_Payment = ({ type = "Payment", onClose }) => {
  const isPayment = type === "Payment";

  /* ---------------- STATE ---------------- */
  const [ledgers, setLedgers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    fromLedgerId: "",
    toLedgerId: "",
    amount: "",
    referenceNo: "",
    description: "",
    settlement: [],
  });

  /* ---------------- GROUP LOGIC USING "under" ---------------- */
  const CASH_BANK_UNDER = ["Cash-in-Hand", "Bank Accounts", "Cash", "Bank"];
  const PARTY_UNDER = ["Sundry Debtors", "Sundry Creditors"];

  /* ---------------- LOAD LEDGERS ---------------- */
  useEffect(() => {
    const loadLedgers = async () => {
      const response = await axios.get("/api/v1/ledger");
      setLedgers(response.data);
      // console.log("response", response.data.filter((l) => CASH_BANK_UNDER.map(u => u.toLowerCase()).includes(l.under.toLowerCase())));
    };
    loadLedgers();
  }, []);

  const cashBankLedgers = useMemo(
    () =>
      ledgers.filter((l) =>
        CASH_BANK_UNDER.map((u) => u.toLowerCase()).includes(
          l.under.toLowerCase(),
        ),
      ),
    [ledgers],
  );

  const partyLedgers = useMemo(
    () => ledgers.filter((l) => PARTY_UNDER.map((u) => u.toLowerCase()).includes(l.under.toLowerCase())),
    [ledgers],
  );

  const nonCashBankLedgers = useMemo(
    () => ledgers.filter((l) => !CASH_BANK_UNDER.map(u => u.toLowerCase()).includes(l.under.toLowerCase())),
    [ledgers],
  );

  /* ---------------- SELECT OPTIONS ---------------- */

  const mapOptions = (arr) =>
    arr.map((l) => ({ value: l._id, label: `${l.name} (${l.under})` }));

  const fromOptions = isPayment
    ? mapOptions(cashBankLedgers)
    : mapOptions(partyLedgers);

  const toOptions = isPayment
    ? mapOptions(nonCashBankLedgers)
    : mapOptions(cashBankLedgers);

  const partyLedgerId = isPayment ? form.toLedgerId : form.fromLedgerId;

  /* ---------------- LOAD DOCUMENTS BY PURPOSE ---------------- */

  useEffect(() => {
    if (!purpose || !partyLedgerId) return;

    axios
      .get("/api/v1/documents", {
        params: {
          purpose,
          ledgerId: partyLedgerId,
        },
      })
      .then((res) => setDocuments(res.data));
  }, [purpose, partyLedgerId]);

  /* ---------------- HELPERS ---------------- */

  const updateForm = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSettlementAmount = (docId, value) => {
    const amount = Number(value) || 0;

    setForm((prev) => {
      const existing = prev.settlement.filter((s) => s.docId !== docId);

      if (amount > 0) {
        existing.push({ docId, amount });
      }

      return { ...prev, settlement: existing };
    });
  };

  const totalSettled = useMemo(
    () => form.settlement.reduce((s, i) => s + (i.amount || 0), 0),
    [form.settlement],
  );

  const remaining = Number(form.amount || 0) - totalSettled;

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalSettled > Number(form.amount))
      return alert("Settlement exceeds voucher amount");

    setLoading(true);

    try {
      await axios.post(isPayment ? "/api/v1/payment" : "/api/v1/receipt", {
        ...form,
        purpose,
      });

      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving voucher");
    }

    setLoading(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">
        {isPayment ? "Create Payment Voucher" : "Create Receipt Voucher"}
      </h2>

      {/* DATE */}
      <input
        type="date"
        value={form.date}
        onChange={(e) => updateForm("date", e.target.value)}
        className="border p-2 rounded w-full"
        required
      />

      {/* FROM LEDGER */}
      <Select
        options={fromOptions}
        placeholder={isPayment ? "Pay From (Cash/Bank)" : "Receive From"}
        onChange={(v) => updateForm("fromLedgerId", v?.value || "")}
        isClearable
      />

      {/* TO LEDGER */}
      <Select
        options={toOptions}
        placeholder={isPayment ? "Pay To" : "Receive Into (Cash/Bank)"}
        onChange={(v) => updateForm("toLedgerId", v?.value || "")}
        isClearable
      />

      {/* AMOUNT */}
      <input
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => updateForm("amount", e.target.value)}
        className="border p-2 rounded w-full"
        required
      />

      {/* PURPOSE */}
      <select
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Select Purpose</option>

        {isPayment && (
          <>
            <option value="purchase">Purchase Invoice</option>
            <option value="expense">Expense Bill</option>
            <option value="workorder">Work Order</option>
          </>
        )}

        {!isPayment && (
          <>
            <option value="sales">Sales Invoice</option>
            <option value="advance">Advance Receipt</option>
            <option value="return">Sales Return</option>
          </>
        )}
      </select>

      {/* DOCUMENT LIST */}
      {documents.length > 0 && (
        <div className="border rounded p-3 space-y-2 text-sm">
          {documents.map((doc) => (
            <div key={doc._id} className="grid grid-cols-4 gap-2 items-center">
              <div>
                {doc.docType} #{doc.docNo}
              </div>
              <div>Outstanding: {doc.balance}</div>

              <input
                type="number"
                max={doc.balance}
                onChange={(e) =>
                  handleSettlementAmount(doc._id, e.target.value)
                }
                className="border p-1 rounded"
              />
            </div>
          ))}

          <div className="text-right font-medium">
            Settled: {totalSettled} | Remaining: {remaining}
          </div>
        </div>
      )}

      {/* REF NO */}
      <input
        placeholder="Reference No"
        value={form.referenceNo}
        onChange={(e) => updateForm("referenceNo", e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* DESCRIPTION */}
      <textarea
        placeholder="Narration"
        value={form.description}
        onChange={(e) => updateForm("description", e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* ACTIONS */}
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
          {loading ? "Saving..." : "Save Voucher"}
        </button>
      </div>
    </form>
  );
};

export default CreateReceipt_Payment;
