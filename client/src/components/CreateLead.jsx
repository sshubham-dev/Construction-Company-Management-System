import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Header from "./Header";

const LeadForm = ({ isOpen, onClose, onSubmit, leadData }) => {
    const [lead, setLead] = useState(
        leadData || {
            name: "",
            contact: { phoneNo: "", whatsapp: "", email: "" },
            location: { address: "", city: "", district: "", state: "" },
            status: "active",
            requirement: { service: "", message: "" },
            followUps: [],
            source: "",
            contactAgent: "",
        }
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLead((prev) => {
            const keys = name.split(".");
            if (keys.length > 1) {
                return {
                    ...prev,
                    [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(lead);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
            <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-[75vh] md:h-[80vh] md:mt-12 overflow-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    {leadData ? "Edit Lead" : "Add Lead"}
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.name}
                    />
                    <input
                        type="text"
                        name="contact.phoneNo"
                        placeholder="Phone Number"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.contact.phoneNo}
                    />
                    <input
                        type="text"
                        name="contact.whatsapp"
                        placeholder="WhatsApp"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.contact.whatsapp}
                    />
                    <input
                        type="email"
                        name="contact.email"
                        placeholder="Email"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.contact.email}
                    />
                    <input
                        type="text"
                        name="location.address"
                        placeholder="Address"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.location.address}
                    />
                    <input
                        type="text"
                        name="location.city"
                        placeholder="City"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.location.city}
                    />
                    <input
                        type="text"
                        name="location.district"
                        placeholder="District"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.location.district}
                    />
                    <input
                        type="text"
                        name="location.state"
                        placeholder="State"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.location.state}
                    />
                    <select
                        name="status"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.status}
                    >
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="converted">Converted</option>
                        <option value="irrelevent">Irrelevant</option>
                    </select>
                    <select
                        name="requirement.service"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.requirement.service}
                    >
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="converted">Converted</option>
                        <option value="irrelevent">Irrelevant</option>
                    </select>
                    <textarea
                        name="requirement.service"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        placeholder="Wite Message..."
                        value={lead.requirement.message}>
                    </textarea>
                    <select
                        name="source"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.source}
                    >
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="converted">Converted</option>
                        <option value="irrelevent">Irrelevant</option>
                    </select>
                    <select
                        name="contactAgent"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                        value={lead.contactAgent}
                    >
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="converted">Converted</option>
                        <option value="irrelevent">Irrelevant</option>
                    </select>
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-200"
                        >
                            Submit
                        </button>
                        <button
                            type="button"
                            className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-200"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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

const FilterModal = ({ isOpen, onClose, onApplyFilter }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');

    const handleApplyFilter = () => {
        onApplyFilter({
            status: statusFilter,
            service: serviceFilter,
            location: locationFilter,
            source: sourceFilter,
        });
        onClose();
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
            <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-[75vh] md:h-[80vh] md:mt-12 overflow-auto">
                <h2 className="text-lg font-bold mb-4">Filter Leads</h2>
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
                        className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-200"
                        onClick={handleApplyFilter}
                    >
                        Apply Filter
                    </button>
                    <button
                        type="button"
                        className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-200"
                        onClick={onClose}
                    >
                        Cancle
                    </button>
                </div>

            </div>
        </div>
    );
};

const LeadsTable = () => {
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leads, setLeads] = useState(sampleLeads);
    const [selectedLead, setSelectedLead] = useState(null);
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
        <div className="mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
                <input
                    type="text"
                    placeholder="Search by name"
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={search}
                    onChange={handleSearch}
                />
                {/* <select
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={statusFilter}
                    onChange={handleStatusFilter}
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="converted">Converted</option>
                    <option value="irrelevent">Irrelevant</option>
                </select> */}
                <div className="space-x-6">
                    <button
                        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add Lead
                    </button>
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                        onClick={handleOpenFilterModal}
                    >
                        Filter
                    </button>
                </div>
            </div>
            <table className="w-full table-auto">
                <thead className="bg-gray-100">
                    <tr>
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
                    {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="border-t hover:bg-gray-50 transition duration-200">
                            <td className="p-3 text-sm text-gray-700">{lead.name}</td>
                            <td className="p-3 text-sm text-gray-700">
                                <div className="flex flex-col">
                                    <span>{lead.contact.phoneNo}</span>
                                    <span>{lead.contact.whatsapp}</span>
                                    <span>{lead.contact.email}</span>
                                </div>
                            </td>
                            <td className="p-3 text-sm text-gray-700">
                                <div className="flex flex-col">
                                    <span>{lead.location.address}</span>
                                    <span>{` ${lead.location.city}, ${lead.location.district}`}</span>
                                    <span>{lead.location.state}</span>
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
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={handleCloseFilterModal}
                onApplyFilter={handleApplyFilter}
            />
            <LeadForm
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedLead(null);
                }}
                onSubmit={handleSubmit}
                leadData={selectedLead}
            />
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
};

const CreateLead = () => {
    return (
        <div>
            <Header category="Page" title="Lead Management" />
            <section className="h-full w-full mb-16 flex justify-center">
                <div className="overflow-x-auto w-full max-w-screen-xl mx-auto">
                    <LeadsTable />
                </div>
            </section>
        </div>
    );
};

export default CreateLead;