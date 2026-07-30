import { Pencil, Trash2 } from "lucide-react";

export default function GSTConfigTable({
  loading,
  data = [],
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-10 text-center text-gray-500">
        Loading GST Configurations...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-10 text-center text-gray-500">
        No GST Configuration Found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm font-semibold text-gray-700">
              <th className="px-4 py-3">GST Type</th>

              <th className="px-4 py-3">Rate</th>

              <th className="px-4 py-3">Purchase</th>

              <th className="px-4 py-3">Sales</th>

              <th className="px-4 py-3">Status</th>

              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => {
              const purchaseConfigured =
                item.purchase?.intraState?.cgstLedgerId &&
                item.purchase?.intraState?.sgstLedgerId &&
                item.purchase?.interState?.igstLedgerId;

              const salesConfigured =
                item.sales?.intraState?.cgstLedgerId &&
                item.sales?.intraState?.sgstLedgerId &&
                item.sales?.interState?.igstLedgerId;

              return (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.gstType}</td>

                  <td className="px-4 py-3">{item.rate}%</td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        purchaseConfigured
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {purchaseConfigured ? "Configured" : "Missing"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        salesConfigured
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {salesConfigured ? "Configured" : "Missing"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 transition"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(item._id)}
                        className="rounded-md bg-red-500 p-2 text-white hover:bg-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
