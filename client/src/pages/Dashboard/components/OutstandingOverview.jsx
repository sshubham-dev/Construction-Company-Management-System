import { Link } from "react-router-dom";
import OutstandingKPI from "./OutstandingKPI";
import BreakdownCard from "./BreakdownCard";
import TopOutstanding from "./TopOutstanding";
import { useState } from "react";

const data = {
  summary: {
    receivable: 5240000,
    payable: 3120000,
    workingCapitalGap: 2120000,
    coverage: 168,
  },

  receivable: {
    client: 5000000,
    supplier: 0,
    contractor: 0,
    employee: 240000,
  },

  payable: {
    supplier: 1800000,
    contractor: 900000,
    employee: 300000,
    client: 120000,
  },

  topReceivable: [
    {
      name: "ABC Client",
      amount: 850000,
    },
  ],

  topPayable: [
    {
      name: "UltraTech",
      amount: 1250000,
    },
  ],
};

const OutstandingOverview = () => {
    const [outstandingData, setOutstandingData] = useState(data);

  return (
    <div className="">

      {/* Header */}

      <div className="flex items-center justify-between border-t rounded-lg shadow-sm bg-white border-b px-6 py-5">

        <div>

          <h2 className="text-xl font-semibold">
            Receivables & Payables
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Financial obligations overview
          </p>

        </div>

        <Link
          to="/erp/outstanding"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
           Report →
        </Link>

      </div>

      {/* KPI */}

      <div className="grid gap-4 my-4 md:grid-cols-2 xl:grid-cols-4">

        <OutstandingKPI
          title="Receivable"
          value={outstandingData.summary.receivable}
          color="green"
        />

        <OutstandingKPI
          title="Payable"
          value={outstandingData.summary.payable}
          color="red"
        />

        <OutstandingKPI
          title="Working Capital Gap"
          value={outstandingData.summary.workingCapitalGap}
          color={
            outstandingData.summary.workingCapitalGap >= 0
              ? "green"
              : "red"
          }
        />

        <OutstandingKPI
          title="Coverage"
          value={`${outstandingData.summary.coverage}%`}
          color="blue"
          currency={false}
        />

      </div>

      {/* Breakdown */}

      <div className="grid gap-5 border-t border-black px-2 py-5 lg:grid-cols-2">

        <BreakdownCard
          title="Receivable Breakdown"
          data={outstandingData.receivable}
          color="green"
        />

        <BreakdownCard
          title="Payable Breakdown"
          data={outstandingData.payable}
          color="red"
        />

      </div>

      {/* Top */}

      <div className="grid gap-5 border-y border-black px-2 py-6 lg:grid-cols-2">

        <TopOutstanding
          title="Top Receivables"
          rows={outstandingData.topReceivable}
          color="green"
        />

        <TopOutstanding
          title="Top Payables"
          rows={outstandingData.topPayable}
          color="red"
        />

      </div>

    </div>
  );
};

export default OutstandingOverview;