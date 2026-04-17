import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Modal from "../../components/Modal";
import CollectionEntry from "./CollectionEntry";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";

const statusColor = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const Collections = () => {
  const { user } = useSelector((state) => state.auth);

  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  // Quick filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Advanced filters
  const [filterOpen, setFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    fromDate: "",
    toDate: "",
    bank: "",
    costCenter: "",
    businessUnit: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  /* ---------------- LOAD DATA ---------------- */

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/v1/collection", {
        params: {
          companyId: user?.companyId,
          page,
          limit,
          search,
          status: statusFilter,
          date: dateFilter,
          ...advancedFilters,
        },
      });

      setList(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter, dateFilter]);

  // Debounce search
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      loadData();
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  /* ---------------- ACTIONS ---------------- */

  const approve = async (id) => {
    await axios.post(`/api/v1/collection/${id}/approve`);
    loadData();
    setSelected(null);
  };

  const reject = async (id) => {
    await axios.post(`/api/v1/collection/${id}/reject`);
    loadData();
    setSelected(null);
  };

  const handleEdit = async (id) => {
    setEditId(id);
    setEditModal(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/v1/collection/${id}`);
    loadData();
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDateFilter("");
    setAdvancedFilters({
      fromDate: "",
      toDate: "",
      bank: "",
      costCenter: "",
      businessUnit: "",
    });
    setPage(1);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-3 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Payment Received</h2>

          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg"
          >
            <MdAdd /> Add
          </button>
        </div>

        {/* SEARCH */}
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg p-2 text-sm w-full"
        />

        {/* QUICK FILTERS */}
        <div className="flex gap-2 overflow-x-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg p-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded-lg p-2 text-sm"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <button
            onClick={() => setFilterOpen(true)}
            className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm"
          >
            Filters
          </button>

          <button
            onClick={clearFilters}
            className="px-3 py-2 bg-gray-200 rounded-lg text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {list.map((row) => (
            <div
              key={row._id}
              className="bg-white border rounded-xl p-3 shadow-sm space-y-2"
            >
              <div className="flex justify-between">
                <div className="font-medium text-sm">
                  {row.clientLedgerId?.name}
                </div>

                <span
                  className={`px-2 py-1 text-xs border rounded-full ${statusColor[row.status]}`}
                >
                  {row.status}
                </span>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>₹ {row.amount}</span>
                <span>{new Date(row.date).toLocaleDateString()}</span>
              </div>

              <div className="text-xs text-gray-500">
                {row.purpose || row.narration}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setSelected(row)}
                  className="text-green-600 text-sm"
                >
                  View
                </button>

                {row.status === "pending" && (
                  <div className="flex gap-4">
                    <button onClick={() => handleEdit(row._id)}>
                      <GrEdit className="text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(row._id)}>
                      <MdDelete className="text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-2 bg-gray-200 rounded-lg"
        >
          Prev
        </button>

        <span className="text-sm">
          Page {page} / {Math.ceil(total / limit) || 1}
        </span>

        <button
          disabled={page >= Math.ceil(total / limit)}
          onClick={() => setPage(page + 1)}
          className="px-3 py-2 bg-gray-200 rounded-lg"
        >
          Next
        </button>
      </div>

      {/* ADVANCED FILTER PANEL */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-4 space-y-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setFilterOpen(false)}>✕</button>
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                value={advancedFilters.fromDate}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    fromDate: e.target.value,
                  })
                }
                className="border p-2 rounded-lg w-full"
              />
              <input
                type="date"
                value={advancedFilters.toDate}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    toDate: e.target.value,
                  })
                }
                className="border p-2 rounded-lg w-full"
              />
            </div>

            <button
              onClick={() => {
                setPage(1);
                loadData();
                setFilterOpen(false);
              }}
              className="w-full bg-green-600 text-white py-2 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* View */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-lg mx-2 rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Collection Details</h3>

              <span
                className={`px-3 py-1 text-xs border rounded-full ${statusColor[selected.status]}`}
              >
                {selected.status}
              </span>
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <b>Date:</b> {new Date(selected.date).toLocaleDateString()}
              </div>

              <div>
                <b>Amount:</b> ₹ {selected.amount}
              </div>

              <div>
                <b>Client:</b> {selected.clientLedgerId?.name}
              </div>

              <div>
                <b>Bank:</b> {selected.receivedInto?.name}
              </div>

              <div>
                <b>Purpose:</b> {selected.purpose || selected.narration}
              </div>

              <div>
                <b>Medium:</b> {selected.medium}
              </div>

              <div>
                <b>Reference:</b> {selected.referenceNo || "-"}
              </div>

              {selected.costCenterId && (
                <div>
                  <b>Cost Center:</b> {selected.costCenterId?.name}
                </div>
              )}

              {selected.businessUnitId && (
                <div>
                  <b>Business Unit:</b> {selected.businessUnitId?.name}
                </div>
              )}
            </div>

            {/* NARRATION */}
            {selected.narration && (
              <div className="bg-gray-50 p-3 rounded text-sm">
                {selected.narration}
              </div>
            )}

            {/* IMAGE */}
            {selected.proofImage && (
              <img
                src={selected.proofImage}
                alt="proof"
                className="w-full max-h-64 object-contain rounded-lg border"
              />
            )}

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {selected.status === "pending" &&
                (user?.department === "Accountant" ||
                  user?.department === "Account head") && (
                  <>
                    <button
                      onClick={() => reject(selected._id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => approve(selected._id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                    >
                      Post
                    </button>
                  </>
                )}

              <button
                onClick={() => setSelected(null)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)}>
        <CollectionEntry onClose={() => setCreateModal(false)} />
      </Modal>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)}>
        <CollectionEntry editId={editId} onClose={() => setEditModal(false)} />
      </Modal>
    </div>
  );
};

export default Collections;
