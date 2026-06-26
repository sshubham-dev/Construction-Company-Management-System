import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";

const CostCenterModal = ({ isOpen, onClose, costCenters, onSave, editId }) => {
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

  useEffect(() => {
    if (editId) {
      const selected = costCenters.find((c) => c._id === editId);
      if (selected) {
        setCostCenter({
          name: selected.name || "",
          companyId: selected.companyId?._id || "",
          type: selected.type || "",
          parentId: selected.parentId?._id || selected.parentId || null,
          isActive: selected.isActive ?? true,
          reference: selected.reference || null,
        });
      }
    }
  }, [editId, costCenters]);

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
      let res;

      if (editId !== undefined) {
        // ✅ UPDATE
        res = await axios.put(`/api/v1/cost-center/${editId}`, costCenter);
        toast.success("Cost Center updated");
      } else {
        // ✅ CREATE
        res = await axios.post("/api/v1/cost-center", costCenter);
        toast.success("Cost Center created");
      }

      onSave(res.data);
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
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
          <label className="block text-sm font-medium">Name*</label>
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
          <label className="block text-sm font-medium">Company*</label>
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
          <label className="block text-sm font-medium">Under*</label>
          <select
            name="parentId"
            value={costCenter.parentId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Primary</option>
            {costCenters.map((center) => (
              <option key={center._id} value={center._id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type of Cost Center */}
        <div>
          <label className="block text-sm font-medium">Type*</label>
          <input
            name="type"
            value={costCenter.type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
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
              <option key={center._id} value={center._id || null}>
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
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCostCenter = async () => {
      try {
        const res = await axios.get("/api/v1/cost-center", {
          params: { companyId: user.companyId },
        });
        console.log(res.data);
        setCostCenters(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCostCenter();
  }, []);

  const handleSave = (data) => {
    setCostCenters((prev) => {
      const exists = prev.find((c) => c._id === data._id);

      if (exists) {
        // update
        return prev.map((c) => (c._id === data._id ? data : c));
      } else {
        // create
        return [...prev, data];
      }
    });
  };

  const handleEdit = (id) => {
    setEditModal(true);
    setEditId(id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await axios.delete(`/api/v1/cost-center/${id}`);

      setCostCenters((prev) => prev.filter((c) => c._id !== id));

      toast.success("Deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

  const filtered = costCenters.filter((cc) => {
    const matchSearch =
      cc?.name?.toLowerCase().includes(search.toLowerCase()) ||
      cc?.parentId?.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Cost Center</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="border px-3 py-2 rounded w-72"
        />
      </div>
      {/* Add Cost Center Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-4 py-2 flex flex-row gap-3 items-center bg-green-600 text-white rounded-md"
      >
        <MdAdd /> Cost Center
      </button>

      {/* Cost Centers List */}
      <ul className="border rounded-md px-3 py-3 bg-white shadow-md">
        {filtered.map((center, index) => (
          <li key={index} className="border-b py-3 last:border-0">
            <div className="flex flex-nowrap justify-between items-center mb-2">
              <h2 className="text-lg font-semibold cursor-pointer text-wrap">
                {center.name} ({center.companyId?.name})
              </h2>
              <div className="space-x-2">
                <button onClick={() => handleEdit(center._id)}>
                  <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                </button>
                <button onClick={() => handleDelete(center._id)}>
                  <MdDelete className="text-red-500 hover:text-red-600 text-lg" />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Under: {center?.parentId?.name || "Primary"}
            </div>
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

      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        head="Update Cost Center"
      >
        <CostCenterModal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          costCenters={costCenters}
          onSave={handleSave}
          editId={editId}
        />
      </Modal>
    </div>
  );
};

export default CostCenter;
