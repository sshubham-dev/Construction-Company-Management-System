import { FiBookOpen } from "react-icons/fi";

const formatCurrency = (amount = 0) =>
  `₹ ${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function EntriesCard({ entries = [] }) {
  const totalDebit = entries
    .filter((e) => e.type === "DEBIT")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const totalCredit = entries
    .filter((e) => e.type === "CREDIT")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Header */}

      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
          <FiBookOpen size={18} />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Voucher Entries</h2>

          <p className="text-sm text-gray-500">
            Accounting impact of this voucher
          </p>
        </div>
      </div>

      {/* Desktop */}

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-5 py-3">Ledger</th>

              <th className="px-5 py-3 text-center">Type</th>

              <th className="px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry, index) => (
              <tr key={index} className="border-t">
                <td className="px-5 py-4 font-medium">{entry.ledger}</td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      entry.type === "DEBIT"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {entry.type}
                  </span>
                </td>

                <td className="px-5 py-4 text-right font-semibold">
                  {formatCurrency(entry.amount)}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t bg-slate-50 font-semibold">
              <td className="px-5 py-4">Total</td>

              <td />

              <td className="px-5 py-4 text-right">
                Dr {formatCurrency(totalDebit)}
                <br />
                Cr {formatCurrency(totalCredit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile */}

      <div className="space-y-3 p-4 md:hidden">
        {entries.map((entry, index) => (
          <div key={index} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{entry.ledger}</h3>

              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  entry.type === "DEBIT"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {entry.type}
              </span>
            </div>

            <div className="mt-3 text-right">
              <p className="text-xs text-gray-500">Amount</p>

              <p className="text-lg font-bold">
                {formatCurrency(entry.amount)}
              </p>
            </div>
          </div>
        ))}

        <div className="rounded-lg bg-slate-100 p-4">
          <div className="flex justify-between">
            <span>Total Debit</span>

            <strong>{formatCurrency(totalDebit)}</strong>
          </div>

          <div className="mt-2 flex justify-between">
            <span>Total Credit</span>

            <strong>{formatCurrency(totalCredit)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
