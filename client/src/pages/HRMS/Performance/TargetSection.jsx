const TargetSection = ({ targets }) => {
  return (
    <div className="border rounded p-4 space-y-6">
      <h2 className="font-semibold text-lg">Targets</h2>

      {/* ========== SITE WORK TARGETS ========== */}
      {targets.siteWorks?.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Site Work Targets</h3>

          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Work</th>
                <th className="p-2">Deadline</th>
                <th className="p-2">Status</th>
                <th className="p-2">Bonus</th>
              </tr>
            </thead>
            <tbody>
              {targets.siteWorks.map((w, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{w.name}</td>
                  <td className="p-2 text-center">
                    {new Date(w.deadline).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        w.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="p-2 text-center">₹{w.bonus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== REVENUE TARGET ========== */}
      {targets.revenue && (
        <div>
          <h3 className="font-medium mb-2">Revenue Target</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Target Revenue</span>
              <p className="font-medium">₹{targets.revenue.target}</p>
            </div>

            <div>
              <span className="text-gray-500">Achieved Revenue</span>
              <p className="font-medium">₹{targets.revenue.achieved}</p>
            </div>

            <div>
              <span className="text-gray-500">Status</span>
              <p
                className={`font-medium ${
                  targets.revenue.status === "ACHIEVED"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {targets.revenue.status}
              </p>
            </div>

            <div>
              <span className="text-gray-500">Achieved Bonus</span>
              <p className="font-medium">
                ₹{targets.revenue.bonus}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetSection;
