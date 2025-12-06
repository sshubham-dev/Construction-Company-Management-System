export default function Performance({bonus, trafficLight, revenue}) {
  return (
    <div className=" py-4 ">
      <h2 className="font-bold text-lg mb-4 text-gray-700">Performance</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Bonus */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Bonus Achieved
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {bonus ? `₹${bonus}` : "N/A"}
          </p>
        </div>

        {/* Traffic Light Indicator */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Traffic Light %
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white" style={{ color: `${trafficLight < 60 ? "red" : trafficLight < 80 ? "green" : "yellow"}` }}>
            {trafficLight ? `${trafficLight}%` : "N/A"}
          </p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Total Monthly Revenue
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {revenue ? `₹${revenue}` : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
