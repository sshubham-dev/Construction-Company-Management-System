const PurchaseSkeleton = ({ rows = 6 }) => {
  return (
    <>
      {/* Mobile Skeleton */}
      <div className="space-y-4 md:hidden">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-gray-200"></div>
                <div className="h-3 w-28 rounded bg-gray-200"></div>
              </div>

              <div className="h-6 w-20 rounded-full bg-gray-200"></div>
            </div>

            <div className="space-y-3">
              <div className="h-3 w-full rounded bg-gray-200"></div>
              <div className="h-3 w-4/5 rounded bg-gray-200"></div>
              <div className="h-5 w-32 rounded bg-gray-300"></div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 border-t pt-4">
              <div className="h-10 rounded bg-gray-200"></div>
              <div className="h-10 rounded bg-gray-200"></div>
              <div className="h-10 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Skeleton */}

      <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm md:block">
        <table className="min-w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              {Array.from({ length: 7 }).map((_, index) => (
                <th key={index} className="px-4 py-4">
                  <div className="mx-auto h-4 w-20 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, row) => (
              <tr key={row} className="border-b animate-pulse">
                {Array.from({ length: 7 }).map((_, col) => (
                  <td key={col} className="px-4 py-4">
                    <div className="h-4 rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PurchaseSkeleton;