import React, { useState, useMemo, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Header from "../../components/Header";
import { FaFilter } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import { MdDeleteForever } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Modal from "../../components/Modal";
import CreateStock from "../../components/CreateStock";
import axios from "axios";

const Stock = () => {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [filters, setFilters] = useState({
    category: "",
    minPurchasePrice: "",
    maxPurchasePrice: "",
    minSalePrice: "",
    maxSalePrice: "",
    minMrp: "",
    maxMrp: "",
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch all stock
  useEffect(() => {
    const loadStock = async () => {
      try {
        const { data } = await axios.get("/api/v1/stock");
        setStocks(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load stock");
      }
    };
    loadStock();
  }, []);

  // Total quantity sum
  const getTotalQty = (item) => {
    if (!item.stockByStore || item.stockByStore.length === 0) return 0;
    return item.stockByStore.reduce((sum, s) => sum + (s.currentStock || 0), 0);
  };

  // Filter + Search
  const filtered = useMemo(() => {
    return stocks.filter(
      (item) =>
        item?.name.toLowerCase().includes(search.toLowerCase()) &&
        (filters.category ? item.category === filters.category : true) &&
        (filters.minPurchasePrice
          ? item.purchasePrice >= filters.minPurchasePrice
          : true) &&
        (filters.maxPurchasePrice
          ? item.purchasePrice <= filters.maxPurchasePrice
          : true) &&
        (filters.minSalePrice
          ? item.salePrice >= filters.minSalePrice
          : true) &&
        (filters.maxSalePrice
          ? item.salePrice <= filters.maxSalePrice
          : true) &&
        (filters.minMrp ? item.mrp >= filters.minMrp : true) &&
        (filters.maxMrp ? item.mrp <= filters.maxMrp : true)
    );
  }, [stocks, search, filters]);

  // Pagination
  const totalPages = Math.max(Math.ceil(filtered.length / rowsPerPage), 1);
  const start = (currentPage - 1) * rowsPerPage;
  const current = filtered.slice(start, start + rowsPerPage);

  // Add new item
  const handleAdd = (newItem) => {
    if (newItem) {
      setStocks((prev) => [newItem, ...prev]);
    }
    setIsCreateOpen(false);
  };

  // Save updated stock
  const handleEditSave = (updatedItem) => {
    setStocks((prev) =>
      prev.map((s) => (s._id === updatedItem?._id ? updatedItem : s))
    );
    setIsEditOpen(false);
    setEditId(null);
  };

  // Open edit
  const handleEdit = (id) => {
    setEditId(id);
    setIsEditOpen(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this stock item?")) return;

    try {
      await axios.delete(`/api/v1/stock/${id}`);
      setStocks((prev) => prev.filter((s) => s._id !== id));
      toast.success("Deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Handle filters
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  return (
    <div>
      <Header category="Page" title="Stock Management" />

      <section className="container mx-auto mt-4">
        <div className="w-full mx-auto">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <input
              type="text"
              placeholder="Search stock..."
              className="border rounded p-2 w-full sm:w-1/2 shadow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex flex-row gap-3">
              <button
                className="bg-blue-500 text-white p-2 rounded-full shadow"
                onClick={() => setIsCreateOpen(true)}
              >
                <IoIosAddCircle size={24} />
              </button>

              <button
                className="bg-slate-400 text-white p-2 rounded-full shadow"
                onClick={() => setIsFilterOpen(true)}
              >
                <FaFilter size={18} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-[800px] w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-xs sm:text-sm">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Unit</th>
                  <th className="px-3 py-2">Purchase</th>
                  <th className="px-3 py-2">Sale</th>
                  {/* <th className="px-3 py-2">MRP</th> */}
                  <th className="px-3 py-2">Total Qty</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {current.length > 0 ? (
                  current.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b text-xs sm:text-sm hover:bg-gray-50"
                    >
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2">{item.category}</td>
                      <td className="px-3 py-2">{item.unit}</td>
                      <td className="px-3 py-2">₹ {item.purchasePrice || 0}</td>
                      <td className="px-3 py-2 text-blue-700 font-semibold">
                        ₹ {item.salePrice || 0}
                      </td>
                      {/* <td className="px-3 py-2">₹ {item.mrp || 0}</td> */}

                      <td className="px-3 py-2 font-medium">
                        {getTotalQty(item)}
                      </td>

                      <td className="px-3 py-2 flex flex-row gap-2 items-center">
                        <FaEdit
                          size={18}
                          color="green"
                          className="cursor-pointer"
                          onClick={() => handleEdit(item._id)}
                        />

                        <MdDeleteForever
                          size={20}
                          color="red"
                          className="cursor-pointer"
                          onClick={() => handleDelete(item._id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-row justify-between items-center mt-4 py-4 px-2 gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-2.5 bg-gray-300 rounded-4xl shadow-lg disabled:opacity-50"
            >
              <GrLinkPrevious size={18} color="blue" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-gray-300 p-2.5 rounded-4xl shadow-lg "
            >
              <GrLinkNext size={18} color="blue" />
            </button>
          </div>
        </div>
      </section>

      <Toaster position="top-right" />

      {/* Modals */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} head="Create Stock">
        <CreateStock
          onSave={handleAdd}
          onClose={() => setIsCreateOpen(false)}
        />
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <CreateStock
          editId={editId}
          onSave={handleEditSave}
          onClose={() => setIsEditOpen(false)}
        />
      </Modal>

      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <FilterModal
          filters={filters}
          setFilters={applyFilters}
          onClose={() => setIsFilterOpen(false)}
        />
      </Modal>
    </div>
  );
};

// ---------- Filter Modal ----------
const FilterModal = ({ filters, setFilters, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setLocalFilters(filters);

    const load = async () => {
      try {
        const { data } = await axios.get("/api/v1/stock-group");
        setCategories(data || []);
      } catch (err) {
        toast.error("Failed to load categories");
      }
    };
    load();
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const apply = () => {
    setFilters(localFilters);
    onClose();
  };

  const reset = () => {
    const empty = {
      category: "",
      minPurchasePrice: "",
      maxPurchasePrice: "",
      minSalePrice: "",
      maxSalePrice: "",
      minMrp: "",
      maxMrp: "",
    };
    setLocalFilters(empty);
    setFilters(empty);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Filter Stock</h2>

      <div className="space-y-4">
        {/* Category */}
        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            name="category"
            className="border p-2 rounded w-full"
            value={localFilters.category}
            onChange={handleChange}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Purchase price */}
        <div>
          <label className="text-sm font-medium">Purchase Price</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="minPurchasePrice"
              type="number"
              className="border p-2 rounded"
              placeholder="Min"
              value={localFilters.minPurchasePrice}
              onChange={handleChange}
            />
            <input
              name="maxPurchasePrice"
              type="number"
              className="border p-2 rounded"
              placeholder="Max"
              value={localFilters.maxPurchasePrice}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Sale price */}
        <div>
          <label className="text-sm font-medium">Sale Price</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="minSalePrice"
              type="number"
              className="border p-2 rounded"
              placeholder="Min"
              value={localFilters.minSalePrice}
              onChange={handleChange}
            />
            <input
              name="maxSalePrice"
              type="number"
              className="border p-2 rounded"
              placeholder="Max"
              value={localFilters.maxSalePrice}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* MRP */}
        <div>
          <label className="text-sm font-medium">MRP</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="minMrp"
              type="number"
              className="border p-2 rounded"
              placeholder="Min"
              value={localFilters.minMrp}
              onChange={handleChange}
            />
            <input
              name="maxMrp"
              type="number"
              className="border p-2 rounded"
              placeholder="Max"
              value={localFilters.maxMrp}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-500 text-white px-3 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="bg-red-500 text-white px-3 py-2 rounded"
            onClick={reset}
          >
            Reset
          </button>

          <button
            className="bg-blue-500 text-white px-3 py-2 rounded"
            onClick={apply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stock;
