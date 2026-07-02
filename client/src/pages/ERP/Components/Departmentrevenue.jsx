import { useState } from "react";
import { FaChevronDown, FaChevronRight, FaBuilding } from "react-icons/fa";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function DepartmentRevenue({ data = [] }) {
  const [open, setOpen] = useState({});

  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="text-lg font-semibold">Department Revenue</h2>

        <p className="text-sm text-gray-500">
          Revenue contribution by department
        </p>
      </div>

      <div className="divide-y">
        {data.map((dept) => (
          <div key={dept.departmentId}>
            {/* Department */}

            <button
              onClick={() =>
                setOpen((prev) => ({
                  ...prev,
                  [dept.departmentId]: !prev[dept.departmentId],
                }))
              }
              className="w-full p-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="mt-1 rounded-lg bg-blue-100 p-3 text-blue-600">
                    <FaBuilding />
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{dept.name}</h3>

                      {open[dept.departmentId] ? (
                        <FaChevronDown className="text-xs" />
                      ) : (
                        <FaChevronRight className="text-xs" />
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {dept.transactions} Collections
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="font-bold text-green-700">
                    {money(dept.amount)}
                  </h3>

                  <p className="text-xs text-gray-500">
                    Avg {money(dept.averageCollection)}
                  </p>
                </div>
              </div>

              {/* Progress */}

              <div className="mt-4">
                <div className="flex justify-between text-xs">
                  <span>{dept.percentage}%</span>

                  <span>{money(dept.amount)}</span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${(dept.amount / max) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </button>

            {/* Services */}

            {open[dept.departmentId] && (
              <div className="space-y-2 bg-gray-50 p-4">
                {dept.services.map((service) => (
                  <div
                    key={service.costCenterId}
                    className="rounded-xl border bg-white p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>

                        <p className="text-xs text-gray-500">
                          {service.transactions} Collections
                        </p>
                      </div>

                      <div className="text-right">
                        <h4 className="font-semibold text-green-600">
                          {money(service.amount)}
                        </h4>

                        <p className="text-xs text-gray-500">
                          Avg{" "}
                          {money(
                            service.transactions
                              ? service.amount / service.transactions
                              : 0,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
