import dayjs from "dayjs";

const Header = ({ data, onRecalculate, onLock }) => {
  const {
    employee,
    role,
    month,
    isLocked,
    trafficLightResult,
    totalBonus,
    generatedAt,
  } = data;

  const colorBadge = {
    GREEN: "bg-green-100 text-green-700",
    AMBER: "bg-yellow-100 text-yellow-700",
    RED: "bg-red-100 text-red-700",
  };

  return (
    <div className="border rounded p-4 bg-white space-y-4">
      {/* TOP ROW */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* LEFT: CONTEXT */}
        <div>
          <h1 className="text-lg md:text-xl font-semibold">
            Monthly Performance
          </h1>

          <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-2">
            <span className="font-medium">
              {employee?.name || "Employee"}
            </span>
            <span>•</span>
            <span>{role}</span>
            <span>•</span>
            <span>{month}</span>
          </div>
        </div>

        {/* RIGHT: STATUS */}
        <div className="flex items-center gap-3">
          {trafficLightResult?.color && (
            <span
              className={`px-3 py-1 text-xs font-semibold rounded ${
                colorBadge[trafficLightResult.color]
              }`}
            >
              {trafficLightResult.color}
            </span>
          )}

          <span
            className={`px-3 py-1 text-xs font-semibold rounded ${
              isLocked
                ? "bg-gray-200 text-gray-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {isLocked ? "LOCKED" : "OPEN"}
          </span>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Completion</div>
          <div className="font-semibold">
            {trafficLightResult?.percentage ?? 0}%
          </div>
        </div>

        <div>
          <div className="text-gray-500">Traffic Bonus</div>
          <div className="font-semibold">
            ₹{trafficLightResult?.bonus ?? 0}
          </div>
        </div>

        <div>
          <div className="text-gray-500">Total Bonus</div>
          <div className="font-semibold">
            ₹{totalBonus ?? 0}
          </div>
        </div>

        <div>
          <div className="text-gray-500">Generated</div>
          <div className="font-semibold">
            {generatedAt
              ? dayjs(generatedAt).format("DD MMM YYYY")
              : "-"}
          </div>
        </div>
      </div>

      {/* ACTION ROW */}
      {!isLocked && (
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
          <button
            onClick={onRecalculate}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            Recalculate
          </button>

          <button
            onClick={onLock}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Lock Month
          </button>
        </div>
      )}

      {/* LOCK WARNING */}
      {isLocked && (
        <div className="text-sm text-red-600 pt-2 border-t">
          This month is locked. No further changes are allowed.
        </div>
      )}
    </div>
  );
};

export default Header;
