const MetricsSection = ({ metrics }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="border p-4 rounded">
      Completion %
      <div className="text-xl font-semibold">
        {metrics.completionPercentage}%
      </div>
    </div>
    <div className="border p-4 rounded">
      Total Tasks
      <div className="text-xl font-semibold">
        {metrics.totalTasks}
      </div>
    </div>
  </div>
);

export default MetricsSection;
