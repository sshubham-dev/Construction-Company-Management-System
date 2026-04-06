import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Header from "../../components/Header";
import { IoIosAddCircle } from "react-icons/io";
import CreateContra from "../../components/CreateContra";
import Modal from "../../components/Modal";

const Contra = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ======================
     FETCH
  ====================== */
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/contra");
      setVouchers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch vouchers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  /* ======================
     EXTRACT FROM/TO
  ====================== */
  const getFromTo = (entries = []) => {
    const debit = entries.find((e) => e.type === "DEBIT");
    const credit = entries.find((e) => e.type === "CREDIT");

    return {
      from: credit?.ledgerId?.name || "-",
      to: debit?.ledgerId?.name || "-",
      amount: debit?.amount || 0,
    };
  };

  /* ======================
     POST
  ====================== */
  const handlePost = async (id) => {
    try {
      await axios.post(`/api/v1/contra/${id}/post`);
      toast.success("Posted successfully");
      fetchVouchers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Post failed");
    }
  };

  /* ======================
     CANCEL
  ====================== */
  const handleCancel = async (id) => {
    try {
      await axios.post(`/api/v1/contra/${id}/cancel`);
      toast.success("Cancelled successfully");
      fetchVouchers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Cancel failed");
    }
  };

  /* ======================
     STATUS BADGE
  ====================== */
  const statusColor = {
    DRAFT: "bg-yellow-100 text-yellow-700",
    POSTED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  /* ======================
     UI
  ====================== */
  return (
    <section>
      <Header category="Page" title="Contra Voucher" />

      {/* ADD BUTTON */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-500 text-white p-2 rounded-full"
          onClick={() => setIsModalOpen(true)}
        >
          <IoIosAddCircle size={24} />
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th>Voucher No</th>
                <th>Date</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No vouchers found
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => {
                  const { from, to, amount } = getFromTo(v.entries);

                  return (
                    <tr key={v._id} className="border-b">
                      <td>{v.voucherNo}</td>
                      <td>{new Date(v.date).toLocaleDateString()}</td>
                      <td>{from}</td>
                      <td>{to}</td>
                      <td>{amount}</td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`px-2 py-1 rounded text-xs ${statusColor[v.status]}`}
                        >
                          {v.status}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="space-x-2">
                        {v.status === "DRAFT" && (
                          <>
                            <button
                              onClick={() => handlePost(v._id)}
                              className="text-green-600 text-xs"
                            >
                              Post
                            </button>

                            <button
                              onClick={() => handleCancel(v._id)}
                              className="text-red-600 text-xs"
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {v.status === "POSTED" && (
                          <button
                            onClick={() => handleCancel(v._id)}
                            className="text-red-600 text-xs"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      <Modal
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        head="Create Contra"
      >
        <CreateContra
          onClose={() => {
            setIsModalOpen(false);
            fetchVouchers();
          }}
        />
      </Modal>

      <Toaster position="top-right" />
    </section>
  );
};

export default Contra;