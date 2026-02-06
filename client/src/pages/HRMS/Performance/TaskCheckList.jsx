const TaskCheckList = ({ tasks, locked, onChange }) => {
  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].enabled = !updated[index].enabled;
    onChange(updated);
  };

  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold mb-2">Task Checklist</h2>

      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Task</th>
            <th className="p-2">Expected</th>
            <th className="p-2">Completed</th>
            <th className="p-2">Enabled</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{t.name}</td>
              <td className="p-2 text-center">{t.expected}</td>
              <td className="p-2 text-center">{t.completed}</td>
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  disabled={locked}
                  checked={t.enabled}
                  onChange={() => toggleTask(i)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskCheckList;
