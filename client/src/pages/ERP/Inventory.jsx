import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import ModernTable from '../../components/Table/ModernTable';

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

const Stock = () => {
  const Overview = ({ title, value }) => {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <p className="text-gray-500">{title}</p>
        <h2 className="text-2xl font-semibold">{value}</h2>
      </div>
    );
  };

  const BestSellingCategory = () => {
    const categories = [
      { category: "Vegetable", turnover: "₹26,000", increase: "3.2%" },
      { category: "Instant Food", turnover: "₹22,000", increase: "2%" },
      { category: "Households", turnover: "₹22,000", increase: "1.5%" },
    ];

    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Best Selling Category</h3>
        <ul className="space-y-3">
          {categories.map((item, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{item.category}</span>
              <div className="text-right">
                <p className="font-semibold">{item.turnover}</p>
                <p className="text-green-500">{item.increase}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const ProfitRevenueChart = () => {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Profit & Revenue</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          {/* Placeholder for Chart */}
          <p>Chart Placeholder</p>
        </div>
      </div>
    );
  };

  const BestSellingProduct = () => {
    const products = [
      { product: "Tomato", id: "23567", category: "Vegetable", quantity: "225 kg", turnover: "₹17,000", increase: "2.3%" },
      { product: "Onion", id: "25831", category: "Vegetable", quantity: "200 kg", turnover: "₹12,000", increase: "1.3%" },
      { product: "Maggi", id: "56841", category: "Instant Food", quantity: "200 Packet", turnover: "₹10,000", increase: "1.3%" },
      { product: "Surf Excel", id: "23567", category: "Household", quantity: "125 Packet", turnover: "₹9,000", increase: "1%" },
    ];

    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Best Selling Product</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b pb-2">Product</th>
              <th className="border-b pb-2">Product ID</th>
              <th className="border-b pb-2">Category</th>
              <th className="border-b pb-2">Remaining Quantity</th>
              <th className="border-b pb-2">Turn Over</th>
              <th className="border-b pb-2">Increase By</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2">{item.product}</td>
                <td className="py-2">{item.id}</td>
                <td className="py-2">{item.category}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">{item.turnover}</td>
                <td className="py-2 text-green-500">{item.increase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div >
      <Header category="Page" title="Inventory Management" />
      <section className='container mx-auto mt-4 mb-16'>
        <div className='overflow-x-auto w-full max-w-screen-xl mx-auto'>
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Overview Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Overview title="Total Profit" value="₹21,190" />
                <Overview title="Revenue" value="₹18,300" />
                <Overview title="Sales" value="₹17,432" />
                <Overview title="Net Purchase Value" value="₹1,17,432" />
              </div>

              {/* Best Selling Category */}
              <BestSellingCategory />

              {/* Profit & Revenue Chart */}
              <ProfitRevenueChart />

              {/* Best Selling Products Table */}
              <BestSellingProduct />
            </div>
        </div>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
    </div>
  )
}
