const TasksSection = ({ tasks }) => (
  <div className="space-y-4">
    <h2 className="font-semibold">Tasks</h2>

    {tasks.map((t, i) => (
      <div
        key={i}
        className="border rounded p-4 flex justify-between"
      >
        <div>
          <div className="font-medium">{t.name}</div>
          <div className="text-xs text-gray-600">
            {t.frequency}
          </div>
        </div>
        <div className="text-sm">
          {t.completedCount}/{t.expectedCount} •{" "}
          {t.status}
        </div>
      </div>
    ))}
  </div>
);

export default TasksSection;
