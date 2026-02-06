const getColorStyle = (color) => {
  if (color === "GREEN") return "bg-green-100 text-green-700";
  if (color === "AMBER") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const TrafficLightSection = ({ traffic }) => {
  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold text-lg mb-3">
        Traffic Light Result
      </h2>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Status</p>
          <span
            className={`inline-block mt-1 px-4 py-2 rounded font-semibold ${getColorStyle(
              traffic.color
            )}`}
          >
            {traffic.color}
          </span>
        </div>

        <div className="text-right">
          <p className="text-gray-500 text-sm">Traffic Bonus</p>
          <p className="text-xl font-semibold">
            ₹{traffic.bonus}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrafficLightSection;
