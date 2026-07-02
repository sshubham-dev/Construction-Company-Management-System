import React from "react";
import {
  getCurrentMonth,
  getCurrentYear,
  getLastMonth,
} from "../../../helper/dateFormater";

const DashboardFilter = ({ filters, setFilters }) => {
  const today = new Date();

  const currentMonth = getCurrentMonth;

  const lastMonth = getLastMonth;

  const currentYear = getCurrentYear;

  const update = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Collection Dashboard</h2>

          <p className="text-sm text-gray-500">
            Department-wise collection analytics
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters(currentMonth())}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
          >
            Current Month
          </button>

          <button
            onClick={() => setFilters(lastMonth())}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
          >
            Last Month
          </button>

          <button
            onClick={() => setFilters(currentYear())}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
          >
            Current Year
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-500">From Date</label>

          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => update("fromDate", e.target.value)}
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-500">To Date</label>

          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => update("toDate", e.target.value)}
            className="w-full rounded-lg border p-2"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardFilter;
