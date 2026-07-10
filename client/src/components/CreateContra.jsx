import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";

const CreateContra = ({ onClose, refresh, editId }) => {
  const isEdit = !!editId;
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    costCenterId: "",
    from: "",
    to: "",
    amount: "",
    narration: "",
  });
  const { user, isLoggedIn } = useSelector((state) => state.auth);

  /* ======================
     FETCH LEDGERS
  ====================== */
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get("/api/v1/ledger", {
          params: { companyId: user.companyId },
        });
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        console.log(data);

        // Only cash/bank accounts
        const filtered = data.filter(
          (l) =>
            l?.groupId?.name?.toLowerCase().includes("bank") ||
            l?.groupId?.name?.toLowerCase().includes("cash"),
        );

        setAccounts(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAccounts();
    axios
      .get("/api/v1/cost-center", { params: { companyId: user.companyId } })
      .then((res) => {
        setCostCenters(res.data || []);
      });
  }, []);

  useEffect(() => {
    if (!editId) return;

    fetchVoucher();
  }, [editId]);

  const fetchVoucher = async () => {
    const res = await axios.get(`/api/v1/contra/${editId}`);

    const voucher = res.data;

    setForm({
      date: voucher.date?.slice(0, 10),
      costCenterId: voucher.costCenterId?._id || voucher.costCenterId,
      from: voucher.entries.find((x) => x.type === "CREDIT")?.ledgerId?._id,
      to: voucher.entries.find((x) => x.type === "DEBIT")?.ledgerId?._id,
      amount: voucher.totalDebit,
      narration: voucher.narration,
    });
  };

  /* ======================
     HANDLE CHANGE
  ====================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ======================
     SUBMIT
  ====================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.from === form.to) {
      return alert("From and To cannot be same");
    }

    setLoading(true);
    console.log("Submitting Contra:", form);
    try {
      if (isEdit) {
        await axios.post(`/api/v1/contra/${editId}`, {
          date: form.date,
          from: form.from,
          to: form.to,
          amount: Number(form.amount),
          narration: form.narration,
          costCenterId: form.costCenterId,
        });
      } else {
        await axios.post("/api/v1/contra", {
          date: form.date,
          from: form.from,
          to: form.to,
          amount: Number(form.amount),
          narration: form.narration,
          costCenterId: form.costCenterId,
        });
      }

      if (refresh) refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error creating contra");
    } finally {
      setLoading(false);
    }
  };

  const costCenterOptions = costCenters.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* DATE */}
      <div>
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
      </div>

      {/* COST CENTER */}
      <Select
        options={costCenterOptions}
        value={costCenterOptions.find((o) => o.value === form.costCenterId)}
        onChange={(opt) =>
          setForm((prev) => ({ ...prev, costCenterId: opt?.value || "" }))
        }
        // onChange={(e) => updateForm("costCenterId", e?.value || "")}
        placeholder="Select Cost Center (Optional)"
        isClearable
      />

      {/* FROM */}
      <div>
        <label>From Account</label>
        <select
          name="from"
          value={form.from}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        >
          <option value="">Select</option>
          {accounts.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* TO */}
      <div>
        <label>To Account</label>
        <select
          name="to"
          value={form.to}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        >
          <option value="">Select</option>
          {accounts.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* AMOUNT */}
      <div>
        <label>Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          min={1}
          required
          className="border p-2 w-full rounded"
        />
      </div>

      {/* NARRATION */}
      <div>
        <label>Narration</label>
        <input
          type="text"
          name="narration"
          value={form.narration}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-gray">
          Cancel
        </button>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default CreateContra;
