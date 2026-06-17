import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CashFlowDetails({ title, data, loading, onClose }) {
  const total = data.reduce((s, d) => s + d.amount, 0);
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>

            <p className="text-sm text-gray-500">Cash Flow Drill Down</p>
          </div>

          <button onClick={onClose} className="rounded p-2 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Body */}

        <div className="p-4">
          {loading ? (
            <div className="py-10 text-center">Loading...</div>
          ) : (
            <>
              {/* Desktop */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>

                      <th className="px-3 py-2 text-left">Voucher</th>

                      <th className="px-3 py-2 text-left">Party</th>

                      <th className="px-3 py-2 text-left">Cost Center</th>

                      <th className="px-3 py-2 text-left">Narration</th>

                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.map((row) => (
                      <tr key={row.voucherId} className="border-b">
                        <td className="px-3 py-2">
                          {new Date(row.date).toLocaleDateString()}
                        </td>

                        <td className="px-3 py-2 font-medium">
                          {row.voucherNo}
                        </td>

                        <td
                          className="px-3 py-2 cursor-pointer"
                          onClick={() =>
                            navigate(`/erp/ledger-report/${row.partyLedgerId}`)
                          }
                        >
                          {row.party}
                        </td>

                        <td className="px-3 py-2">{row.costCenter}</td>

                        <td className="px-3 py-2">{row.narration}</td>

                        <td className="px-3 py-2 text-right font-semibold">
                          ₹{row.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}

              <div className="space-y-3 md:hidden">
                {data.map((row) => (
                  <div key={row.voucherId} className="rounded-xl border p-3">
                    <div className="flex justify-between">
                      <div>
                        <div
                          className="font-semibold"
                          onClick={() =>
                            navigate(`/erp/reports/ledger/${row.partyLedgerId}`)
                          }
                        >
                          {row.party}
                        </div>

                        <div className="text-xs text-gray-500">
                          {row.voucherNo}
                        </div>
                      </div>

                      <div className="font-bold">
                        ₹{row.amount.toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(row.date).toLocaleDateString()}
                    </div>

                    <div className="mt-1 text-sm">{row.costCenter}</div>

                    <div className="mt-1 text-sm">{row.narration}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}

              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>

                  <span className="text-lg font-bold">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
