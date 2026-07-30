import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

const COLORS = {
  receivable: "#16a34a",
  payable: "#dc2626",
  client: "#2563eb",
  supplier: "#7c3aed",
  contractor: "#f97316",
  employee: "#14b8a6",
};

const formatAmount = (value) => {
  if (!value) return "₹0";

  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;

  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;

  return `₹${Number(value).toLocaleString("en-IN")}`;
};

const Card = ({ title, children }) => (
  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <h3 className="mb-5 text-lg font-semibold text-gray-800">{title}</h3>

    {children}
  </div>
);

const OutstandingCharts = ({ charts }) => {
  if (!charts) return null;

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {/* Outstanding By Party */}

      <Card title="Outstanding by Party">
        <ResponsiveContainer
          width="100%"
          height={300}
          style={{ margin: "auto", overflow: "hidden" }}
        >
          <BarChart
            layout="vertical"
            data={charts.partyWise}
            responsive
            margin={{
              top: 10,
              right: 10,
              left: 25,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis type="number" tickFormatter={formatAmount} />
            <YAxis dataKey="party" type="category" />

            <Tooltip formatter={(v) => formatAmount(v)} />

            <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
              {charts.partyWise.map((row, index) => (
                <Cell
                  key={index}
                  fill={COLORS[row.party.toLowerCase()] || "#3b82f6"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Receivable vs Payable */}

      <Card title="Receivable vs Payable">
        <ResponsiveContainer
          width="100%"
          height={300}
          style={{ margin: "auto", overflow: "hidden" }}
        >
          <BarChart
            data={charts.balanceSummary}
            responsive
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis tickFormatter={formatAmount} />

            <Tooltip formatter={(v) => formatAmount(v)} />

            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              <Cell fill={COLORS.receivable} />
              <Cell fill={COLORS.payable} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly Trend */}

      <Card title="Outstanding Trend">
        <ResponsiveContainer
          width="100%"
          height={300}
          style={{ margin: "auto", overflow: "hidden" }}
        >
          <LineChart
            data={charts.monthlyTrend}
            responsive
            margin={{
              top: 10,
              right: 10,
              left: 15,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis tickFormatter={formatAmount} />

            <Tooltip formatter={(v) => formatAmount(v)} />

            <Legend />

            <Line
              type="monotone"
              dataKey="receivable"
              stroke={COLORS.receivable}
              strokeWidth={3}
              dot={{ r: 4 }}
            />

            <Line
              type="monotone"
              dataKey="payable"
              stroke={COLORS.payable}
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default OutstandingCharts;
