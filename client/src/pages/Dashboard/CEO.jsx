import Layout from "./Layout";
import Attendance from "../../components/UI/Attendance";
import ProfileCard from "../../components/UI/ProfileCard";
import Approvals from "../../components/UI/Approvals";
import { useState } from "react";
import { useMemo, useEffect } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiChevronRight,
  FiX
} from "react-icons/fi";
import KPI from "../../components/UI/KPI";
import ProgressBar from "../../components/UI/ProgressBar";
import RevenueBar from "../../components/UI/RevenueBar";
import ProfitLine from "../../components/UI/ProfitLine";
import ProjectProfitabilityBar from "../../components/UI/ProjectProfitabilityBar";
import Section from "../../components/UI/Section";
import Schedule from "../../components/UI/Schedule";
import ProjectProgress from "../../components/UI/ProjectProgress";
import axios from "axios";
import EmployeeAttendance from "../../components/UI/EmployeeAttendance";

export default function CEO() {
  const [showApprovals, setShowApprovals] = useState(false);
  const approvals = [];

  const revenue = useMemo(
    () => [
      { m: "Jan", value: 80 },
      { m: "Feb", value: 95 },
      { m: "Mar", value: 110 },
      { m: "Apr", value: 90 },
      { m: "May", value: 115 },
    ],
    []
  );
  const profit = useMemo(
    () => [
      { m: "Jan", value: 12 },
      { m: "Feb", value: 14 },
      { m: "Mar", value: 9 },
      { m: "Apr", value: 16 },
      { m: "May", value: 18 },
    ],
    []
  );
  const profitability = useMemo(
    () => [
      { name: "Project A", value: 72 },
      { name: "Project B", value: 58 },
      { name: "Project C", value: 35 },
    ],
    []
  );

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <div className="mx-auto max-w-6xl py-4 lg:py-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Main Attendance Section */}
              <EmployeeAttendance/>

            <Schedule />
            <ProjectProgress />

            {/* Monthly Revenue */}
            <Section
              title="Monthly Revenue"
              className="md:col-span-1 lg:col-span-2"
            >
              <div className="grid sm:grid-cols-3 gap-4 items-start">
                <KPI
                  label="Revenue"
                  value="$120,000"
                  sub="This Month +15%"
                  positive
                />
                <div className="sm:col-span-2">
                  <RevenueBar data={revenue} />
                </div>
              </div>
            </Section>

            {/* Profit */}
            <Section title="Profit" className="lg:col-span-3">
              <div className="grid sm:grid-cols-3 gap-4 items-start">
                <KPI
                  label="Profit"
                  value="$30,000"
                  sub="This Month +10%"
                  positive
                />
                <div className="sm:col-span-2">
                  <ProfitLine data={profit} />
                </div>
              </div>
            </Section>

            {/* Expenses / Dues / Other Income */}
            <Section title="Financials" className="lg:col-span-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <KPI label="Marketing" value="$4,000" />
                <KPI label="Office Expenses" value="$2,000" />
                <KPI label="Investment" value="$15,000" />
                <KPI label="Balance" value="$50,000" />
                <KPI label="Other Income" value="$5,000" />
                <KPI label="Supplier Dues" value="$10,000" positive={false} />
              </div>
            </Section>

            {/* Site Status */}
            <Section title="Site Status">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span>Milestone Tracking</span>
                    <span>75% Achieved</span>
                  </div>
                  <ProgressBar value={75} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span>Project Completion</span>
                    <span>60% Complete</span>
                  </div>
                  <ProgressBar value={60} />
                </div>
              </div>
            </Section>

            {/* Project Profitability */}
            <Section title="Project Profitability" className="lg:col-span-2">
              <div className="grid sm:grid-cols-3 gap-4 items-start">
                <KPI
                  label="Net Profit"
                  value="$15,000"
                  sub="This Month +5%"
                  positive
                />
                <div className="sm:col-span-2">
                  <ProjectProfitabilityBar data={profitability} />
                </div>
              </div>
            </Section>

            {/* Quality */}
            {/* <Section title="Quality">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-600" />
                  <div>
                    <div className="text-sm font-medium">
                      Checklist Approvals
                    </div>
                    <div className="text-xs text-gray-500">90</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FiXCircle className="text-rose-600" />
                  <div>
                    <div className="text-sm font-medium">
                      Checklist Rejections
                    </div>
                    <div className="text-xs text-gray-500">10</div>
                  </div>
                </div>
              </div>
            </Section> */}

            {/* Design */}
            <Section title="Design" className="lg:col-span-2">
              <div className="grid sm:grid-cols-3 gap-4 items-start">
                <KPI
                  label="Design Revenue"
                  value="$20,000"
                  sub="This Month +8%"
                  positive
                />
                <div className="sm:col-span-2 space-y-3">
                  {[
                    { name: "Liam Harper", v: 70 },
                    { name: "Ava Carter", v: 55 },
                    { name: "Noah Bennett", v: 40 },
                  ].map((x) => (
                    <div key={x.name}>
                      <div className="text-xs mb-1">{x.name}</div>
                      <ProgressBar value={x.v} />
                    </div>
                  ))}
                  <div className="text-xs text-gray-500 mt-1">
                    Total Design Revenue: $20,000
                  </div>
                </div>
              </div>
            </Section>

            {/* Store */}
            <Section title="Store">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <KPI label="Stock Value" value="$30,000" />
                <div className="text-xs">
                  <div className="font-medium">Monthly Transactions</div>
                  <div className="text-gray-500">
                    Sales: $10,000, Purchases: $5,000
                  </div>
                </div>
                <KPI label="Profitability" value="$5,000" />
                <div className="text-xs sm:col-span-2">
                  <div className="font-medium">Capital Management</div>
                  <div className="text-gray-500">
                    Invested: $20,000, Losses: $2,000
                  </div>
                </div>
              </div>
            </Section>

            {/* Marketing */}
            <Section title="Marketing" className="lg:col-span-3">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-medium mb-1">
                    Lead Generation
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    50 New Leads
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium mb-1">
                    Client Engagement
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    Office Visits: 10, Confirmations: 5
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
