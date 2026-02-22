import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Modal from "../../components/Modal";
import CollectionEntry from "./CollectionEntry";

const statusColor = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const Collections = () => {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [createModal, setCreateModal] = useState(false);
  /* ---------------- LOAD DATA ---------------- */

  const loadData = async () => {
    const res = await axios.get("/api/v1/collection");
    setList(res.data);
    console.log(res.data)
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------- FILTERED LIST ---------------- */

  const filtered = useMemo(() => {
    if (!search) return list;

    return list.filter((row) => {
      const text =
        `${row.clientLedgerId?.name} ${row.purpose} ${row.amount}`
          .toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [list, search]);

  /* ---------------- ACTIONS ---------------- */

  const approve = async (id) => {
    if (!window.confirm("Approve this collection?")) return;

    setLoading(true);
    await axios.post(`/api/v1/collection/${id}/approve`);
    setLoading(false);

    loadData();
    setSelected(null);
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this collection?")) return;

    setLoading(true);
    await axios.post(`/api/v1/collection/${id}/reject`);
    setLoading(false);

    loadData();
    setSelected(null);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 space-y-5">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">
            Design Payment
          </h2>
          <p className="text-sm text-gray-500">
            Review and approve payments received by Design
          </p>
        </div>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          onClick={() => setCreateModal(true)}
        >
          + Add Collection
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white border rounded-xl p-3 shadow-sm">
        <input
          placeholder="Search client, purpose or amount..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-sm"
        />
      </div>

      {/* TABLE CARD */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Purpose</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((row) => (
              <tr
                key={row._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3">
                  {new Date(row.date).toLocaleDateString()}
                </td>

                <td className="font-medium">
                  {row.clientLedgerId?.name}
                </td>

                <td>₹ {row.amount}</td>

                <td className="capitalize text-gray-600">
                  {row.purpose}
                </td>

                <td>
                  <span
                    className={`px-2 py-1 border rounded-full text-xs ${statusColor[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() => setSelected(row)}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-400">
                  No collections found
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>

      {/* VIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-[560px] rounded-2xl p-6 space-y-4 shadow-lg">

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Collection Details
              </h3>

              <span
                className={`px-3 py-1 text-xs border rounded-full ${statusColor[selected.status]}`}
              >
                {selected.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">

              <div>
                <b>Date:</b>{" "}
                {new Date(selected.date).toLocaleDateString()}
              </div>

              <div>
                <b>Amount:</b> ₹ {selected.amount}
              </div>

              <div>
                <b>Client:</b>{" "}
                {selected.clientLedgerId?.name}
              </div>

              <div>
                <b>Received Into:</b>{" "}
                {selected.receivedInto?.name}
              </div>

              <div>
                <b>Purpose:</b> {selected.purpose}
              </div>

              <div>
                <b>Medium:</b> {selected.medium}
              </div>

              <div>
                <b>Reference:</b> {selected.referenceNo || "-"}
              </div>
            </div>

            {selected.narration && (
              <div className="text-sm bg-gray-50 p-3 rounded">
                {selected.narration}
              </div>
            )}

            {selected.proofImage && (
              <img
                src={`${selected.proofImage}`}
                alt="proof"
                className="max-h-72 border rounded-lg mx-auto"
              />
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-3">

              {selected.status === "pending" && (
                <>
                  <button
                    disabled={loading}
                    onClick={() => reject(selected._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  >
                    Reject
                  </button>

                  <button
                    disabled={loading}
                    onClick={() => approve(selected._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    Post
                  </button>
                </>
              )}

              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)}>
        <CollectionEntry onClose={() => setCreateModal(false)} />
      </Modal>
    </div>
  );
};

export default Collections;
