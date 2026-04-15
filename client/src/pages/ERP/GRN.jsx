import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import CreateGRN from "../../components/CreateGRN";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";

const GRN = () => {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ismodalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGRNs();
  }, []);

  const fetchGRNs = async () => {
    try {
      const res = await axios.get("/api/v1/grn");
      setGrns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading GRNs…</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Goods Receipt Notes</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          + New GRN
        </button>
      </div>

      <div className="space-y-3">
        {grns.map((g) => (
          <div
            key={g._id}
            onClick={() => navigate(`/erp/inventory/grn/${g._id}`)}
            className="border rounded p-3 bg-white shadow-sm cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{g.grnNo}</p>
                <p className="text-xs text-gray-500">
                  Supplier: {g.supplierId?.name || "-"}
                </p>
                <p className="text-xs text-gray-500">
                  Store: {g.storeId?.name || "-"}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  g.status === "Posted"
                    ? "bg-green-200 text-green-800"
                    : g.status === "Cancelled"
                    ? "bg-red-200 text-red-800"
                    : "bg-yellow-200 text-yellow-800"
                }`}
              >
                {g.status}
              </span>
            </div>

            <div className="mt-2 flex justify-between text-xs text-gray-600">
              <span>Date: {new Date(g.date).toLocaleDateString()}</span>
              <span>Net: ₹{g.netAmount?.toFixed(2) || 0}</span>
            </div>
            {g.status === "Draft" && (
              <button
                onClick={async () => {
                  if (!confirm("Post this GRN? This cannot be undone.")) return;
                  await axios.post(`/api/v1/grn/${g._id}/post`);
                  fetchGRNs();
                }}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Post GRN
              </button>
            )}
          </div>
        ))}

        {grns.length === 0 && (
          <p className="text-sm text-gray-500 text-center">
            No GRNs created yet
          </p>
        )}
      </div>
      <Modal isOpen={ismodalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateGRN onClose={() => {setIsModalOpen(false); fetchGRNs()}} />
      </Modal>
    </div>
  );
};

export default GRN;
