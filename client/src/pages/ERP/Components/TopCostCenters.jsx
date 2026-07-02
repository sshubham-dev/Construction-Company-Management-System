import { FaMedal } from "react-icons/fa";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const badgeColor = {
  Design: "bg-blue-100 text-blue-700",

  Construction: "bg-green-100 text-green-700",

  Interior: "bg-orange-100 text-orange-700",
};

export default function TopCostCenters({ data = [] }) {
  const max = Math.max(...data.map((x) => x.amount), 1);
  const rank = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="text-lg font-semibold">Top Performing Services</h2>

        <p className="text-sm text-gray-500">Ranked by collection amount</p>
      </div>

      <div className="divide-y">
        {data.map((item, index) => (
          <div
            key={item.costCenterId}
            className="p-4 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-100">
                  <FaMedal className="text-yellow-600" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {rank(index)} {item.name}
                    </h3>

                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        badgeColor[item.department] || "bg-gray-100"
                      }`}
                    >
                      {item.department}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    {item.transactions} Collections
                  </p>
                </div>
              </div>

              <div className="text-right">
                <h3 className="font-bold text-green-700">
                  {money(item.amount)}
                </h3>

                <p className="text-xs text-gray-500">
                  Avg{" "}
                  {money(
                    item.transactions ? item.amount / item.transactions : 0,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-indigo-600"
                  style={{
                    width: `${(item.amount / max) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
