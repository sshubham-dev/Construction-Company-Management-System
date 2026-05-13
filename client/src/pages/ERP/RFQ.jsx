import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const RFQ = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* =========================
     FETCH
  ========================== */
  const fetchRFQs = async () => {
    try {
      const res = await axios.get("/api/v1/rfq");
      setRfqs(res.data.data || []);
    } catch {
      toast.error("Failed to load RFQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  /* =========================
     FILTER
  ========================== */
  const filtered = rfqs.filter((r) => {
    return (
      r.rfqNo?.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter ? r.status === statusFilter : true)
    );
  });

  /* =========================
     ACTIONS
  ========================== */
  const handleSend = async (id) => {
    try {
      await axios.post(`/api/v1/rfq/${id}/send`);
      toast.success("RFQ sent");
      fetchRFQs();
    } catch {
      toast.error("Send failed");
    }
  };

  const handleClose = async (id) => {
    try {
      await axios.post(`/api/v1/rfq/${id}/close`);
      toast.success("RFQ closed");
      fetchRFQs();
    } catch {
      toast.error("Close failed");
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="p-4 space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">RFQ List</h2>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">
        <input
          placeholder="Search RFQ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="border rounded bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">RFQ No</th>
              <th className="p-2">Store</th>
              <th className="p-2">PR</th>
              <th className="p-2">Suppliers</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  No RFQs found
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r._id} className="border-t">

                  {/* RFQ NO */}
                  <td className="p-2 font-medium">{r.rfqNo}</td>

                  {/* STORE */}
                  <td className="p-2">{r.storeId?.name}</td>

                  {/* PR */}
                  <td className="p-2">
                    {r.purchaseRequestId?.prNumber || "-"}
                  </td>

                  {/* SUPPLIERS */}
                  <td className="p-2 text-xs">
                    {r.suppliers?.length} suppliers
                  </td>

                  {/* STATUS */}
                  <td className="p-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      r.status === "SENT"
                        ? "bg-blue-100 text-blue-700"
                        : r.status === "CLOSED"
                        ? "bg-green-100 text-green-700"
                        : r.status === "DRAFT"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {r.status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="p-2 text-right space-x-2">

                    {r.status === "DRAFT" && (
                      <button
                        onClick={() => handleSend(r._id)}
                        className="text-blue-600"
                      >
                        Send
                      </button>
                    )}

                    <button
                      onClick={() =>
                        window.open(`/erp/rfq/${r._id}`)
                      }
                      className="text-green-600"
                    >
                      View
                    </button>

                    {r.status === "SENT" && (
                      <button
                        onClick={() => handleClose(r._id)}
                        className="text-red-600"
                      >
                        Close
                      </button>
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RFQ;