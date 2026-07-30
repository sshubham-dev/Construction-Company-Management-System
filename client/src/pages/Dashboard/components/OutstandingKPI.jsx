const OutstandingKPI = ({
  title,
  value,
  color,
  currency = true,
}) => {

  const colors = {
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    blue: "text-blue-600 bg-blue-50",
  };

  return (
    <div
      className={`rounded-xl p-5 ${colors[color]}`}
    >
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className="mt-3 text-2xl font-bold">

        {currency
          ? `₹${Number(value).toLocaleString("en-IN")}`
          : value}

      </h2>

    </div>
  );
};

export default OutstandingKPI;