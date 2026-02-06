const MetricsSection = ({ metrics }) => {
  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold text-lg mb-3">Performance Metrics</h2>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-gray-500">Tasks Expected</p>
          <p className="text-xl font-semibold">
            {metrics.expected}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <p className="text-gray-500">Tasks Completed</p>
          <p className="text-xl font-semibold">
            {metrics.completed}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <p className="text-gray-500">Completion %</p>
          <p className="text-xl font-semibold">
            {metrics.percentage}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricsSection;
