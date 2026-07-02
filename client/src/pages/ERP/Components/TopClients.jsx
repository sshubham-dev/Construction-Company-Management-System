import { FaUserTie, FaPhoneAlt, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function TopClients({ data = [] }) {
  const navigate = useNavigate();

  const rank = (i) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `#${i + 1}`;
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="text-lg font-semibold">Top Clients</h2>

        <p className="text-sm text-gray-500">Highest collection received</p>
      </div>

      <div className="divide-y">
        {data.length === 0 && (
          <div className="p-10 text-center text-gray-400">No Data Found</div>
        )}

        {data.map((client, index) => (
          <div
            key={client.ledgerId}
            className="p-4 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <FaUserTie className="text-blue-600" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    {rank(index)} {client.name}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaPhoneAlt />

                      {client.phone || "-"}
                    </span>

                    <span>{client.transactions} Collections</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                      {client.medium}
                    </span>

                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      {new Date(client.lastCollectionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <h3 className="font-bold text-green-700">
                  {money(client.amount)}
                </h3>

                <p className="text-xs text-gray-500">
                  Avg {money(client.averageCollection)}
                </p>

                <button
                  onClick={() =>
                    navigate(`/erp/ledger-report/${client.ledgerId}`)
                  }
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-xs hover:bg-gray-100"
                >
                  Ledger
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
