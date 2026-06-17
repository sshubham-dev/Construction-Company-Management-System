import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "../../../components/Modal";
import CreateContra from "../../../components/CreateContra";
import CreateReceipt_Payment from "../../../components/CreateReceipt_Payment";
import CreateJournal from "../../../components/CreateJournal";
import Select from "react-select";

const API_MAP = {
  contra: "/api/v1/contra",
  journal: "/api/v1/journal",
  payment: "/api/v1/payment",
  receipt: "/api/v1/receipt",
};

const STATUS_OPTIONS = ["DRAFT", "POSTED", "CANCELLED"];
const getCurrentFY = () => {
  const today = new Date();

  const year =
    today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

  return {
    from: `${year}-04-01`,
    to: `${year + 1}-03-31`,
  };
};

const VoucherList = ({ type, onCreate }) => {
  const endpoint = API_MAP[type];
  const fy = getCurrentFY();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState(fy.from);
  const [toDate, setToDate] = useState(fy.to);
  const [ledgers, setLedgers] = useState([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [ledgerId, setLedgerId] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  /* FETCH */
  useEffect(() => {
    fetchLedgers();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    console.log(type);
    try {
      const res = await axios.get(endpoint, {
        params: {
          page,
          limit,
          search,
          status,
          fromDate,
          toDate,
          ledger: ledgerId,
          minAmount,
          maxAmount,
        },
      });
      console.log(res.data);

      setData(res.data.data || res.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.log(err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgers = async () => {
    const res = await axios.get("/api/v1/ledger", {
      params: { companyId: user.companyId },
    });
    console.log("ledger found: ", res.data);
    if (type === "journal") {
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const filtered = data.filter(
        (l) =>
          !l?.groupId?.name?.toLowerCase().includes("bank") &&
          !l?.groupId?.name?.toLowerCase().includes("cash"),
      );
      setLedgers(filtered);
    } else if (type === "contra") {
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const filtered = data.filter(
        (l) =>
          l?.groupId?.name?.toLowerCase().includes("bank") ||
          l?.groupId?.name?.toLowerCase().includes("cash"),
      );
      setLedgers(filtered);
    } else {
      setLedgers(res.data.data || []);
    }
  };

  const ledgerOptions = ledgers.map((l) => ({
    value: l._id,
    label: l.name,
  }));

  useEffect(() => {
    fetchData();
  }, [
    page,
    search,
    status,
    fromDate,
    toDate,
    ledgerId,
    minAmount,
    maxAmount,
    type,
  ]);

  /* ACTIONS */
  const handlePost = async (id) => {
    await axios.post(`${endpoint}/post/${id}`);
    toast.success("Posted");
    fetchData();
  };

  const handleCancel = async (id) => {
    await axios.put(`${endpoint}/cancel/${id}`);
    toast.success("Cancelled");
    fetchData();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${endpoint}/${id}`);
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    }
  };

  const handleEdit = (voucher) => {
    setSelectedVoucher(voucher);
    setIsEdit(true);
  };

  const EditModal = ({ voucher }) => {
    if (!voucher) return null;

    switch (voucher.type) {
      case "CONTRA":
        return (
          <CreateContra onClose={() => setIsEdit(false)} editId={voucher._id} />
        );

      case "PAYMENT":
        return (
          <CreateReceipt_Payment
            onClose={() => setIsEdit(false)}
            type="payment"
            editId={voucher._id}
          />
        );

      case "RECEIPT":
        return (
          <CreateReceipt_Payment
            onClose={() => setIsEdit(false)}
            type="receipt"
            editId={voucher._id}
          />
        );

      case "JOURNAL":
        return (
          <CreateJournal
            onClose={() => setIsEdit(false)}
            editId={voucher._id}
          />
        );

      default:
        return null;
    }
  };

  /* STATUS STYLE */
  const statusColor = {
    DRAFT: "bg-yellow-100 text-yellow-700",
    POSTED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-3 sm:p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* SEARCH */}
        <Select
          options={ledgerOptions}
          value={ledgerOptions.find((l) => l.value === ledgerId) || null}
          onChange={(e) => setLedgerId(e?.value)}
          placeholder="Select Ledger"
          isClearable
        />

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const fy = getCurrentFY();
                setFromDate(fy.from);
                setToDate(fy.to);
              }}
              className="rounded-lg border px-3 text-sm bg-white"
            >
              Current FY
            </button>

            <button
              type="button"
              onClick={() => {
                const today = new Date();

                const from = `${today.getFullYear()}-01-01`;

                const to = today.toISOString().split("T")[0];

                setFromDate(from);
                setToDate(to);
              }}
              className="rounded-lg border px-3 py-2 text-sm bg-white"
            >
              Current Year
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 text-sm rounded-lg border bg-white hover:bg-gray-100"
          >
            Filters
          </button>

          {onCreate && (
            <button
              onClick={onCreate}
              className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              + Add
            </button>
          )}
        </div>
      </div>

      {/* FILTER PANEL */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        head="Filter"
      >
        <div className="grid grid-cols-1 gap-3">
          <select
            className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none text-sm"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none text-sm"
          />

          <input
            placeholder="Min ₹"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none text-sm"
          />
          <input
            placeholder="Max ₹"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none text-sm"
          />
        </div>
      </Modal>

      {/* LIST */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading vouchers...
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.length === 0 ? (
            <div className="text-center text-gray-400 col-span-full">
              No vouchers found
            </div>
          ) : (
            data.map((v) => (
              <div
                key={v._id}
                className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {v.voucherNo}
                    </h3>

                    <p className="text-xs text-gray-500">
                      {new Date(v.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${statusColor[v.status]}`}
                    >
                      {v.status}
                    </span>

                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      {v.type}
                    </span>
                  </div>
                </div>

                {/* Ledger Flow */}
                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between gap-4">
                      <span className="text-xs text-red-600">Credit</span>

                      <span className="text-sm font-medium text-right">
                        {
                          v.entries.find((e) => e.type === "CREDIT")?.ledgerId
                            ?.name
                        }
                      </span>
                    </div>

                    <div className="text-right text-gray-400 mr-14">↓</div>

                    <div className="flex justify-between gap-4">
                      <span className="text-xs text-green-600">Debit</span>

                      <span className="text-sm font-medium text-right">
                        {
                          v.entries.find((e) => e.type === "DEBIT")?.ledgerId
                            ?.name
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="mt-3 flex justify-between">
                  <span className="text-sm text-gray-500">Amount</span>

                  <span className="font-bold text-lg">
                    ₹{v.totalDebit?.toLocaleString()}
                  </span>
                </div>

                {/* Cost Center */}
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500">Cost Center</span>

                  <span>{v.costCenterId?.name || "-"}</span>
                </div>

                {/* Narration */}
                <div className="mt-3 border-t pt-3">
                  <p className="text-xs text-gray-500">Narration</p>

                  <p className="text-sm text-gray-700">{v.narration || "-"}</p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex justify-end gap-3 border-t pt-3">
                  {v.status === "DRAFT" && (
                    <button
                      onClick={() => handleEdit(v)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>
                  )}

                  {v.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() => handlePost(v._id)}
                        className="text-green-600"
                      >
                        Post
                      </button>

                      <button
                        onClick={() => handleDelete(v._id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {v.status === "POSTED" && (
                    <button
                      onClick={() => handleCancel(v._id)}
                      className="text-red-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex items-center justify-between text-sm pt-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-gray-600">
          {page} / {totalPages || 1}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <Modal
        isOpen={isEdit}
        onClose={() => setIsEdit(false)}
        head={`Update ${selectedVoucher?.type}`}
      >
        <EditModal voucher={selectedVoucher} />
      </Modal>
    </div>
  );
};

export default VoucherList;
