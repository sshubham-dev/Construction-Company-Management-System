import React, { useState, useMemo, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import { FaFilter } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import { MdDeleteForever } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

const Purchase = () => {
  const [data, setData] = useState([{
    id:'1',
    name:'Product',
  }]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [filters, setFilters] = useState({ category: "", brand: "", minPrice: "", maxPrice: "" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filter and sort data
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (filters.category ? item.category === filters.category : true) &&
      (filters.brand ? item.brand === filters.brand : true) &&
      (filters.minPrice ? item.price >= filters.minPrice : true) &&
      (filters.maxPrice ? item.price <= filters.maxPrice : true)
    );
  }, [data, search, filters]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (!sortConfig.key) return 0;
      return sortConfig.direction === "asc"
        ? a[sortConfig.key] > b[sortConfig.key]
          ? 1
          : -1
        : a[sortConfig.key] < b[sortConfig.key]
          ? 1
          : -1;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => {
    if (currentPage > Math.ceil(filteredData.length / rowsPerPage)) {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    }
  }, [filteredData]);


  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Handle adding a new item
  const handleAdd = (newItem) => {
    setData((prevData) => [...prevData, { id: Date.now(), ...newItem }]);
    setIsModalOpen(false);
  };

  // Handle editing an item
  const handleEditSave = (updatedItem) => {
    setData((prevData) =>
      prevData.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {
      setData((prevData) => prevData.filter((item) => item.id !== id));
    }
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  // Handle filters
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  return (
    <div >
      <Header category="Page" title="Purchase Management" />
      <section className='container mx-auto mt-4 mb-16'>
        <div className='overflow-x-auto w-full mx-auto bg-white p-6 rounded-lg shadow'>
            {/* Header with Search and Add */}
            <div className="flex justify-between mb-6 space-x-2">
              <input
                type="text"
                placeholder="Search"
                className="border rounded p-2 w-2/3 md:w-1/3 lg:w-1/3 shadow-lg "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex flex-row gap-4">
                <button
                  className="bg-blue-500 text-white py-2 px-2 rounded-4xl shadow-lg "
                  onClick={() => {
                    setIsEdit(false);
                    setIsModalOpen(true);
                    setCurrentItem(null);
                  }}
                >
                  <IoIosAddCircle size={24} />
                </button>
                <button
                  className="bg-slate-400 text-white py-2 px-3 rounded-4xl shadow-lg "
                  onClick={() => setIsFilterOpen(true)}
                >
                  <FaFilter size={16} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full border-collapse  overflow-x-auto">
                <thead>
                  <tr className="bg-gray-100">
                      <th  onClick={() => handleSort("name")} className="p-3">
                        Product Id {sortConfig.key === 'name' && (sortConfig.direction === "asc" ? "▲" : "▼")}
                      </th>
                      <th  onClick={() => handleSort("name")} className="p-3">
                        Name {sortConfig.key === 'name' && (sortConfig.direction === "asc" ? "▲" : "▼")}
                      </th>
                      <th  onClick={() => handleSort("name")} className="p-3">
                        Category {sortConfig.key === 'name' && (sortConfig.direction === "asc" ? "▲" : "▼")}
                      </th>
                      <th  onClick={() => handleSort("name")} className="p-3">
                        Quantity {sortConfig.key === 'name' && (sortConfig.direction === "asc" ? "▲" : "▼")}
                      </th>
                      <th  onClick={() => handleSort("name")} className="p-3">
                        Price {sortConfig.key === 'name' && (sortConfig.direction === "asc" ? "▲" : "▼")}
                      </th>
                      <th  onClick={() => handleSort("name")} className="p-3">
                        Action {sortConfig.key === 'name' && (sortConfig.direction === "asc" ? "▲" : "▼")}
                      </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-100">
                      <td className="p-3">{item.id}</td>
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.category}</td>
                      {/* <td className="p-3">{item.brand}</td> */}
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">${item.price}</td>
                      <td className="p-4 flex items-center gap-4">
                        <button
                          className=""
                          onClick={() => handleEdit(item)}
                        >
                          {<FaEdit /> ? <FaEdit size={22} color="green" /> : "Edit"}
                        </button>
                        <button
                          className=""
                          onClick={() => handleDelete(item.id)}
                        >
                          {<MdDeleteForever /> ? <MdDeleteForever size={26} color="red" /> : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 py-4 px-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-gray-300 text-gray-700 p-2.5 rounded-4xl shadow-lg "
              >
                <GrLinkPrevious size={18} color="blue" />
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-gray-300 text-gray-700 p-2.5 rounded-4xl shadow-lg "
              >
                <GrLinkNext size={18} color="blue" />
              </button>
            </div>

          {/* Filter Modal */}
          {isFilterOpen && <FilterModal filters={filters} setFilters={applyFilters} onClose={() => setIsFilterOpen(false)} />}
          {isModalOpen && (
            <Modal
              onClose={() => setIsModalOpen(false)}
              onSave={isEdit ? handleEditSave : handleAdd}
              item={currentItem}
              isEdit={isEdit}
            />
          )}
        </div>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
    </div>
  );
}

const FilterModal = ({ filters, setFilters, onClose }) => {
  const [newFilters, setNewFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg w-1/3">
        <h2 className="text-lg font-semibold mb-4">Filter Products</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFilters(newFilters);
          }}
        >
          <div className="mb-2">
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={newFilters.category}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          {/* <div className="mb-2">
            <label htmlFor="brand" className="block text-sm font-medium">
              Brand
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={newFilters.brand}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div> */}
          <div className="mb-2">
            <label htmlFor="minPrice" className="block text-sm font-medium">
              Minimum Price
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={newFilters.minPrice}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="maxPrice" className="block text-sm font-medium">
              Maximum Price
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={newFilters.maxPrice}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white p-2 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setFilters({ category: "", brand: "", minPrice: "", maxPrice: "" })}
              className="bg-red-500 text-white p-2 rounded"
            >
              Reset Filters
            </button>

            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Modal = ({ item, isEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState(isEdit ? item : { name: "", category: "", brand: "", quantity: "", price: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg w-1/3">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? "Edit Product" : "Add Product"}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
        >
          <div className="mb-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="brand" className="block text-sm font-medium">
              Brand
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="quantity" className="block text-sm font-medium">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="price" className="block text-sm font-medium">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white p-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              {isEdit ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Purchase