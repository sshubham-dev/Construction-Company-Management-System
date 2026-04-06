import { useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import CreateLead from "../../components/CreateLead";
import Modal from "../../components/Modal";
import axios from "axios";
import { FiPlus, FiFilter } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import FollowUpModal from "./components/FollowUpModal.jsx";

axios.defaults.withCredentials = true;

/* ---------------- FILTER MODAL ---------------- */

const FilterModal = ({ onClose, onApplyFilter, data }) => {
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("all");
  const [source, setSource] = useState("all");
  const [state, setState] = useState("all");
  const [district, setDistrict] = useState("all");
  const [city, setCity] = useState("all");

  const years = [
    ...new Set(data.map((l) => new Date(l.createdAt).getFullYear())),
  ].sort((a, b) => b - a);

  const services = [...new Set(data.map((l) => l?.requirement?.service))];
  const sources = [...new Set(data.map((l) => l?.source))];
  const states = [...new Set(data.map((l) => l?.location?.state))];
  const districts = [...new Set(data.map((l) => l?.location?.district))];
  const cities = [...new Set(data.map((l) => l?.location?.city))];

  const handleApply = () => {
    onApplyFilter((prev) => ({
      ...prev,
      month,
      year,
      status,
      service,
      source,
      state,
      district,
      city,
    }));

    onClose();
  };

  const handleReset = () => {
    setMonth("all");
    setYear("all");
    setStatus("all");
    setService("all");
    setSource("all");
    setState("all");
    setDistrict("all");
    setCity("all");

    onApplyFilter({
      month: "all",
      year: "all",
      status: "all",
      service: "all",
      source: "all",
      state: "all",
      district: "all",
      city: "all",
    });

    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Month */}

      <div>
        <label className="text-sm font-semibold">Month</label>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="all">All</option>

          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

      {/* Year */}

      <div>
        <label className="text-sm font-semibold">Year</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="all">All</option>

          {years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Status */}

      <div>
        <label className="text-sm font-semibold">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="converted">Converted</option>
          <option value="closed">Closed</option>
          <option value="irrelevant">Irrelevant</option>
        </select>
      </div>

      {/* Service */}

      <div>
        <label className="text-sm font-semibold">Service</label>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="all">All</option>

          {services.map((s, i) => (
            <option key={i}>{s}</option>
          ))}
        </select>
      </div>

      {/* Source */}

      <div>
        <label className="text-sm font-semibold">Source</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="all">All</option>

          {sources.map((s, i) => (
            <option key={i}>{s}</option>
          ))}
        </select>
      </div>

      {/* State */}

      <div>
        <label className="text-sm font-semibold">State</label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="all">All</option>

          {states.map((s, i) => (
            <option key={i}>{s}</option>
          ))}
        </select>
      </div>

      {/* District */}

      <div>
        <label className="text-sm font-semibold">District</label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="all">All</option>

          {districts.map((d, i) => (
            <option key={i}>{d}</option>
          ))}
        </select>
      </div>

      {/* City */}

      <div>
        <label className="text-sm font-semibold">City</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="all">All</option>

          {cities.map((c, i) => (
            <option key={i}>{c}</option>
          ))}
        </select>
      </div>

      {/* Buttons */}

      <div className="flex gap-3 pt-3">
        <button
          onClick={handleApply}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Apply
        </button>

        <button
          onClick={handleReset}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Reset
        </button>

        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/* ---------------- MAIN PAGE ---------------- */

const Lead = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [leads, setLeads] = useState([]);

  const [filter, setFilter] = useState({
    month: "all",
    year: "all",
    status: "all",
    service: "all",
    source: "all",
    state: "all",
    district: "all",
    city: "all",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddFollowUpModalOpen, setIsAddFollowUpModalOpen] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  /* SEARCH DEBOUNCE */

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  /* FETCH LEADS */

  useEffect(() => {
    const fetchLead = async () => {
      const res = await axios.get("/api/v1/lead");
      setLeads(res.data);
    };
    fetchLead();
  }, []);

  /* FOLLOWUP STATUS */

  const getFollowUpStatus = (lead) => {
    if (!lead.nextFollowUpDate) return null;

    const today = new Date().toISOString().split("T")[0];

    const next = new Date(lead.nextFollowUpDate).toISOString().split("T")[0];

    if (next === today) return "today";
    if (next < today) return "overdue";

    return "upcoming";
  };

  /* ANALYTICS */

  const analytics = useMemo(() => {
    return [
      { type: "all", label: "All", total: leads.length },

      {
        type: "new",
        label: "New",
        total: leads.filter((l) => l.status === "new").length,
      },

      {
        type: "discussion",
        label: "Discussion",
        total: leads.filter((l) => l.status === "discussion").length,
      },

      {
        type: "proposal_sent",
        label: "Proposal",
        total: leads.filter((l) => l.status === "proposal_sent").length,
      },

      {
        type: "converted",
        label: "Converted",
        total: leads.filter((l) => l.status === "converted").length,
      },
    ];
  }, [leads]);

  /* MONTH ANALYTICS */

  const monthAnalytics = useMemo(() => {
    const monthLeads = leads.filter((l) => {
      const d = new Date(l.createdAt);
      return filter.month === "all" || d.getMonth() === Number(filter.month);
    });

    const sourceStats = monthLeads.reduce((acc, lead) => {
      const src = lead.source || "Other";
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {});

    return {
      total: monthLeads.length,
      converted: monthLeads.filter((l) => l.status === "converted").length,
      closed: monthLeads.filter((l) => l.status === "closed").length,
      discussion: monthLeads.filter((l) => l.status === "discussion").length,
      sourceStats,
    };
  }, [leads, filter.month]);

  /* FILTERED LEADS */

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchMatch = lead.name
        ?.toLowerCase()
        .includes(debouncedSearch.toLowerCase());

      const statusMatch =
        filter.status === "all" ||
        (filter.status === "month"
          ? new Date(lead.createdAt).getMonth() === now.getMonth()
          : lead.status === filter.status);

      const monthMatch =
        filter.month === "all" ||
        new Date(lead.createdAt).getMonth() === Number(filter.month);

      const yearMatch =
        filter.year === "all" ||
        new Date(lead.createdAt).getFullYear() === Number(filter.year);

      const serviceMatch =
        filter.service === "all" ||
        lead.requirement?.service === filter.service;

      const sourceMatch =
        filter.source === "all" || lead.source === filter.source;

      const cityMatch =
        filter.city === "all" || lead.location?.city === filter.city;

      const districtMatch =
        filter.district === "all" ||
        lead.location?.district === filter.district;

      const stateMatch =
        filter.state === "all" || lead.location?.state === filter.state;

      return (
        searchMatch &&
        statusMatch &&
        monthMatch &&
        yearMatch &&
        serviceMatch &&
        sourceMatch &&
        cityMatch &&
        districtMatch &&
        stateMatch
      );
    });
  }, [leads, debouncedSearch, filter]);

  /* ---------------- UI ---------------- */

  return (
    <div className="relative pb-20">
      {/* SEARCH */}

      <div className="sticky top-0 p-2 flex gap-2 ">
        <input
          type="text"
          placeholder="Search leads..."
          className="flex-1 border px-3 py-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="py-2 px-3 bg-gray-100 rounded"
        >
          <FiFilter />
        </button>
      </div>

      {/* PIPELINE TABS */}

      <div className="flex gap-2 pl-2 overflow-x-auto py-3">
        {analytics.map((a) => (
          <button
            key={a.type}
            onClick={() => setFilter((prev) => ({ ...prev, status: a.type }))}
            className={`px-2 py-1 text-sm rounded-full border relative
              ${
                filter.status === a.type
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600"
              }
            `}
          >
            {a.label}

            {a.total > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                {a.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* MONTH SUMMARY */}

      <div className="p-2">
        <div className="bg-white p-4 rounded shadow space-y-4">
          <p className="font-semibold text-gray-700">Monthly Lead Summary</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat title="Leads" value={monthAnalytics.total} />

            <Stat title="Discussion" value={monthAnalytics.discussion} />

            <Stat title="Converted" value={monthAnalytics.converted} />

            <Stat title="Closed" value={monthAnalytics.closed} />
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Leads by Source</p>

            {Object.entries(monthAnalytics.sourceStats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([src, count]) => (
                <div key={src} className="flex justify-between text-sm py-1">
                  <span>{src}</span>
                  <span>{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* MOBILE VIEW */}

      <div className="p-2 space-y-3 md:hidden">
        {filteredLeads.map((lead) => {
          const followStatus = getFollowUpStatus(lead);

          return (
            <div
              key={lead._id}
              className={`bg-white rounded-lg shadow p-4
              ${followStatus === "today" ? "border-l-4 border-yellow-400" : ""}
              ${followStatus === "overdue" ? "border-l-4 border-red-400" : ""}
              `}
            >
              <div className="flex justify-between">
                <p className="font-semibold">{lead.name}</p>

                <span
                  className={`text-xs px-2 py-1 rounded
                  ${
                    lead.temperature === "hot"
                      ? "bg-red-100 text-red-600"
                      : lead.temperature === "warm"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                  }
                `}
                >
                  {lead.temperature}
                </span>
              </div>

              <p className="text-xs text-gray-500">
                {lead.requirement?.service}
              </p>

              <p className="text-xs text-gray-600">{lead.location?.city}</p>

              <p className="text-sm text-gray-500 mt-1">
                Lead Added: {new Date(lead.createdAt).toLocaleDateString()}
              </p>

              {lead.nextFollowUpDate && (
                <p className="text-sm text-blue-600 mt-1">
                  Next Follow-up:{" "}
                  {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-3 mt-3">
                <NavLink
                  to={`/crm/lead/${lead._id}`}
                  className="text-green-600 text-sm"
                >
                  View
                </NavLink>

                <button
                  onClick={() => {
                    setSelectedLead(lead);
                    setIsAddFollowUpModalOpen(true);
                  }}
                  className="text-blue-600 text-sm"
                >
                  Follow-up
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE */}

      <div className="hidden md:block p-4">
        <table className="w-full bg-white shadow rounded">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Lead Added</th>
              <th className="p-3 text-left">Next Follow-up</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeads.map((lead) => {
              return (
                <tr key={lead._id} className="border-b">
                  <td className="p-3">{lead.name}</td>
                  <td className="p-3">{lead?.requirement?.service}</td>
                  <td className="p-3">{lead?.location?.city}</td>

                  <td className="p-3">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3 text-sm">
                    {lead.nextFollowUpDate
                      ? new Date(lead.nextFollowUpDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {lead.status}
                    </span>
                  </td>

                  <td className="p-3 flex gap-3">
                    <NavLink
                      to={`/crm/lead/${lead._id}`}
                      className="text-green-600 text-sm"
                    >
                      View
                    </NavLink>

                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsAddFollowUpModalOpen(true);
                      }}
                      className="text-blue-600 text-sm"
                    >
                      Follow-up
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* FLOAT BUTTON */}

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-full"
      >
        <FiPlus />
      </button>

      {/* MODALS */}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        head="Create Lead"
      >
        <CreateLead onClose={() => setIsModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        head="Filter"
      >
        <FilterModal
          data={leads}
          onApplyFilter={setFilter}
          onClose={() => setIsFilterModalOpen(false)}
        />
      </Modal>

      <FollowUpModal
        isOpen={isAddFollowUpModalOpen}
        onClose={() => setIsAddFollowUpModalOpen(false)}
        lead={selectedLead}
      />

      <Toaster />
    </div>
  );
};

/* STAT CARD */

const Stat = ({ title, value }) => (
  <div className="bg-gray-50 p-3 rounded">
    <p className="text-gray-500">{title}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export default Lead;
