import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import CreateLead from "../../components/CreateLead";
import Modal from "../../components/Modal";
import axios from "axios";
import { FiPlus, FiFilter } from "react-icons/fi";
import { NavLink } from "react-router-dom";
axios.defaults.withCredentials = true;

const FilterModal = ({ onClose, onApplyFilter, data }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const handleReset = () => {
    setStatusFilter("all");
    setServiceFilter("all");
    setDistrictFilter("all");
    setStateFilter("all");
    setCityFilter("all");
    setSourceFilter("all");
  };

  const handleApplyFilter = () => {
    onApplyFilter({
      status: statusFilter,
      service: serviceFilter,
      district: districtFilter,
      state: stateFilter,
      city: cityFilter,
      source: sourceFilter,
    });
    onClose();
  };

  return (
    <div>
      <div className="flex flex-col mb-4">
        <label className="text-sm font-semibold mb-2">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="converted">Converted</option>
          <option value="irrelevent">Irrelevant</option>
        </select>
      </div>
      <div className="flex flex-col mb-4">
        <label className="text-sm font-semibold mb-2">Service:</label>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Services</option>
          {[...new Set(data.map((lead) => lead?.requirement?.service))].map(
            (service, index) => (
              <option key={index} value={service}>
                {service}
              </option>
            )
          )}
        </select>
      </div>
      <div className="flex flex-col mb-4">
        <label className="text-sm font-semibold mb-2">City:</label>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Location</option>
          {[...new Set(data.map((lead) => lead?.location?.city))].map(
            (city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            )
          )}
        </select>
      </div>
      <div className="flex flex-col mb-4">
        <label className="text-sm font-semibold mb-2">District:</label>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Location</option>
          {[...new Set(data.map((lead) => lead?.location?.district))].map(
            (district, index) => (
              <option key={index} value={district}>
                {district}
              </option>
            )
          )}
        </select>
      </div>
      <div className="flex flex-col mb-4">
        <label className="text-sm font-semibold mb-2">State:</label>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Location</option>
          {[...new Set(data.map((lead) => lead?.location?.state))].map(
            (state, index) => (
              <option key={index} value={state}>
                {state}
              </option>
            )
          )}
        </select>
      </div>
      <div className="flex flex-col mb-4">
        <label className="text-sm font-semibold mb-2">Source:</label>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Source</option>
          {[...new Set(data.map((lead) => lead?.source))].map(
            (source, index) => (
              <option key={index} value={source}>
                {source}
              </option>
            )
          )}
        </select>
      </div>
      <div className="flex space-x-4">
        <button
          className=" bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
          onClick={handleApplyFilter}
        >
          Apply Filter
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
        >
          Reset
        </button>
        <button
          type="button"
          className=" bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
          onClick={onClose}
        >
          Cancle
        </button>
      </div>
    </div>
  );
};

const Lead = () => {
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddFollowUpModalOpen, setIsAddFollowUpModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    status: "all",
    service: "all",
    city: "all",
    district: "all",
    state: "all",
    source: "all",
  });

  useEffect(() => {
    const fetchLead = async () => {
      const response = await axios.get("/api/v1/lead");
      setLeads(response.data);
      console.log(response.data)
    };
    fetchLead();
  }, []);
useEffect(() => {
  console.log("Applied Filters:", filter);
}, [filter]);

  const handleApplyFilter = (newFilter) => {
    setFilter(newFilter);
  };

  // --- Derived leads list ---

  const normalize = (val) => (val ? val.toString().trim().toLowerCase() : "");

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = normalize(lead.name).includes(normalize(search));

    const statusMatch =
      filter.status === "all" ||
      normalize(lead.status) === normalize(filter.status);

    const serviceMatch =
      filter.service === "all" ||
      normalize(lead.requirement?.service) === normalize(filter.service);

    const cityMatch =
      filter.city === "all" ||
      normalize(lead.location?.city) === normalize(filter.city);

    const districtMatch =
      filter.district === "all" ||
      normalize(lead.location?.district) === normalize(filter.district);

    const stateMatch =
      filter.state === "all" ||
      normalize(lead.location?.state) === normalize(filter.state);

    const sourceMatch =
      filter.source === "all" ||
      normalize(lead.source) === normalize(filter.source);

    return (
      matchesSearch &&
      statusMatch &&
      serviceMatch &&
      cityMatch &&
      districtMatch &&
      stateMatch &&
      sourceMatch
    );
  });

  const handleSubmit = (lead) => {
    if (selectedLead) {
      setLeads((prev) =>
        prev.map((l) => (l._id === selectedLead._id ? lead : l))
      );
      toast.success("Lead updated successfully!");
    } else {
      setLeads((prev) => [...prev, lead]);
      toast.success("Lead added successfully!");
    }
    setSelectedLead(null);
    setIsModalOpen(false);
  };

  return (
    <div className="relative  pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-5 p-2 flex items-center justify-between mb-2">
        <input
          type="text"
          placeholder="Search leads..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="ml-3 p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          <FiFilter className="text-blue-700 text-xl" />
        </button>
      </div>

      {/* Mobile: Card view */}
      <div className="p-2 space-y-3 md:hidden">
        {filteredLeads.map((lead) => (
          <div
            key={lead._id}
            className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-gray-800">{lead.name}</p>
              <p className="text-xs text-gray-500">
                {lead?.requirement?.service}
              </p>
              <p className="text-sm text-gray-600">{lead?.source}</p>
            </div>
            <NavLink
              to={`/crm/lead/${lead._id}`}
              className="text-green-600 text-sm font-medium hover:underline"
            >
              View
            </NavLink>
          </div>
        ))}

        {filteredLeads.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">
            No leads found
          </p>
        )}
      </div>

      {/* Desktop: Table view */}
      <div className="hidden md:block p-4">
        <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Source</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr
                key={lead._id}
                className="border-b last:border-none hover:bg-gray-50"
              >
                <td className="p-3">{lead.name}</td>
                <td className="p-3">{lead?.requirement?.service}</td>
                <td className="p-3">{lead?.location?.city}</td>
                <td className="p-3">{lead.status}</td>
                <td className="p-3">{lead.source}</td>
                <td className="p-3">
                  <NavLink
                    to={`/crm/lead/${lead._id}`}
                    className="text-green-600 text-sm font-medium hover:underline"
                  >
                    View
                  </NavLink>
                </td>
              </tr>
            ))}

            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-6">
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Add button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition"
      >
        <FiPlus className="text-2xl" />
      </button>

      {/* Create Lead Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        head="Create Lead"
      >
        <CreateLead
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          leadData={selectedLead}
        />
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        head="Filter"
      >
        <FilterModal
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilter={handleApplyFilter}
          data={leads}
        />
      </Modal>

      <AddFollowUpModal
        isOpen={isAddFollowUpModalOpen}
        onClose={() => setIsAddFollowUpModalOpen(false)}
        onAddFollowUp={(lead, followUp) => {
          setLeads((prev) =>
            prev.map((l) =>
              l._id === lead._id
                ? { ...l, followUps: [...(l.followUps || []), followUp] }
                : l
            )
          );
          toast.success("Follow-up added!");
        }}
        lead={selectedLead}
      />

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

const AddFollowUpModal = ({ isOpen, onClose, onAddFollowUp, lead }) => {
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  console.log(lead);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newFollowUp = { date, message };
    onAddFollowUp(lead, newFollowUp);
    try {
      const response = await axios.patch(
        `/api/v1/lead/${lead._id}/followUp`,
        newFollowUp
      );
      if (response) {
        console.log(response.data);
      }
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} head="Add Follow-Up">
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold mt-2">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold mt-2">Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4 mt-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200">
              Add Follow-Up
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default Lead;
