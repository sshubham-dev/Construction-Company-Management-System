const StatCard = ({ title, value, color = "text-gray-800" }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500">{title}</p>
      <p className={`text-xl font-semibold mt-1 ${color}`}>
        {value}
      </p>
    </div>
  );
};

export default StatCard;