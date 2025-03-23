import React, { useState, useMemo, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import { FaFilter } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import { MdDeleteForever } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Modal from '../../components/Modal';
import CreateStock from '../../components/CreateStock';
import CreateStockGroup from '../../components/CreateStockGroup';
import axios from 'axios';

const Stock = () => {
  const [stocks, setStock] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [filters, setFilters] = useState({ category: "", brand: "", minPrice: "", maxPrice: "" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get('/api/v1/stock')
        setStock(response.data);
        console.log(response.data);
      } catch (error) {
        console.log(error)
      }
    };
    fetchStock();
  }, [])

  // Filter and sort stock
  const filteredstock = useMemo(() => {
    return stocks.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (filters.category ? item?.category.name === filters.category : true) &&
      (filters.minPrice ? item.cp >= filters.minPrice : true) &&
      (filters.maxPrice ? item.cp <= filters.maxPrice : true)
    );
  }, [stocks, search, filters]);

  const sortedstock = useMemo(() => {
    return [...filteredstock].sort((a, b) => {
      if (!sortConfig.key) return 0;
      return sortConfig.direction === "asc"
        ? a[sortConfig.key] > b[sortConfig.key]
          ? 1
          : -1
        : a[sortConfig.key] < b[sortConfig.key]
          ? 1
          : -1;
    });
  }, [filteredstock, sortConfig]);

  useEffect(() => {
    if (currentPage > Math.ceil(filteredstock.length / rowsPerPage)) {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    }
  }, [filteredstock]);


  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedstock.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredstock.length / rowsPerPage);

  // Handle adding a new item
  const handleAdd = (newItem) => {
    setIsModalOpen(false);
  };

  // Handle editing an item
  const handleEditSave = (updatedItem) => {
    setStock((prevstock) =>
      prevstock.map((item) => (item._id === updatedItem._id ? updatedItem : item))
    );
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {
      const response = await axios.delete(`/api/v1/stock/${id}`)
      console.log(response.data)
      setStock((prevstock) => prevstock.filter((item) => item._id !== id));
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
      <Header category="Page" title="Stock Management" />
      <section className='container mx-auto mt-4'>
        <div className='overflow-x-auto w-full mx-auto  '>
          {/* Header with Search and Add */}
          <div className="flex justify-between mb-6 space-x-2">
            <input
              type="search"
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
          <div className=" bg-white rounded-lg shadow overflow-x-auto scrollbar-hide">
            <table className="w-full border-collapse  overflow-x-auto">
              <thead>
                <tr className="bg-gray-100">
                  {/* <th onClick={() => handleSort("name")} className="px-4 py-2">
                    Product Id {sortConfig.key === 'name' && (sortConfig.direction === "asc" ? "▲" : "▼")}
                  </th> */}
                  <th onClick={() => handleSort("name")} className="px-4 py-2 text-left">
                    Name {sortConfig.key === 'name' && (sortConfig.direction === "asc" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("name")} className="px-4 py-2 text-left">
                    Category {sortConfig.key === 'name' && (sortConfig.direction === "asc" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("name")} className="px-4 py-2 text-left">
                    Quantity {sortConfig.key === 'name' && (sortConfig.direction === "asc" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("name")} className="px-4 py-2 text-left">
                    Price {sortConfig.key === 'name' && (sortConfig.direction === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-4 py-2 text-left">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-100">
                    {/* <td className="px-4 py-2">{item._id}</td> */}
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item?.category.name}</td>
                    <td className="px-4 py-2">{item.actualQuantity}</td>
                    <td className="px-4 py-2">₹ {item.cp}</td>
                    <td className="p-4 flex items-center gap-4">
                      <button
                        className=""
                        onClick={() => handleEdit(item)}
                      >
                        {<FaEdit /> ? <FaEdit size={22} color="green" /> : "Edit"}
                      </button>
                      <button
                        className=""
                        onClick={() => handleDelete(item._id)}
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
              className="p-2.5 bg-gray-300 rounded-4xl shadow-lg disabled:opacity-50"
            >
              <GrLinkPrevious size={18} color="blue" />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-gray-300 p-2.5 rounded-4xl shadow-lg "
            >
              <GrLinkNext size={18} color="blue" />
            </button>
          </div>

          {/* Filter Modal */}
          {isFilterOpen && <FilterModal filters={filters} setFilters={applyFilters} onClose={() => setIsFilterOpen(false)} />}
          <Modal onClose={() => setIsModalOpen(false)} isOpen={isModalOpen}>
            <CreateStock
              onClose={() => setIsModalOpen(false)}
              onSave={isEdit ? handleEditSave : handleAdd}
              item={currentItem}
              isEdit={isEdit} />
          </Modal>
          <Modal onClose={() => setGroupModalOpen(false)} isOpen={isGroupModalOpen}>
            <CreateStockGroup
              onClose={() => setIsModalOpen(false)} />
          </Modal>
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
      <div className="bg-white px-5 py-8 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-[75vh] md:h-[80vh] md:mt-12 overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Filter Products</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFilters(newFilters);
          }}
          className='space-y-4'
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
          <div className="flex justify-end gap-2 mt-4">
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

export default Stock