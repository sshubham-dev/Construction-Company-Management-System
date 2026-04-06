import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";

const CostCenterModal = ({ isOpen, onClose, costCenters, onSave }) => {
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [company, setCompany] = useState([]);
  const [costCenter, setCostCenter] = useState({
    name: "",
    companyId: null,
    type: "",
    parentId: null,
    isActive: true,
    reference: null,
  });
  useEffect(() => {
    const fetchCompany = async () => {
      const res = await axios.get("/api/v1/company");
      console.log(res.data);
      setCompany(res.data);
    };
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCostCenter({
      ...costCenter,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/v1/cost-center", costCenter);
      toast.success("Cost Center created");
      onSave(res.data);
      onClose();
      setCostCenter({
        name: "",
        companyId: null,
        type: "",
        parentId: null,
        isActive: true,
        referenceId: "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (!isOpen) return null;
  const inputClass =
    "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";
  return (
    <div className=" overflow-auto">
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
          <label className="block text-sm font-medium">Company</label>
          <select
            className={inputClass}
            name="companyId"
            value={costCenter?.companyId}
            onChange={handleChange}
          >
            <option value="">Select Company</option>
            {company.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Parent Cost Center Selection */}
        <div>
          <label className="block text-sm font-medium">Under</label>
          <select
            name="parentId"
            value={costCenter.parentId}
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

        {/* Type of Cost Center */}
        <div>
          <label className="block text-sm font-medium">Type</label>
          <input
            name="type"
            value={costCenter.type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        {/* Reference of Cost Center */}
        <div>
          <label className="block text-sm font-medium">Reference</label>
          <select
            name="reference"
            value={costCenter.reference}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Primary</option>
            {costCenters.map((center) => (
              <option key={center.id} value={center.id}>
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

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-md"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Save Cost Center
          </button>
        </div>
      </form>
    </div>
  );
};

const CostCenter = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [costCenters, setCostCenters] = useState([]);
  const { user, isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchCostCenter = async () => {
      try {
        const res = await axios.get("/api/v1/cost-center", {
          params: { companyId: user.companyId },
        });
        setCostCenters(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCostCenter();
  }, []);

  const handleSave = (newCenter) => {
    setCostCenters([
      ...costCenters,
      { id: costCenters.length + 1, ...newCenter },
    ]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-4">Cost Centers</h1>

      {/* Add Cost Center Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md"
      >
        + Add Cost Center
      </button>

      {/* Cost Centers List */}
      <ul className="border rounded-md p-4 bg-white shadow-md">
        {costCenters.map((center) => (
          <li key={center.id} className="border-b py-3 last:border-0">
            <div className="font-semibold text-lg text-gray-800">
              {center.name} ({center.companyId?.name})
            </div>
            <div className="text-sm text-gray-600">Under: {center.under}</div>
            <div className="text-sm text-gray-600">
              {/* Manager: {center.manager} */}
            </div>
            <div className="text-sm text-gray-600">
              {/* Employees: {center.employeeCount} */}
            </div>
            <div className="text-sm text-gray-600">
              Budget:{" "}
              <span className="font-medium">
                {/* ${center.budget.toLocaleString()} */}
              </span>
            </div>
            <div className="text-sm text-gray-500 italic">
              {/* {center.description} */}
            </div>
          </li>
        ))}
      </ul>

      {/* Cost Center Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        head="Create Cost Center"
      >
        <CostCenterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          costCenters={costCenters}
          onSave={handleSave}
        />
      </Modal>
    </div>
  );
};

export default CostCenter;
