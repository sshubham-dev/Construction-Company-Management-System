import { useState } from "react";

const CostCenterModal = ({ isOpen, onClose, costCenters, onSave }) => {
    const [costCenter, setCostCenter] = useState({
      name: "",
      alias: "",
      under: "",
      isActive: true,
      description: "",
    });
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setCostCenter({ ...costCenter, [name]: type === "checkbox" ? checked : value });
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(costCenter);
      setCostCenter({ name: "", alias: "", under: "", isActive: true, description: "" });
    };
  
    if (!isOpen) return null;
  
    return (
<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
<div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-[75vh] md:h-[80vh] md:mt-12 overflow-auto">
          <h2 className="text-xl font-bold mb-4">Create Cost Center</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name & Alias */}
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={costCenter.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Alias</label>
              <input
                type="text"
                name="alias"
                value={costCenter.alias}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
  
            {/* Parent Cost Center Selection */}
            <div>
              <label className="block text-sm font-medium">Under</label>
              <select
                name="under"
                value={costCenter.under}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              >
                <option value="">Primary</option>
                {costCenters.map((center) => (
                  <option key={center.id} value={center.name}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={costCenter.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium">Active</label>
            </div>
  
            {/* Description */}
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={costCenter.description}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
                rows="3"
              ></textarea>
            </div>
  
            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded-md">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
                Save Cost Center
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Sample Data for Cost Centers
  const costCenterData = [
    {
      id: 1,
      name: "Marketing",
      alias: "MKT",
      under: "Primary",
      budget: 50000,
      manager: "Alice Johnson",
      employeeCount: 15,
      isActive: true,
      description: "Handles all marketing campaigns and brand awareness.",
    },
    {
      id: 2,
      name: "Sales",
      alias: "SLS",
      under: "Marketing",
      budget: 70000,
      manager: "Bob Williams",
      employeeCount: 20,
      isActive: true,
      description: "Responsible for sales, client acquisition, and revenue generation.",
    },
    {
      id: 3,
      name: "IT Department",
      alias: "IT",
      under: "Primary",
      budget: 100000,
      manager: "Charlie Brown",
      employeeCount: 25,
      isActive: true,
      description: "Manages company infrastructure, software development, and security.",
    },
    {
      id: 4,
      name: "HR & Recruitment",
      alias: "HR",
      under: "Primary",
      budget: 30000,
      manager: "Diana Smith",
      employeeCount: 10,
      isActive: true,
      description: "Handles employee hiring, payroll, and company policies.",
    },
    {
      id: 5,
      name: "Operations",
      alias: "OPS",
      under: "Primary",
      budget: 80000,
      manager: "Edward Clark",
      employeeCount: 30,
      isActive: true,
      description: "Oversees production, logistics, and company operations.",
    },
    {
      id: 6,
      name: "Finance & Accounts",
      alias: "FIN",
      under: "Primary",
      budget: 120000,
      manager: "Fiona Adams",
      employeeCount: 12,
      isActive: true,
      description: "Manages company financials, accounting, and auditing.",
    },
    {
      id: 7,
      name: "Customer Support",
      alias: "SUP",
      under: "Sales",
      budget: 40000,
      manager: "George Thomas",
      employeeCount: 18,
      isActive: true,
      description: "Handles customer queries, support tickets, and satisfaction.",
    },
    {
      id: 8,
      name: "Research & Development",
      alias: "R&D",
      under: "IT Department",
      budget: 150000,
      manager: "Helen Green",
      employeeCount: 22,
      isActive: true,
      description: "Innovates new products, testing, and research.",
    },
    {
      id: 9,
      name: "Logistics & Supply Chain",
      alias: "LOG",
      under: "Operations",
      budget: 60000,
      manager: "Isaac Turner",
      employeeCount: 14,
      isActive: true,
      description: "Manages inventory, transportation, and supplier relations.",
    },
    {
      id: 10,
      name: "Legal & Compliance",
      alias: "LEGAL",
      under: "Primary",
      budget: 45000,
      manager: "Jessica Lopez",
      employeeCount: 8,
      isActive: true,
      description: "Handles company legal matters and compliance policies.",
    },
  ];
  
  
  const CostCenterPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [costCenters, setCostCenters] = useState(costCenterData);
  
    const handleSave = (newCenter) => {
      setCostCenters([...costCenters, { id: costCenters.length + 1, ...newCenter }]);
      setIsModalOpen(false);
    };
  
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Cost Centers</h1>
        
        {/* Add Cost Center Button */}
        <button onClick={() => setIsModalOpen(true)} className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md">
          + Add Cost Center
        </button>
  
        {/* Cost Centers List */}
        <ul className="border rounded-md p-4 bg-white shadow-md">
    {costCenters.map((center) => (
      <li key={center.id} className="border-b py-3 last:border-0">
        <div className="font-semibold text-lg text-gray-800">{center.name} ({center.alias})</div>
        <div className="text-sm text-gray-600">Under: {center.under}</div>
        <div className="text-sm text-gray-600">Manager: {center.manager}</div>
        <div className="text-sm text-gray-600">Employees: {center.employeeCount}</div>
        <div className="text-sm text-gray-600">
          Budget: <span className="font-medium">${center.budget.toLocaleString()}</span>
        </div>
        <div className="text-sm text-gray-500 italic">{center.description}</div>
      </li>
    ))}
  </ul>
  
  
        {/* Cost Center Modal */}
        <CostCenterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} costCenters={costCenters} onSave={handleSave} />
      </div>
    );
  };
  
  export default CostCenterPage;