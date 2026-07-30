import {
  Pencil,
  Send,
  Trash2,
  FileText,
  MapPin,
  ReceiptIndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StatusBadge from "../../../../components/UI/StatusBadge";

const PurchaseCard = ({ purchase, refresh }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("Delete this purchase?")) return;

    try {
      await axios.delete(`/api/v1/purchase-invoice/${purchase._id}`);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePost = async () => {
    if (!window.confirm("Post this purchase?")) return;

    try {
      await axios.post(`/api/v1/purchase-invoice/${purchase._id}/post`);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this purchase?")) return;

    try {
      await axios.post(`/api/v1/purchase-invoice/${purchase._id}/cancel`);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      {/* Header */}

      <div className="flex items-start justify-between border-b p-4">
        <div>
          <button
            onClick={() =>
              navigate(`/erp/purchase-invoice/view/${purchase._id}`)
            }
            className="font-semibold text-blue-600 hover:underline"
          >
            {purchase.purchaseNo}
          </button>

          <p className="mt-1 text-sm font-medium text-gray-700">
            {purchase.supplierId?.name}
          </p>
        </div>

        <StatusBadge status={purchase.status} />
      </div>

      {/* Body */}

      <div className="space-y-3 p-4 text-sm">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-gray-400" />

          <span className="text-gray-500">Invoice</span>

          <span className="font-medium">
            {purchase.supplierInvoiceNo || "-"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />

          <span className="text-gray-500">Site</span>

          <span className="font-medium">
            {purchase.costCenterId?.name || "-"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ReceiptIndianRupee size={16} className="text-gray-400" />

          <span className="text-gray-500">Amount</span>

          <span className="font-semibold text-lg text-gray-900">
            ₹ {purchase.summary?.grandTotal?.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Actions */}

      <div className="grid grid-cols-3 border-t">
        {(purchase.status === "DRAFT" || purchase.status === "CANCELLED") && (
          <>
            <button
              onClick={() =>
                navigate(`/erp/purchase-form/edit/${purchase._id}`)
              }
              className="flex flex-col items-center gap-1 border-r py-3 text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <Pencil size={18} />
              <span className="text-xs">Edit</span>
            </button>

            <button
              onClick={handlePost}
              className="flex flex-col items-center gap-1 border-r py-3 text-green-600 transition hover:bg-green-50"
            >
              <Send size={18} />
              <span className="text-xs">Post</span>
            </button>

            <button
              onClick={handleDelete}
              className="flex flex-col items-center gap-1 py-3 text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={18} />
              <span className="text-xs">Delete</span>
            </button>
          </>
        )}

        {purchase.status === "POSTED" && (
          <button
            onClick={handleCancel}
            className="col-span-3 flex items-center justify-center gap-2 py-3 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={18} />
            Cancel Purchase
          </button>
        )}

        {purchase.status === "PAID" && (
          <div className="col-span-3 py-3 text-center text-sm text-gray-500">
            Purchase Closed
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseCard;
