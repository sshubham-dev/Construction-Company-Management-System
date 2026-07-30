import { Search, RotateCcw, RefreshCw } from "lucide-react";

const PurchaseFilters = ({
  filters,
  setFilters,
  refresh,
  costCenters = [],
}) => {
  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      costCenterId: "",
      fromDate: "",
      toDate: "",
    });
  };

  return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-11 w-full">

        {/* Search */}

        <div className="relative md:col-span-5">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              handleChange("search", e.target.value)
            }
            placeholder="Search Purchase No / Supplier / Invoice"
            className="w-full rounded-lg border py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none"
          />

        </div>

        {/* Status */}

        <select
          value={filters.status}
          onChange={(e) =>
            handleChange("status", e.target.value)
          }
          className="rounded-lg border px-3 py-2 md:col-span-2"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="POSTED">Posted</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="PAID">Paid</option>
        </select>

        {/* Cost Center */}

        <select
          value={filters.costCenterId}
          onChange={(e) =>
            handleChange("costCenterId", e.target.value)
          }
          className="rounded-lg border px-3 py-2 md:col-span-2"
        >
          <option value="">Cost Centers</option>

          {costCenters.map((cc) => (
            <option key={cc._id} value={cc._id}>
              {cc.name}
            </option>
          ))}
        </select>

        {/* Refresh */}

        <button
          onClick={refresh}
          className="flex items-center justify-center rounded-lg border px-4 py-2 bg-white hover:bg-gray-50"
        >
          <RefreshCw size={18} />
        </button>

        {/* Reset */}

        <button
          onClick={resetFilters}
          className="flex items-center justify-center rounded-lg border px-4 py-2 bg-white hover:bg-gray-50"
        >
          <RotateCcw size={18} /> 
        </button>

      </div>
  );
};

export default PurchaseFilters;