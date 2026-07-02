import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const formatMoney = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export default function SiteProfitTable({ data = [], loading = false }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("profit");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredData = useMemo(() => {
    let rows = Array.isArray(data) ? [...data] : [];

    if (search.trim()) {
      const keyword = search.toLowerCase();

      rows = rows.filter((item) =>
        item.siteName?.toLowerCase().includes(keyword),
      );
    }

    rows.sort((a, b) => {
      let x = a?.[sortField];
      let y = b?.[sortField];

      if (typeof x === "string") {
        x = x.toLowerCase();
        y = y.toLowerCase();
      }

      if (x > y) return sortOrder === "asc" ? 1 : -1;
      if (x < y) return sortOrder === "asc" ? -1 : 1;

      return 0;
    });

    return rows;
  }, [data, search, sortField, sortOrder]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, row) => {
        acc.revenue += Number(row.revenue || 0);
        acc.expense += Number(row.expense || 0);
        acc.profit += Number(row.profit || 0);

        return acc;
      },
      {
        revenue: 0,
        expense: 0,
        profit: 0,
      },
    );
  }, [filteredData]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronUpIcon className="w-4 h-4 opacity-20" />;

    return sortOrder === "asc" ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  const openProject = (row) => {
    navigate(`/reports/site-profit/${row.costCenterId}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sticky top-0 bg-white z-20 border-b p-5 ">
        <div>
          <h2 className="text-lg font-semibold">Project Profitability</h2>

          <p className="text-sm text-gray-500 mt-1">
            {filteredData.length} Projects
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Desktop */}

      <div className="hidden lg:block overflow-auto max-h-[70vh]">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b">
              <th
                onClick={() => handleSort("siteName")}
                className="cursor-pointer px-5 py-3 text-left"
              >
                <div className="flex items-center gap-1">
                  Project
                  <SortIcon field="siteName" />
                </div>
              </th>

              <th
                onClick={() => handleSort("revenue")}
                className="cursor-pointer px-5 py-3 text-right"
              >
                <div className="flex justify-end items-center gap-1">
                  Revenue
                  <SortIcon field="revenue" />
                </div>
              </th>

              <th
                onClick={() => handleSort("expense")}
                className="cursor-pointer px-5 py-3 text-right"
              >
                <div className="flex justify-end items-center gap-1">
                  Expense
                  <SortIcon field="expense" />
                </div>
              </th>

              <th
                onClick={() => handleSort("profit")}
                className="cursor-pointer px-5 py-3 text-right"
              >
                <div className="flex justify-end items-center gap-1">
                  Profit
                  <SortIcon field="profit" />
                </div>
              </th>

              <th
                onClick={() => handleSort("margin")}
                className="cursor-pointer px-5 py-3 text-right"
              >
                <div className="flex justify-end items-center gap-1">
                  Margin
                  <SortIcon field="margin" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-500">
                  Loading project profitability...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-500">
                  No projects found.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr
                  key={row.costCenterId}
                  onClick={() => openProject(row)}
                  className="cursor-pointer border-b hover:bg-blue-50 transition-colors"
                >
                  {/* Project */}

                  <td className="px-5 py-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {row.siteName}
                      </h4>

                      {row.siteCode && (
                        <p className="text-xs text-gray-500 mt-1">
                          {row.siteCode}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Revenue */}

                  <td className="px-5 py-4 text-right">
                    <span className="font-medium text-blue-600">
                      {formatMoney(row.revenue)}
                    </span>
                  </td>

                  {/* Expense */}

                  <td className="px-5 py-4 text-right">
                    <span className="font-medium text-orange-600">
                      {formatMoney(row.expense)}
                    </span>
                  </td>

                  {/* Profit */}

                  <td className="px-5 py-4 text-right">
                    <span
                      className={`font-semibold ${
                        row.profit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatMoney(row.profit)}
                    </span>
                  </td>

                  {/* Margin */}

                  <td className="px-5 py-4 text-right">
                    <span
                      className={`font-semibold ${
                        row.margin >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {Number(row.margin || 0).toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          <tfoot className="sticky bottom-0 bg-gray-100 border-t">
            <tr className="font-semibold">
              <td className="px-5 py-4">Total</td>

              <td className="px-5 py-4 text-right text-blue-600">
                {formatMoney(totals.revenue)}
              </td>

              <td className="px-5 py-4 text-right text-orange-600">
                {formatMoney(totals.expense)}
              </td>

              <td
                className={`px-5 py-4 text-right ${
                  totals.profit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatMoney(totals.profit)}
              </td>

              <td
                className={`px-5 py-4 text-right ${
                  totals.revenue > 0
                    ? totals.profit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                    : ""
                }`}
              >
                {totals.revenue > 0
                  ? ((totals.profit / totals.revenue) * 100).toFixed(2)
                  : "0.00"}
                %
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile View */}

      <div className="lg:hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading project profitability...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No projects found.
          </div>
        ) : (
          <div className="divide-y">
            {filteredData.map((row) => (
              <div
                key={row.costCenterId}
                onClick={() => openProject(row)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition"
              >
                {/* Project */}

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {row.siteName}
                  </h3>

                  {row.siteCode && (
                    <p className="text-xs text-gray-500 mt-1">{row.siteCode}</p>
                  )}
                </div>

                {/* Revenue */}

                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Revenue</span>

                  <span className="font-semibold text-blue-600">
                    {formatMoney(row.revenue)}
                  </span>
                </div>

                {/* Expense */}

                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Expense</span>

                  <span className="font-semibold text-orange-600">
                    {formatMoney(row.expense)}
                  </span>
                </div>

                {/* Profit */}

                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Profit</span>

                  <span
                    className={`font-semibold ${
                      row.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatMoney(row.profit)}
                  </span>
                </div>

                {/* Margin */}

                <div className="flex justify-between pt-2">
                  <span className="text-gray-500">Margin</span>

                  <span
                    className={`font-semibold ${
                      row.margin >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Number(row.margin || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
