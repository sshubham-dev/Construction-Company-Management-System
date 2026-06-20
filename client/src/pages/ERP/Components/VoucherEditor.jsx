import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";

const API_MAP = {
  contra: "/api/v1/contra",
  journal: "/api/v1/journal",
  payment: "/api/v1/payment",
  receipt: "/api/v1/receipt",
};
const STATUS_OPTIONS = ["DRAFT", "POSTED", "CANCELLED"];

const VoucherEditor = ({ type = "receipt", onClose, refresh, editId }) => {
  const endpoint = API_MAP[type];
  const isPayment = type.toLowerCase() === "payment";
  const isEdit = !!editId;
  /* ---------------- STATE ---------------- */
  const [voucherType, setVoucherType] = useState(type);
  const [voucher, setVoucher] = useState({
    // date: new Date().toISOString().slice(0, 10),
    date: new Date().toISOString().split("T")[0],
    costCenterId: "",
    from: "",
    to: "",
    amount: "",
    referenceNo: "",
    narration: "",
  });
  const [ledgers, setLedgers] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
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

    const handler = (e) => {
      switch (e.key) {
        case "F4":
          e.preventDefault();
          setVoucherType("CONTRA");
          break;

        case "F5":
          e.preventDefault();
          setVoucherType("PAYMENT");
          break;

        case "F6":
          e.preventDefault();
          setVoucherType("RECEIPT");
          break;

        case "F7":
          e.preventDefault();
          setVoucherType("JOURNAL");
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
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

    setVoucher({
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

  const partyLedgerId = isPayment ? voucher.to : voucher.from;

  /* ---------------- HELPERS ---------------- */
  const updateForm = (key, value) =>
    setVoucher((prev) => ({ ...prev, [key]: value }));

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!voucher.from || !voucher.to) return alert("Select ledgers");

    if (voucher.from === voucher.to) return alert("From and To cannot be same");

    setLoading(true);

    try {
      if (editId !== undefined) {
        await axios.put(`${endpoint}/${editId}`, {
          date: voucher.date,
          costCenterId: voucher.costCenterId,
          from: voucher.from,
          to: voucher.to,
          amount: Number(voucher.amount),
          narration: voucher.narration,
          referenceNo: voucher.referenceNo,
        });
      } else {
        await axios.post(endpoint, {
          date: voucher.date,
          costCenterId: voucher.costCenterId,
          from: voucher.from,
          to: voucher.to,
          amount: Number(voucher.amount),
          narration: voucher.narration,
          referenceNo: voucher.referenceNo,
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
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setVoucherType("CONTRA")}
          className={voucherType === "CONTRA" && active}
        >
          F4 Contra
        </button>

        <button
          onClick={() => setVoucherType("PAYMENT")}
          className={voucherType === "PAYMENT" && active}
        >
          F5 Payment
        </button>

        <button
          onClick={() => setVoucherType("RECEIPT")}
          className={voucherType === "RECEIPT" && active }
        >
          F6 Receipt
        </button>

        <button
          onClick={() => setVoucherType("JOURNAL")}
          className={voucherType === "JOURNAL" && active}
        >
          F7 Journal
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* DATE */}
        <input
          type="date"
          value={voucher.date}
          onChange={(e) => updateForm("date", e.target.value)}
          className="border p-2 rounded w-full"
          required
        />

        {/* COST CENTER */}
        <Select
          options={costCenterOptions}
          value={costCenterOptions.find(
            (o) => o.value === voucher.costCenterId,
          )}
          onChange={(e) => updateForm("costCenterId", e?.value || "")}
          placeholder="Select Cost Center (Optional)"
          isClearable
        />

        {/* FROM */}
        <Select
          options={fromOptions}
          placeholder="From"
          value={fromOptions.find((option) => option.value === voucher.from)}
          onChange={(v) => updateForm("from", v?.value || "")}
          isClearable
        />

        {/* TO */}
        <Select
          options={toOptions}
          placeholder="To"
          value={toOptions.find((option) => option.value === voucher.to)}
          onChange={(v) => updateForm("to", v?.value || "")}
          isClearable
        />

        {/* AMOUNT */}
        <input
          type="number"
          placeholder="Amount"
          value={voucher.amount}
          onChange={(e) => updateForm("amount", e.target.value)}
          className="border p-2 rounded w-full"
          required
        />

        {/* REF */}
        <input
          placeholder="Reference No"
          value={voucher.referenceNo}
          onChange={(e) => updateForm("referenceNo", e.target.value)}
          className="border p-2 rounded w-full"
        />

        {/* NARRATION */}
        <textarea
          placeholder="Narration"
          value={voucher.narration}
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
    </div>
  );
};

export default VoucherEditor;
