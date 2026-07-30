import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiPieChart,
} from "react-icons/fi";

const formatAmount = (amount = 0) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;

  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;

  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const PartyItem = ({ row, color }) => (
  <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
    <div>
      <p className="font-medium text-gray-800">{row.name}</p>

      <p className="text-xs text-gray-500">{row.partyType}</p>
    </div>

    <div
      className={`font-semibold ${
        color === "green" ? "text-green-600" : "text-red-600"
      }`}
    >
      {formatAmount(row.amount)}
    </div>
  </div>
);

const InfoRow = ({ icon, title, value, subtitle }) => (
  <div className="flex items-start gap-3 rounded-lg border p-4">
    <div className="rounded-lg bg-gray-100 p-2">{icon}</div>

    <div>
      <p className="text-sm text-gray-500">{title}</p>

      <h4 className="mt-1 font-semibold text-gray-800">{value}</h4>

      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const OutstandingAnalytics = ({
  topReceivable = [],
  topPayable = [],
  insights = {},
}) => {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between border-b p-6">
        <div>
          <h2 className="text-xl font-semibold">Outstanding Analytics</h2>

          <p className="mt-1 text-sm text-gray-500">
            Highest balances and financial insights
          </p>
        </div>

        {/* <Link
          to="/reports/outstanding"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          View Full Report
          <FiArrowRight />
        </Link> */}
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-2">
        {/* LEFT */}

        <div className="space-y-6">
          <div>
            <h3 className="mb-4 font-semibold text-green-700">
              Top Receivables
            </h3>

            <div className="space-y-3">
              {topReceivable.length ? (
                topReceivable
                  .slice(0, 5)
                  .map((party) => (
                    <PartyItem key={party.ledgerId} row={party} color="green" />
                  ))
              ) : (
                <p className="text-sm text-gray-500">No receivables found.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-red-700">Top Payables</h3>

            <div className="space-y-3">
              {topPayable.length ? (
                topPayable
                  .slice(0, 5)
                  .map((party) => (
                    <PartyItem key={party.ledgerId} row={party} color="red" />
                  ))
              ) : (
                <p className="text-sm text-gray-500">No payables found.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div>
          <h3 className="mb-4 font-semibold">Financial Insights</h3>

          <div className="space-y-4">
            <InfoRow
              icon={<FiTrendingUp className="text-green-600" />}
              title="Largest Receivable"
              value={insights.largestReceivableParty}
              subtitle={formatAmount(insights.largestReceivable)}
            />

            <InfoRow
              icon={<FiTrendingDown className="text-red-600" />}
              title="Largest Payable"
              value={insights.largestPayableParty}
              subtitle={formatAmount(insights.largestPayable)}
            />

            <InfoRow
              icon={<FiPieChart className="text-blue-600" />}
              title="Receivable Coverage"
              value={`${insights.coverage || 0}%`}
              subtitle="Receivable ÷ Payable"
            />

            <InfoRow
              icon={<FiAlertCircle className="text-amber-600" />}
              title="Action Required"
              value={`${insights.highReceivableCount || 0} High Receivables`}
              subtitle={`${insights.highPayableCount || 0} High Payables`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutstandingAnalytics;
