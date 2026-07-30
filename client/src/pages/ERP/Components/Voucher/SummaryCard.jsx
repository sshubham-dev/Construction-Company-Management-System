import {
  FiDollarSign,
  FiCheckCircle,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";

const formatCurrency = (amount = 0) =>
  `₹ ${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function SummaryCard({ voucher, entries = [] }) {
  const totalDebit = entries
    .filter((e) => e.type === "DEBIT")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const totalCredit = entries
    .filter((e) => e.type === "CREDIT")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const balanced = totalDebit === totalCredit;

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Header */}

      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Voucher Summary</h2>
      </div>

      {/* Cards */}

      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Card
          icon={<FiDollarSign />}
          title="Total Debit"
          value={formatCurrency(totalDebit)}
          color="blue"
        />

        <Card
          icon={<FiDollarSign />}
          title="Total Credit"
          value={formatCurrency(totalCredit)}
          color="green"
        />

        <Card
          icon={balanced ? <FiCheckCircle /> : <FiAlertCircle />}
          title="Voucher Status"
          value={balanced ? "Balanced" : "Mismatch"}
          color={balanced ? "green" : "red"}
        />

        <Card
          icon={<FiFileText />}
          title="Voucher Status"
          value={voucher?.status}
          color="yellow"
        />
      </div>

      {/* Narration */}

      <div className="border-t p-5">
        <h4 className="mb-2 font-medium">Narration</h4>

        <div className="rounded-lg bg-slate-50 p-4 text-sm text-gray-700">
          {voucher?.narration || "No narration added."}
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, value, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",

    green: "bg-green-100 text-green-700",

    red: "bg-red-100 text-red-700",

    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="rounded-xl border p-4">
      <div className={`inline-flex rounded-lg p-3 ${colors[color]}`}>
        {icon}
      </div>

      <p className="mt-3 text-sm text-gray-500">{title}</p>

      <h3 className="mt-1 text-xl font-bold">{value}</h3>
    </div>
  );
}
