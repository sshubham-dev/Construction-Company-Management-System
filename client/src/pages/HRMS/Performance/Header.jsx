const Header = ({
  employee,
  role,
  month,
  locked,
  onLock,
  onRecalculate,
}) => {
  return (
    <div className="border rounded p-4 bg-white">
      <div className="flex justify-between items-start">
        {/* LEFT: CONTEXT */}
        <div>
          <h1 className="text-xl font-semibold">
            Monthly Performance
          </h1>

          <div className="mt-1 text-sm text-gray-600">
            <span className="font-medium">{employee}</span>
            <span className="mx-2">•</span>
            <span>{role}</span>
            <span className="mx-2">•</span>
            <span>{month}</span>
          </div>
        </div>

        {/* RIGHT: STATUS + ACTIONS */}
        <div className="flex items-center gap-3">
          {/* STATUS */}
          <span
            className={`px-3 py-1 text-xs font-semibold rounded ${
              locked
                ? "bg-gray-200 text-gray-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {locked ? "LOCKED" : "OPEN"}
          </span>

          {/* ACTIONS */}
          {!locked && (
            <>
              <button
                onClick={onRecalculate}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                Recalculate
              </button>

              <button
                onClick={onLock}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Lock Month
              </button>
            </>
          )}
        </div>
      </div>

      {/* WARNING WHEN LOCKED */}
      {locked && (
        <div className="mt-3 text-sm text-red-600">
          This month is locked. No further changes are allowed.
        </div>
      )}
    </div>
  );
};

export default Header;
