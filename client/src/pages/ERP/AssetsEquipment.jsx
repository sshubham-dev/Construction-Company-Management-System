import React from "react";
import { ChevronRight } from "lucide-react";

export default function AssetsEquipment() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Assets & Equipment</h1>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white">
          +
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Assets</p>
          <p className="text-2xl font-bold">125</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Under Maintenance</p>
          <p className="text-2xl font-bold">15</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <p className="text-sm text-gray-500">Depreciation Value</p>
        <p className="text-2xl font-bold text-gray-800">$250,000</p>
      </div>

      {/* Category Distribution */}
      <div className="mb-6">
        <h2 className="text-md font-semibold mb-3">Asset Category Distribution</h2>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-blue-600">Heavy Equipment</p>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 w-1/4 bg-blue-400 rounded"></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-600">Vehicles</p>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 w-1/5 bg-blue-400 rounded"></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-600">Tools</p>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 w-2/5 bg-blue-400 rounded"></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-600">Safety Gear</p>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 w-3/4 bg-blue-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance History */}
      <div className="mb-6">
        <h2 className="text-md font-semibold mb-3">Maintenance History</h2>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          {/* Chart Placeholder */}
          <div className="h-40 flex items-center justify-center text-gray-400">
            [Maintenance Chart Here]
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-medium">
          Add Asset
        </button>
        <button className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium">
          Schedule Maintenance
        </button>
      </div>
    </div>
  );
}
