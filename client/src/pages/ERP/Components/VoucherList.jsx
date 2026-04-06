import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "../../../components/Modal";

const API_MAP = {
  contra: "/api/v1/contra",
  journal: "/api/v1/journal",
  payment: "/api/v1/payment",
  receipt: "/api/v1/receipt",
};

const STATUS_OPTIONS = ["DRAFT", "POSTED", "CANCELLED"];

const VoucherList = ({ type, onCreate }) => {
  const endpoint = API_MAP[type];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [ledger, setLedger] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  /* FETCH */
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
          ledger,
          minAmount,
          maxAmount,
        },
      });

      setData(res.data.data || res.data || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    page,
    search,
    status,
    fromDate,
    toDate,
    ledger,
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
    await axios.post(`${endpoint}/cancel/${id}`);
    toast.success("Cancelled");
    fetchData();
  };

  /* STATUS STYLE */
  const statusColor = {
    DRAFT: "bg-yellow-100 text-yellow-700",
    POSTED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-3 sm:p-5 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* SEARCH */}
        <input
          placeholder="Search voucher..."
          className="w-full sm:w-64 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none text-sm"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 text-sm rounded-lg border bg-white hover:bg-gray-100"
          >
            Filters
          </button>

          {/* <button
            onClick={() => window.print()}
            className="px-3 py-2 text-sm rounded-lg border bg-white hover:bg-gray-100"
          >
            Print
          </button>

          <button
            onClick={() => {
              if (!data.length) return;

              const csv = data.map((v) =>
                `${v.voucherNo},${v.status},${v.narration || ""}`
              ).join("\n");

              const blob = new Blob([csv]);
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${type}.csv`;
              a.click();
            }}
            className="px-3 py-2 text-sm rounded-lg border bg-white hover:bg-gray-100"
          >
            Export
          </button> */}

          {onCreate && (
            <button
              onClick={onCreate}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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
            placeholder="Ledger"
            value={ledger}
            onChange={(e) => setLedger(e.target.value)}
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
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition p-4 flex flex-col gap-2"
              >
                {/* TOP */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{v.voucherNo}</span>

                  <span
                    className={`text-xs px-2 py-1 rounded ${statusColor[v.status]}`}
                  >
                    {v.status}
                  </span>
                </div>

                {/* DATE */}
                <div className="text-xs text-gray-500">
                  {new Date(v.date).toLocaleDateString()}
                </div>

                {/* NARRATION */}
                <div className="text-sm text-gray-700 line-clamp-2">
                  {v.narration || "No description"}
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 pt-2 text-xs">
                  {v.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() => handlePost(v._id)}
                        className="text-green-600 font-medium"
                      >
                        Post
                      </button>
                      <button
                        onClick={() => handleCancel(v._id)}
                        className="text-red-500 font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {v.status === "POSTED" && (
                    <button
                      onClick={() => handleCancel(v._id)}
                      className="text-red-500 font-medium"
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
    </div>
  );
};

export default VoucherList;
