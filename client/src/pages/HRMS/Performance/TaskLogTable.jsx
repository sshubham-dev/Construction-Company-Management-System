const TaskLogTable = () => {
  const logs = [
    {
      employee: "Shubham Kumar",
      date: "2025-01-15",
      task: "Site Inspection",
      status: "Done",
      remark: "",
    },
    {
      employee: "Shubham Kumar",
      date: "2025-01-15",
      task: "Drawing Submission",
      status: "Pending",
      remark: "Client feedback awaited",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Task Logs</h2>

      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3">Date</th>
              <th className="p-3">Task</th>
              <th className="p-3">Status</th>
              <th className="p-3">Remark</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{l.employee}</td>
                <td className="p-3 text-center">{l.date}</td>
                <td className="p-3">{l.task}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      l.status === "Done"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="p-3">{l.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskLogTable;
