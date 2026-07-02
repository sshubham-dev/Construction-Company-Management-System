import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaExchangeAlt,
  FaChartLine,
} from "react-icons/fa";

const Card = ({ title, value, subTitle, icon, color, bg }) => {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="mt-2 text-2xl font-bold text-gray-800">{value}</h2>

          {subTitle && <p className="mt-2 text-xs text-gray-500">{subTitle}</p>}
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl ${bg}`}
        >
          <span className={`text-2xl ${color}`}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default function KPICards({ cards }) {
  const format = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Card
        title="Total Collection"
        value={format(cards.totalCollection)}
        subTitle={`${cards.totalTransactions} Collections`}
        icon={<FaMoneyBillWave />}
        color="text-green-600"
        bg="bg-green-100"
      />

      <Card
        title="Average Collection"
        value={format(cards.averageCollection)}
        subTitle="Average Per Entry"
        icon={<FaChartLine />}
        color="text-blue-600"
        bg="bg-blue-100"
      />

      <Card
        title="Approved"
        value={format(cards.approvedAmount)}
        subTitle={`${cards.approvedTransactions} Entries`}
        icon={<FaCheckCircle />}
        color="text-emerald-600"
        bg="bg-emerald-100"
      />

      <Card
        title="Pending"
        value={format(cards.pendingAmount)}
        subTitle={`${cards.pendingTransactions} Entries`}
        icon={<FaClock />}
        color="text-orange-600"
        bg="bg-orange-100"
      />

      <Card
        title="Transactions"
        value={cards.totalTransactions}
        subTitle="Collection Entries"
        icon={<FaExchangeAlt />}
        color="text-purple-600"
        bg="bg-purple-100"
      />
    </div>
  );
}
