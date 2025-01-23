import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const mockData = [
  { id: 1, name: "Widget A", category: "Widgets", status: "In Stock", quantity: 150 },
  { id: 2, name: "Widget B", category: "Widgets", status: "Low Stock", quantity: 10 },
  { id: 3, name: "Gadget X", category: "Gadgets", status: "In Stock", quantity: 200 },
  { id: 4, name: "Gadget Y", category: "Gadgets", status: "Out of Stock", quantity: 0 },
];

// Modal Component
const Modal = ({ isOpen, onClose, onSave, newItem, onChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{newItem.id ? "Edit Item" : "Add New Item"}</h2>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-2 py-1 rounded hover:bg-gray-400"
          >
            &times;
          </button>
        </div>
        <div className="grid gap-4">
          {["name", "category", "status", "quantity"].map((field) => (
            <div className="grid grid-cols-2 items-center gap-4" key={field}>
              <label className="text-right capitalize">{field}</label>
              <input
                type={field === "quantity" ? "number" : "text"}
                name={field}
                value={newItem[field] || ""}
                onChange={onChange}
                className="border border-gray-300 rounded px-2 py-1 w-full"
              />
            </div>
          ))}
          <button
            onClick={onSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {newItem.id ? "Update Item" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [items, setItems] = useState(mockData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({});

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleFilter = (e) => setFilterCategory(e.target.value);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleAddEditItem = () => {
    if (newItem.name && newItem.category && newItem.status && newItem.quantity) {
      setItems((prevItems) =>
        newItem.id
          ? prevItems.map((item) => (item.id === newItem.id ? newItem : item))
          : [...prevItems, { ...newItem, id: prevItems.length + 1 }]
      );
      setIsModalOpen(false);
      setNewItem({});
    }
  };

  const handleEdit = (id) => {
    const item = items.find((item) => item.id === id);
    if (item) {
      setNewItem(item);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: name === "quantity" ? parseInt(value, 10) : value });
  };

  const filteredData = items
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((item) =>
      filterCategory ? item.category.toLowerCase() === filterCategory.toLowerCase() : true
    );

  const sortedData = filteredData.sort((a, b) => {
    if (!sortConfig.key) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <FaSearch className="h-4 w-4" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={handleSearch}
            className="border border-gray-300 rounded px-2 py-1 w-64"
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filterCategory}
            onChange={handleFilter}
            className="border border-gray-300 rounded px-2 py-1 w-44"
          >
            <option value="">All Categories</option>
            <option value="Widgets">Widgets</option>
            <option value="Gadgets">Gadgets</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Add Item
          </button>
        </div>
      </div>

      <table className="w-full border border-gray-300">
        <thead>
          <tr>
            {["name", "category", "status", "quantity"].map((col) => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                className="cursor-pointer border-b border-gray-300 px-2 py-1 bg-gray-100"
              >
                {col.charAt(0).toUpperCase() + col.slice(1)}{" "}
                {sortConfig.key === col && (sortConfig.direction === "asc" ? "🔼" : "🔽")}
              </th>
            ))}
            <th className="border-b border-gray-300 px-2 py-1 bg-gray-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr key={item.id} className="hover:bg-gray-100">
              <td className="border-b border-gray-300 px-2 py-1">{item.name}</td>
              <td className="border-b border-gray-300 px-2 py-1">{item.category}</td>
              <td className="border-b border-gray-300 px-2 py-1">{item.status}</td>
              <td className="border-b border-gray-300 px-2 py-1">{item.quantity}</td>
              <td className="border-b border-gray-300 px-2 py-1">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddEditItem}
        newItem={newItem}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default Inventory;
