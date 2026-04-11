import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";
import { IoIosAddCircle } from "react-icons/io";
import CreateJournal from "../../components/CreateJournal";
import Modal from "../../components/Modal";
import toast, { Toaster } from "react-hot-toast";

const Journal = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ======================
     FETCH
  ====================== */
  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/journal");
      setJournals(res.data || []);
    } catch (err) {
      toast.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  /* ======================
     POST / CANCEL
  ====================== */
  const handlePost = async (id) => {
    try {
      await axios.post(`/api/v1/journal/${id}/post`);
      toast.success("Posted");
      fetchJournals();
    } catch (err) {
      toast.error("Post failed");
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.put(`/api/v1/journal/cancel/${id}`);
      toast.success("Cancelled");
      fetchJournals();
    } catch (err) {
      toast.error("Cancel failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/journal/${id}`);
      toast.success("Deleted");
      fetchJournals();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  /* ======================
     STATUS COLOR
  ====================== */
  const statusColor = {
    DRAFT: "bg-yellow-100 text-yellow-700",
    POSTED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  /* ======================
     TOTAL CALC
  ====================== */
  const getTotals = (entries = []) => {
    let debit = 0;
    let credit = 0;

    entries.forEach((e) => {
      if (e.type === "DEBIT") debit += e.amount;
      else credit += e.amount;
    });

    return { debit, credit };
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="p-2 sm:p-4">
      <Header category="Page" title="Journal Voucher" />

      {/* ADD BUTTON */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-500 text-white p-2 rounded-full"
          onClick={() => setIsModalOpen(true)}
        >
          <IoIosAddCircle size={24} />
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {journals.length === 0 ? (
            <div>No journals found</div>
          ) : (
            journals.map((j) => {
              const { debit, credit } = getTotals(j.entries);

              return (
                <div
                  key={j._id}
                  className="border rounded-lg bg-white shadow p-3 flex flex-col gap-2"
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-sm">
                      {j.voucherNo}
                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded ${statusColor[j.status]}`}
                    >
                      {j.status}
                    </span>
                  </div>

                  {/* DATE */}
                  <div className="text-xs text-gray-500">
                    {new Date(j.date).toLocaleDateString()}
                  </div>

                  {/* NARRATION */}
                  <div className="text-sm">{j.narration || "-"}</div>

                  {/* ENTRIES */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-1 text-left">Ledger</th>
                          <th className="p-1">Dr</th>
                          <th className="p-1">Cr</th>
                        </tr>
                      </thead>

                      <tbody>
                        {j.entries.map((e, i) => (
                          <tr key={i}>
                            <td className="p-1">
                              {e.ledgerId?.name}
                            </td>

                            <td className="p-1 text-center">
                              {e.type === "DEBIT" ? e.amount : "-"}
                            </td>

                            <td className="p-1 text-center">
                              {e.type === "CREDIT" ? e.amount : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* TOTAL */}
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Dr: {debit}</span>
                    <span>Cr: {credit}</span>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-end gap-2 text-xs">
                    {j.status === "DRAFT" && (
                      <>
                        <button
                          onClick={() => handlePost(j._id)}
                          className="text-green-600"
                        >
                          Post
                        </button>

                        <button
                          onClick={() => handleDelete(j._id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {j.status === "POSTED" && (
                      <button
                        onClick={() => handleCancel(j._id)}
                        className="text-red-600"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        head="Create Journal"
      >
        <CreateJournal
          onClose={() => {
            setIsModalOpen(false);
            fetchJournals();
          }}
        />
      </Modal>

      <Toaster position="top-right" />
    </div>
  );
};

export default Journal;