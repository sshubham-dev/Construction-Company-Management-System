const BreakdownCard = ({
  title,
  data,
  color,
}) => {

  return (

    <div>

      <h3 className="mb-4 text-lg font-semibold">
        {title}
      </h3>

      <div className="space-y-3">

        {Object.entries(data).map(([key, value]) => (

          <div
            key={key}
            className="flex items-center justify-between"
          >

            <span className="capitalize text-gray-600">
              {key}
            </span>

            <span
              className={`font-semibold ${
                color === "green"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹{Number(value).toLocaleString("en-IN")}
            </span>

          </div>

        ))}

      </div>

    </div>

  );
};

export default BreakdownCard;