// CRM.jsx
import React from "react";
import {
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
  FiBriefcase,
  FiPlus,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiClock,
  FiChevronRight,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";


const StatCard = ({ icon, title, value, delta, deltaColor = "text-green-600" }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between">
      <span className="text-slate-500 text-sm">{title}</span>
      <span className="text-slate-400">{icon}</span>
    </div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
    {delta && <div className={`mt-1 text-xs ${deltaColor}`}>{delta}</div>}
  </div>
);

const Section = ({ title, action }) => (
  <div className="flex items-center justify-between">
    <h3 className="text-slate-800 font-semibold">{title}</h3>
    {action}
  </div>
);

export default function CRM() {
  // --- demo data ---
  const leadTrends = [
    { m: "Jan", v: 40 },
    { m: "Feb", v: 32 },
    { m: "Mar", v: 58 },
    { m: "Apr", v: 45 },
    { m: "May", v: 72 },
    { m: "Jun", v: 53 },
    { m: "Jul", v: 66 },
  ];

  const pipeline = [
    { stage: "Prospects", v: 70 },
    { stage: "Qualified", v: 55 },
    { stage: "Proposal", v: 32 },
    { stage: "Negotiation", v: 22 },
    { stage: "Closed", v: 18 },
  ];

  const sourceBars = [
    { src: "Ads", v: 24 },
    { src: "Website", v: 36 },
    { src: "YouTube", v: 18 },
    { src: "Referral", v: 42 },
  ];

  const tasks = [
    { title: "Contact Brick & Sons", meta: "Lead follow-up", when: "Today, 3:00 PM" },
    { title: "Demo: Green Adobe", meta: "Product walkthrough", when: "Tomorrow, 11:30 AM" },
    { title: "Deal: Plywood Hub", meta: "Send revised quote", when: "Fri, 10:00 AM" },
  ];

  const activity = [
    { who: "Aditi", what: "Added Lead", when: "5m ago" },
    { who: "Karan", what: "Updated Deal", when: "1h ago" },
    { who: "Zara", what: "Logged Call", when: "2h ago" },
  ];

  return (
    <div className="pb-6 space-y-6 p-2">
      {/* Topbar */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Home</h1>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
          <FiPlus /> New
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<FiUsers />}
          title="Total Leads"
          value="120"
          delta="+15% WoW"
        />
        <StatCard
          icon={<FiTrendingUp />}
          title="Conversion"
          value="15%"
          delta="+2% WoW"
        />
        <StatCard
          icon={<FiBriefcase />}
          title="Active Deals"
          value="30"
          delta="+12% WoW"
        />
        <StatCard
          icon={<FiDollarSign />}
          title="Revenue"
          value="$500K"
          delta="+9% QoQ"
        />
      </div>

      {/* Charts & Graphs */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <Section
          title="Lead Trends"
          action={
            <div className="flex gap-1 rounded-lg border border-slate-200 p-1">
              {["Weekly", "Monthly", "Yearly"].map((t, i) => (
                <button
                  key={t}
                  className={`px-2.5 py-1 text-xs rounded-md ${
                    i === 1 ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          }
        />
        <div className="h-44 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={leadTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} hide />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-green-600">Last 12 Months · +12%</div>
      </div>

      {/* Two columns: Pipeline + Lead Sources */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Sales Pipeline */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <Section title="Sales Pipeline Overview" />
          <div className="space-y-3">
            {pipeline.map((p) => (
              <div key={p.stage}>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{p.stage}</span>
                  <span>{p.v}</span>
                </div>
                <div className="h-2 w-full rounded bg-slate-100">
                  <div
                    className="h-2 rounded bg-blue-500"
                    style={{ width: `${Math.min(p.v, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <Section title="Lead Source Distribution" />
          <div className="h-44 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceBars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="src" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} hide />
                <Tooltip />
                <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-green-600">Total Leads · +10%</div>
        </div>
      </div>

      {/* Custom Analytics / Filters */}
      <div className=" border-slate-200 bg-white p-1 space-y-4">
        <Section
          title="Custom Analytics"
          action={
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
                <FiFilter /> Filter
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
                <FiDownload /> Export
              </button>
            </div>
          }
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["YouTube", "Instagram", "LinkedIn", "Website"].map((x, i) => (
            <label
              key={x}
              className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 cursor-pointer"
            >
              <input type="checkbox" defaultChecked={i < 2} />
              <span className="text-sm">{x}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Data actions */}
      <div className="grid sm:grid-cols-2 gap-3">
        <button className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50">
          <div className="text-slate-800 font-medium">Add Lead</div>
          <div className="text-slate-500 text-sm">Create a new lead record</div>
        </button>
        <button className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50">
          <div className="text-slate-800 font-medium">Create Quotation</div>
          <div className="text-slate-500 text-sm">Generate & send a quote</div>
        </button>
      </div>

      {/* Upcoming tasks / follow-ups */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <Section title="Upcoming Tasks & Follow-ups" />
        <ul className="mt-3 divide-y">
          {tasks.map((t, i) => (
            <li key={i} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">{t.title}</div>
                <div className="text-xs text-slate-500">{t.meta}</div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <FiCalendar />
                <span>{t.when}</span>
                <FiChevronRight />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Latest Activity */}
      <div className="border-slate-200 bg-white">
        <Section title="Latest Activity" />
        <ul className="mt-3 space-y-2">
          {activity.map((a, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <div className="font-medium text-slate-800">{a.who}</div>
                <div className="text-xs text-slate-500">{a.what}</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <FiClock /> {a.when}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
