import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const GRNScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grn, setGrn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGRN();
  }, [id]);

  const fetchGRN = async () => {
    try {
      const res = await axios.get(`/api/v1/grn/${id}`);
      setGrn(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (!grn) return <div className="p-4">GRN not found</div>;

  const isDraft = grn.status === "Draft";

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">{grn.grnNo}</h2>
          <p className="text-xs text-gray-500">
            Date: {new Date(grn.date).toLocaleDateString()}
          </p>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded ${
            grn.status === "Posted"
              ? "bg-green-200 text-green-800"
              : grn.status === "Cancelled"
              ? "bg-red-200 text-red-800"
              : "bg-yellow-200 text-yellow-800"
          }`}
        >
          {grn.status}
        </span>
      </div>

      {/* META */}
      <div className="border rounded p-3 bg-white text-sm">
        <p>Store: {grn.storeId?.name}</p>
        <p>Supplier: {grn.supplierId?.name}</p>
        <p>PO: {grn.purchaseOrderId?.poNo || "-"}</p>
      </div>

      {/* ITEMS */}
      <div className="border rounded bg-white">
        <div className="p-3 font-medium border-b">Items</div>

        {grn.items.map((i, idx) => (
          <div key={idx} className="p-3 border-b last:border-b-0">
            <p className="font-medium">{i.stockId?.name}</p>
            <p className="text-xs text-gray-500">
              Ordered: {i.orderedQty} | Received: {i.receivedQty}
            </p>
            <p className="text-xs">
              Accepted: {i.acceptedQty}, Rejected: {i.rejectedQty}
            </p>
            <p className="text-xs">
              Rate: ₹{i.rate} | Amount: ₹{i.amount}
            </p>
            {i.remarks && (
              <p className="text-xs text-gray-500">
                Remarks: {i.remarks}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* TOTALS */}
      <div className="border rounded p-3 bg-gray-50 text-sm">
        <p>Gross Amount: ₹{grn.grossAmount}</p>
        <p>GST Amount: ₹{grn.gstAmount}</p>
        <p className="font-medium">
          Net Amount: ₹{grn.netAmount}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Back
        </button>

        {isDraft && (
          <button
            onClick={() =>
              navigate(`/erp/inventory/grn/edit/${grn._id}`)
            }
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};


export default GRNScreen;