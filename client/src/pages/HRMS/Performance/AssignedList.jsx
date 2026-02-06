const AssignedList = ({ assignments }) => {
  return (
    <div className="border rounded overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Employee</th>
            <th className="p-3 text-left">Template</th>
            <th className="p-3 text-center">Start Month</th>
            <th className="p-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-3">{a.employeeName}</td>
              <td className="p-3">{a.templateName}</td>
              <td className="p-3 text-center">{a.startMonth}</td>
              <td className="p-3 text-center">
                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                  {a.status}
                </span>
              </td>
            </tr>
          ))}

          {assignments.length === 0 && (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No traffic light assigned yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssignedList;
