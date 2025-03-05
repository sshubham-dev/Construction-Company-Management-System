import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Header from "../../components/Header";
import CreateLead from "../../components/CreateLead";
import Modal from "../../components/Modal";

const sampleLeads = [
  {
    name: "John Doe",
    contact: {
      phoneNo: "123-456-7890",
      whatsapp: "123-456-7890",
      email: "john.doe@example.com",
    },
    location: {
      address: "123 Main St",
      city: "Springfield",
      district: "Downtown",
      state: "IL",
    },
    status: "active",
    requirement: {
      service: "Web Development",
      message: "Looking for a new website for my business.",
    },
    followUps: [
      {
        followUpNo: "1",
        date: new Date("2023-10-01"),
        message: "Initial contact made.",
      },
      {
        followUpNo: "2",
        date: new Date("2023-10-05"),
        message: "Sent proposal.",
      },
    ],
    source: "Website",
    contactAgent: "60d5ec49f1a2b8b1f8c8e4e1", // Example ObjectId
  },
  {
    name: "Jane Smith",
    contact: {
      phoneNo: "987-654-3210",
      whatsapp: "987-654-3210",
      email: "jane.smith@example.com",
    },
    location: {
      address: "456 Elm St",
      city: "Metropolis",
      district: "Uptown",
      state: "NY",
    },
    status: "converted",
    requirement: {
      service: "SEO Services",
      message: "Need help improving my website's SEO.",
    },
    followUps: [
      {
        followUpNo: "1",
        date: new Date("2023-09-15"),
        message: "Discussed SEO needs.",
      },
    ],
    source: "Referral",
    contactAgent: "60d5ec49f1a2b8b1f8c8e4e2", // Example ObjectId
  },
  {
    name: "Alice Johnson",
    contact: {
      phoneNo: "555-123-4567",
      whatsapp: "555-123-4567",
      email: "alice.johnson@example.com",
    },
    location: {
      address: "789 Oak St",
      city: "Gotham",
      district: "Central",
      state: "NJ",
    },
    status: "closed",
    requirement: {
      service: "Graphic Design",
      message: "Looking for a logo design.",
    },
    followUps: [],
    source: "Social Media",
    contactAgent: "60d5ec49f1a2b8b1f8c8e4e3", // Example ObjectId
  },
  {
    name: "Bob Brown",
    contact: {
      phoneNo: "321-654-0987",
      whatsapp: "321-654-0987",
      email: "bob.brown@example.com",
    },
    location: {
      address: "321 Pine St",
      city: "Star City",
      district: "West End",
      state: "CA",
    },
    status: "irrelevant",
    requirement: {
      service: "Consulting",
      message: "Inquiring about consulting services.",
    },
    followUps: [
      {
        followUpNo: "1",
        date: new Date("2023-08-20"),
        message: "Followed up on consulting inquiry.",
      },
    ],
    source: "Email Campaign",
    contactAgent: "60d5ec49f1a2b8b1f8c8e4e4", // Example ObjectId
  },
];

const Lead = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState(sampleLeads);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddFollowUpModalOpen, setIsAddFollowUpModalOpen] = useState(false);
  // const [statusFilter, setStatusFilter] = useState("all");

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    service: 'all',
    city: 'all',
    district: 'all',
    state: 'all',
    source: 'all',
  });

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilter = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredLeads = leads.filter((lead) => {
    const statusMatch = filter.status === 'all' || lead.status === filter.status;
    const serviceMatch = filter.service === 'all' || lead.requirement.service.includes(filter.service);
    const cityMatch = filter.city === 'all' || lead.location.city.includes(filter.city);
    const districtMatch = filter.district === 'all' || lead.location.district.includes(filter.district);
    const stateMatch = filter.state === 'all' || lead.location.state.includes(filter.state);
    const sourceMatch = filter.source === 'all' || lead.source.includes(filter.source);
    return statusMatch && serviceMatch && cityMatch && districtMatch && stateMatch && sourceMatch;
  });

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearch(searchValue);
  };

  const handleAddFollowUp = (lead, newFollowUp) => {
    setLeads((prevLeads) =>
      prevLeads.map((l) => {
        if (l === lead) {
          l.followUps.push(newFollowUp);
        }
        return l;
      })
    );
    toast.success("Follow-up added successfully!");
  };

  const handleOpenAddFollowUpModal = (lead) => {
    setSelectedLead(lead);
    setIsAddFollowUpModalOpen(true);
  };

  // const handleStatusFilter = (e) => {
  //     const filterValue = e.target.value;
  //     setStatusFilter(filterValue);
  // };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleDelete = (lead) => {
    setLeads((prevLeads) => prevLeads.filter((l) => l !== lead));
    toast.success("Lead deleted successfully!");
  };

  const handleSubmit = (lead) => {
    if (selectedLead) {
      setLeads((prevLeads) =>
        prevLeads.map((l) => (l === selectedLead ? lead : l))
      );
      toast.success("Lead updated successfully!");
    } else {
      setLeads((prevLeads) => [...prevLeads, lead]);
      toast.success("Lead added successfully!");
    }
    setSelectedLead(null);
  };

  return (
    <div>
      <Header category="Page" title="Lead Management" />
      <section className="h-full w-full mb-16 flex justify-center">
        <div className="overflow-x-auto w-full max-w-screen-xl mx-auto">
          <div className="mx-auto">
            <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
              <input
                type="text"
                placeholder="Search by name"
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={handleSearch}
              />
              <div className="space-x-6">
                <button
                  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
                  onClick={() => setIsModalOpen(true)}
                >
                  Add Lead
                </button>
                {/* <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                  onClick={handleOpenFilterModal}
                >
                  Filter
                </button> */}
              </div>
            </div>
            <div className='bg-white rounded-lg shadow overflow-x-auto scrollbar-hide'>
              <table className="w-full border-collapse overflow-x-auto table-auto whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">Requirement</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">Source</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50 transition duration-200">
                      <td className="p-3 text-sm text-gray-700">{lead.name}</td>
                      <td className="p-3 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span>{lead.contact.phoneNo}</span>
                          <span>{lead.contact.whatsapp}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span>{lead.location.city}</span>
                          <span>{`${lead.location.district}, ${lead.location.state}`}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {lead.requirement.service}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${lead.status === "active"
                            ? "bg-green-100 text-green-700"
                            : lead.status === "closed"
                              ? "bg-red-100 text-red-700"
                              : lead.status === "converted"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-700">{lead.source}</td>
                      <td className="p-3 text-sm text-gray-700">
                        <button
                          className="bg-purple-500 text-white p-1 px-2 rounded-lg hover:bg-purple-600 transition duration-200 mr-2"
                          onClick={() => handleOpenAddFollowUpModal(lead)}
                        >
                          Add Follow-Up
                        </button>
                        <button
                          className="bg-yellow-500 text-white p-1 px-2 rounded-lg hover:bg-yellow-600 transition duration-200 mr-2"
                          onClick={() => handleEdit(lead)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white p-1 px-2 rounded-lg hover:bg-red-600 transition duration-200"
                          onClick={() => handleDelete(lead)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Modal isOpen={isFilterModalOpen} onClose={handleCloseFilterModal} head='Filter'>
              <FilterModal
                onClose={handleCloseFilterModal}
                onApplyFilter={handleApplyFilter}
              />
            </Modal>
            <AddFollowUpModal
              isOpen={isAddFollowUpModalOpen}
              onClose={() => setIsAddFollowUpModalOpen(false)}
              onAddFollowUp={handleAddFollowUp}
              lead={selectedLead}
            />
            <Modal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedLead(null);
              }} head='Create Lead'>
              <CreateLead
                onClose={() => {
                  setIsModalOpen(false);
                  setSelectedLead(null);
                }}
                onSubmit={handleSubmit}
                leadData={selectedLead}
              />
            </Modal>
            <Toaster position="top-right" reverseOrder={false} />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Lead

const FilterModal = ({ onClose, onApplyFilter }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const handleReset = () => {
    setStatusFilter('all');
    setServiceFilter('all');
    setDistrictFilter('all');
    setStateFilter('all');
    setCityFilter('all');
    setSourceFilter('all');
  }

  const handleApplyFilter = () => {
    onApplyFilter({
      status: statusFilter,
      service: serviceFilter,
      location: locationFilter,
      source: sourceFilter,
    });
    onClose();
  };

  return (
    <div >
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
          {sampleLeads.map((lead, index) => (
            <option key={index} value={lead.requirement.service}>{lead.requirement.service}</option>
          ))}
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
          {sampleLeads.map((lead, index) => (
            <option key={index} value={lead.location.city}>{lead.location.city}</option>
          ))}
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
          {sampleLeads.map((lead, index) => (
            <option key={index} value={lead.location.district}>{lead.location.district}</option>
          ))}
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
          {sampleLeads.map((lead, index) => (
            <option key={index} value={lead.location.state}>{lead.location.state}</option>
          ))}
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
          {sampleLeads.map((lead, index) => (
            <option key={index} value={lead.source}>{lead.source}</option>
          ))}
        </select>
      </div>
      <div className="flex space-x-4">
        <button
          className=" bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
          onClick={handleApplyFilter}
        >
          Apply Filter
        </button>
        <button type="button" onClick={handleReset}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400">
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

const AddFollowUpModal = ({ isOpen, onClose, onAddFollowUp, lead }) => {
  const [followUpNo, setFollowUpNo] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    const newFollowUp = { followUpNo, date, message };
    onAddFollowUp(lead, newFollowUp);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} head='Add Follow-Up'>
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold mt-2">Follow-Up No:</label>
            <input
              type="text"
              value={followUpNo}
              onChange={(e) => setFollowUpNo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
            >
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