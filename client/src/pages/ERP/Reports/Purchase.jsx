import React, { useState } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from "chart.js";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../../components/Header';
import { MdDeleteForever } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import { IoIosAddCircle } from "react-icons/io";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);
// import Charts from "./components/Charts";


const salesData = [
  {
    orderNo: "1001",
    site: "Site A",
    orderDate: "2023-10-01",
    deliveryDate: "2023-10-10",
    totalAmount: "$5,000",
    status: "Delivered",
  },
  {
    orderNo: "1002",
    site: "Site B",
    orderDate: "2023-10-02",
    deliveryDate: "2023-10-12",
    totalAmount: "$3,200",
    status: "Pending",
  },
  {
    orderNo: "1003",
    site: "Site A",
    orderDate: "2023-10-01",
    deliveryDate: "2023-10-10",
    totalAmount: "$5,000",
    status: "Delivered",
  },
  {
    orderNo: "1004",
    site: "Site B",
    orderDate: "2023-10-02",
    deliveryDate: "2023-10-12",
    totalAmount: "$3,200",
    status: "Pending",
  },
  {
    orderNo: "1005",
    site: "Site A",
    orderDate: "2023-10-01",
    deliveryDate: "2023-10-10",
    totalAmount: "$5,000",
    status: "Delivered",
  },
  {
    orderNo: "1006",
    site: "Site B",
    orderDate: "2023-10-02",
    deliveryDate: "2023-10-12",
    totalAmount: "$3,200",
    status: "Pending",
  },
];


const Purchase = () => {
  const [sales, setSales] = useState(salesData);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Set the number of items per page

  // Calculate the total number of pages
  const totalPages = Math.ceil(salesData.length / itemsPerPage);

  // Get the current items to display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sales.slice(indexOfFirstItem, indexOfLastItem);

  // Handle editing an item
  const handleEditSave = (updatedSales) => {
    setSales((prevSales) =>
      prevSales.map((sales) => (sales.id === updatedSales.id ? updatedSales : sales))
    );
    setIsAddModalOpen(false);
    setCurrentItem(null);
  };

  const handleAdd = (newItem) => {
    setSales((prevSales) => [...prevSales, { id: Date.now(), ...newItem }]);
    setIsAddModalOpen(false);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setCurrentItem(item);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id) => {
    setSales((prevSales) => prevSales.filter((item) => item.id !== id));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <Header category="Page" title="Purchase Management" />
      <section className='container mx-auto mt-4'>
        <div className='overflow-x-auto w-full mx-auto'>

          {/* Filter */}
          <div className="flex justify-between mb-6 space-x-2">
            <input type="search"
              placeholder="Search Order No"
              className="p-2 border rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-row gap-4">
              <button
                className="bg-blue-500 text-white py-2 px-2 rounded-4xl shadow-lg mr-4"
                onClick={() => {
                  setIsEdit(false);
                  setIsAddModalOpen(true);
                  setCurrentItem(null);
                }}
              >
                <IoIosAddCircle size={24} />
              </button>
            </div>
          </div>

          {/*  */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Total Orders</h3>
              <p className="text-2xl font-bold">150</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold">$250,000</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Pending Orders</h3>
              <p className="text-2xl font-bold">20</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Delivered Orders</h3>
              <p className="text-2xl font-bold">120</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto scrollbar-hide">
            <table className="w-full border-collapse overflow-x-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Order No</th>
                  <th className="p-3 text-left">Site</th>
                  <th className="p-3 text-left">Order Date</th>
                  <th className="p-3 text-left">Total Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((order, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{order.orderNo}</td>
                    <td className="p-3">{order.site}</td>
                    <td className="p-3">{order.orderDate}</td>
                    <td className="p-3">{order.totalAmount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-4">
                      <button
                        className=""
                        onClick={() => handleEdit(order)}
                      >
                        <FaEdit size={22} color="green" />
                      </button>
                      <button
                        className=""
                        onClick={() => handleDelete(order.id)}
                      >
                        <MdDeleteForever size={26} color="red" />
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
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 bg-gray-300 rounded-4xl shadow-lg disabled:opacity-50"
            >
              <GrLinkPrevious size={18} color="blue" />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-300 text-gray-700 p-2.5 rounded-4xl shadow-lg "
            >
              <GrLinkNext size={18} color="blue" />
            </button>
          </div>
        </div>
        {isAddModalOpen && (
          <AddModal
            onClose={() => setIsAddModalOpen(false)}
            onSave={isEdit ? handleEditSave : handleAdd}
            item={currentItem}
            isEdit={isEdit}
          />
        )}
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
    </div>
  );
};


const AddModal = ({ item, isEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState(isEdit ? item : { name: "", category: "", brand: "", quantity: "", price: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
      <div className="bg-white px-5 py-8 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-[75vh] md:h-[80vh] md:mt-12 overflow-auto">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? "Edit Product" : "Add Product"}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className='space-y-4'
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

export default Purchase;