import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";

const CreateReceipt_Payment = ({ type = "Payment", onClose, refresh }) => {
  const isPayment = type === "Payment";

  /* ---------------- STATE ---------------- */
  const [ledgers, setLedgers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    costCenterId: "",
    fromLedgerId: "",
    toLedgerId: "",
    amount: "",
    referenceNo: "",
    description: "",
    invoices: [], // ✅ NEW
  });
  const [costCenters, setCostCenters] = useState([]);

  /* ---------------- GROUP LOGIC ---------------- */
  const CASH_BANK_UNDER = ["Cash-in-Hand", "Bank Accounts", "Cash", "Bank"];

  /* ---------------- LOAD LEDGERS ---------------- */
  useEffect(() => {
    const loadLedgers = async () => {
      const res = await axios.get("/api/v1/ledger", {
        params: { companyId: user.companyId },
      });
      setLedgers(res.data || []);
    };
    loadLedgers();
    axios
      .get("/api/v1/cost-center", {
        params: { companyId: user.companyId },
      })
      .then((res) => {
        setCostCenters(res.data || []);
      });
  }, []);

  const mapOptions = (arr) =>
    arr.map((l) => ({
      value: l._id,
      label: `${l.name} (${l?.groupId?.name})`,
    }));

  const cashBankLedgers = useMemo(
    () =>
      ledgers.filter((l) =>
        CASH_BANK_UNDER.map((u) => u?.toLowerCase()).includes(
          l?.groupId?.name.toLowerCase(),
        ),
      ),
    [ledgers],
  );

  const nonCashBankLedgers = useMemo(
    () =>
      ledgers.filter(
        (l) =>
          !CASH_BANK_UNDER.map((u) => u?.toLowerCase()).includes(
            l?.groupId?.name.toLowerCase(),
          ),
      ),
    [ledgers],
  );

  const fromOptions = isPayment
    ? mapOptions(cashBankLedgers)
    : mapOptions(nonCashBankLedgers);

  const toOptions = isPayment
    ? mapOptions(nonCashBankLedgers)
    : mapOptions(cashBankLedgers);

  const partyLedgerId = isPayment ? form.toLedgerId : form.fromLedgerId;

  /* ---------------- LOAD DOCUMENTS ---------------- */
  useEffect(() => {
    if (!purpose || !partyLedgerId) return;

    axios
      .get("/api/v1/documents", {
        params: { purpose, ledgerId: partyLedgerId },
      })
      .then((res) => setDocuments(res.data || []))
      .catch(() => setDocuments([]));
  }, [purpose, partyLedgerId]);

  /* ---------------- HELPERS ---------------- */
  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleInvoiceAmount = (invoiceId, value) => {
    const amount = Number(value) || 0;

    setForm((prev) => {
      const existing = prev.invoices.filter((i) => i.invoiceId !== invoiceId);

      if (amount > 0) {
        existing.push({ invoiceId, amount });
      }

      return { ...prev, invoices: existing };
    });
  };

  const totalAllocated = useMemo(
    () => form.invoices.reduce((s, i) => s + (i.amount || 0), 0),
    [form.invoices],
  );

  const remaining = Number(form.amount || 0) - totalAllocated;

  /* ---------------- AUTO ALLOCATE ---------------- */
  const autoAllocate = () => {
    let remaining = Number(form.amount || 0);
    const allocations = [];

    for (let doc of documents) {
      if (remaining <= 0) break;

      const alloc = Math.min(doc.balance, remaining);

      allocations.push({
        invoiceId: doc._id,
        amount: alloc,
      });

      remaining -= alloc;
    }

    setForm((prev) => ({ ...prev, invoices: allocations }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fromLedgerId || !form.toLedgerId) return alert("Select ledgers");

    if (form.fromLedgerId === form.toLedgerId)
      return alert("From and To cannot be same");

    if (totalAllocated > Number(form.amount))
      return alert("Allocated exceeds amount");

    setLoading(true);

    try {
      await axios.post(isPayment ? "/api/v1/payment" : "/api/v1/receipt", {
        date: form.date,
        costCenterId: form.costCenterId,
        from: form.fromLedgerId,
        to: form.toLedgerId,
        amount: Number(form.amount),
        narration: form.description,
        referenceNo: form.referenceNo,
        // invoices: form.invoices,
      });

      if (refresh) refresh();
      onClose();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.error || "Error saving voucher");
    } finally {
      setLoading(false);
    }
  };

  const costCenterOptions = costCenters.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  /* ---------------- UI ---------------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* DATE */}
      <input
        type="date"
        value={form.date}
        onChange={(e) => updateForm("date", e.target.value)}
        className="border p-2 rounded w-full"
        required
      />

      {/* COST CENTER */}
      <Select
        options={costCenterOptions}
        value={costCenterOptions.find((o) => o.value === form.costCenterId)}
        onChange={(e) => updateForm("costCenterId", e?.value || "")}
        placeholder="Select Cost Center (Optional)"
        isClearable
      />

      {/* FROM */}
      <Select
        options={fromOptions}
        placeholder={isPayment ? "Pay From (Cash/Bank)" : "Receive From"}
        onChange={(v) => updateForm("fromLedgerId", v?.value || "")}
        isClearable
      />

      {/* TO */}
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
      {/* <select
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
      </select> */}

      {/* DOCUMENT LIST */}
      {/* {documents.length > 0 && (
        <div className="border rounded p-3 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium">Invoice Allocation</span>
            <button
              type="button"
              onClick={autoAllocate}
              className="text-blue-600 text-xs"
            >
              Auto Allocate
            </button>
          </div>

          {documents.map((doc) => (
            <div key={doc._id} className="grid grid-cols-4 gap-2 items-center">
              <div>
                {doc.docType} #{doc.docNo}
              </div>

              <div>Due: {doc.balance}</div>

              <input
                type="number"
                max={doc.balance}
                onChange={(e) => handleInvoiceAmount(doc._id, e.target.value)}
                className="border p-1 rounded"
              />
            </div>
          ))}

          <div className="text-right font-medium">
            Allocated: {totalAllocated} | Remaining: {remaining}
          </div>
        </div>
      )} */}

      {/* REF */}
      <input
        placeholder="Reference No"
        value={form.referenceNo}
        onChange={(e) => updateForm("referenceNo", e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* NARRATION */}
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
