import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";

const API_MAP = {
  payment: "/api/v1/payment",
  receipt: "/api/v1/receipt",
};

const CreateReceipt_Payment = ({
  type = "payment",
  onClose,
  refresh,
  editId,
}) => {
  const endpoint = API_MAP[type];
  const isPayment = type.toLowerCase() === "payment";
  const isEdit = !!editId;
  /* ---------------- STATE ---------------- */
  const [ledgers, setLedgers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    costCenterId: null,
    from: "",
    to: "",
    amount: "",
    referenceNo: "",
    narration: "",
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
      setLedgers(res.data.data || []);
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

  useEffect(() => {
    if (!editId) return;
    console.log(editId);
    fetchVoucher();
  }, [editId]);

  const fetchVoucher = async () => {
    const res = await axios.get(`${endpoint}/${editId}`);

    const voucher = res.data?.voucher;
    console.log(res.data?.voucher);

    setForm({
      date: voucher.date?.slice(0, 10),
      costCenterId: voucher.costCenterId?._id || voucher.costCenterId,
      from: voucher.entries.find((x) => x.type === "CREDIT")?.ledgerId?._id,
      to: voucher.entries.find((x) => x.type === "DEBIT")?.ledgerId?._id,
      amount: voucher.totalDebit,
      narration: voucher.narration,
    });
  };

  const mapOptions = (arr) =>
    arr.map((l) => ({
      value: l._id,
      label: `${l.name} (${
        l.mailingDetails?.phoneNo || l?.groupId?.name || l.referenceType
      })`,
    }));

  const cashBankLedgers = useMemo(
    () =>
      ledgers?.filter((l) =>
        CASH_BANK_UNDER.map((u) => u?.toLowerCase()).includes(
          l?.groupId?.name.toLowerCase(),
        ),
      ),
    [ledgers],
  );

  const nonCashBankLedgers = useMemo(
    () =>
      ledgers?.filter(
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

  const partyLedgerId = isPayment ? form.to : form.from;

  /* ---------------- HELPERS ---------------- */
  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.from || !form.to) return alert("Select ledgers");

    if (form.from === form.to) return alert("From and To cannot be same");

    setLoading(true);

    try {
      if (editId !== undefined) {
        await axios.put(
          isPayment ? `/api/v1/payment/${editId}` : `/api/v1/receipt/${editId}`,
          {
            date: form.date,
            costCenterId: form.costCenterId,
            from: form.from,
            to: form.to,
            amount: Number(form.amount),
            narration: form.narration,
            referenceNo: form.referenceNo,
          },
        );
      } else {
        await axios.post(isPayment ? "/api/v1/payment" : "/api/v1/receipt", {
          date: form.date,
          costCenterId: form.costCenterId,
          from: form.from,
          to: form.to,
          amount: Number(form.amount),
          narration: form.narration,
          referenceNo: form.referenceNo,
        });
      }

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
        value={fromOptions.find((option) => option.value === form.from)}
        onChange={(v) => updateForm("from", v?.value || "")}
        isClearable
      />

      {/* TO */}
      <Select
        options={toOptions}
        placeholder={isPayment ? "Pay To" : "Receive Into (Cash/Bank)"}
        value={toOptions.find((option) => option.value === form.to)}
        onChange={(v) => updateForm("to", v?.value || "")}
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
        required
        value={form.narration}
        onChange={(e) => updateForm("narration", e.target.value)}
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
