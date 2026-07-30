import { Pencil, Send, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StatusBadge from "../../../../components/UI/StatusBadge";


const PurchaseTable = ({ purchases, refresh }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase?")) return;

    try {
      await axios.delete(`/api/v1/purchase-invoice/${id}`);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePost = async (id) => {
    if (!window.confirm("Post this purchase?")) return;

    try {
      await axios.post(`/api/v1/purchase-invoice/${id}/post`);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this purchase?")) return;

    try {
      await axios.post(`/api/v1/purchase-invoice/${id}/cancel`);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="border-b text-left text-sm font-semibold text-gray-700">
              <th className="px-4 py-3">Purchase No</th>

              <th className="px-4 py-3">Supplier</th>

              <th className="px-4 py-3">Invoice No</th>

              <th className="px-4 py-3">Cost Center</th>

              <th className="px-4 py-3 text-right">Amount</th>

              <th className="px-4 py-3 text-center">Status</th>

              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {purchases.map((purchase) => (
              <tr
                key={purchase._id}
                className="border-b hover:bg-blue-50 transition"
              >
                <td className="px-4 py-4">
                  <button
                    onClick={() => navigate(`/erp/purchase-invoice/view/${purchase._id}`)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {purchase.purchaseNo}
                  </button>
                </td>

                <td className="px-4 py-4">{purchase.supplierId?.name}</td>

                <td className="px-4 py-4">
                  {purchase.supplierInvoiceNo || "-"}
                </td>

                <td className="px-4 py-4">
                  {purchase.costCenterId?.name || "-"}
                </td>

                <td className="px-4 py-4 text-right font-semibold">
                  ₹ {purchase.summary?.grandTotal?.toLocaleString("en-IN")}
                </td>

                <td className="px-4 py-4 text-center">
                  <StatusBadge status={purchase.status} />
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {(purchase.status === "DRAFT" ||
                      purchase.status === "CANCELLED") && (
                      <>
                        <button
                          onClick={() =>
                            navigate(`/erp/purchase-form/edit/${purchase._id}`)
                          }
                          className="rounded p-2 text-blue-600 hover:bg-blue-100"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handlePost(purchase._id)}
                          className="rounded p-2 text-green-600 hover:bg-green-100"
                          title="Post"
                        >
                          <Send size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(purchase._id)}
                          className="rounded p-2 text-red-600 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}

                    {purchase.status === "POSTED" && (
                      <button
                        onClick={() => handleCancel(purchase._id)}
                        className="rounded px-3 py-2 text-red-600 hover:bg-red-100"
                      >
                        Cancel
                      </button>
                    )}

                    {purchase.status === "PAID" && (
                      <span className="text-sm text-gray-500">Closed</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseTable;
