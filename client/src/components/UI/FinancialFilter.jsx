import React from "react";
import Select from "react-select";
import { CalendarDaysIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { getDateRange } from "../../helper/dateFormater";

const periodOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "Current Month" },
  { value: "lastMonth", label: "Last Month" },
  // { value: "quarter", label: "This Quarter" },
  { value: "fy", label: "Financial Year" },
  { value: "custom", label: "Custom" },
];

export default function FinancialFilter({ filter, setFilter, onRefresh }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Period */}
        <div className="w-full lg:w-72">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Period
          </label>

          <Select
            options={periodOptions}
            value={periodOptions.find((x) => x.value === filter.period)}
            onChange={(option) => {
              if (option.value === "month") {
                setFilter((prev) => ({
                  ...prev,
                  period: "month",
                }));

                return;
              }

              const range = getDateRange(option.value);

              setFilter((prev) => ({
                ...prev,
                period: option.value,
                fromDate: range.fromDate,
                toDate: range.toDate,
              }));
            }}
          />
        </div>

        {/* Custom Dates */}
        {/* {filter.period === "custom" && ( */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>

            <input
              type="date"
              value={filter.fromDate}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  fromDate: e.target.value,
                }))
              }
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>

            <input
              type="date"
              value={filter.toDate}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  toDate: e.target.value,
                }))
              }
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>
        </div>
        {/* )} */}

        {/* Refresh */}
        {onRefresh && (
          <div className="lg:ml-auto">
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
