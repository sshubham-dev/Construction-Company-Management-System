import React, { useState } from "react";

const sampleData = [
    { id: 1, name: "Apple iMac 27\"", category: "PC", brand: "Apple", quantity: 300, price: 2999 },
    { id: 2, name: "Apple iMac 50\"", category: "PC", brand: "Apple", quantity: 200, price: 1499 },
    { id: 3, name: "Apple iMac 27\"", category: "PC", brand: "Apple", quantity: 300, price: 2999 },
    { id: 4, name: "Apple iPhone 14", category: "Phone", brand: "Apple", quantity: 1237, price: 999 },
    { id: 5, name: "Apple iMac 20\"", category: "PC", brand: "Apple", quantity: 200, price: 1499 },
    { id: 6, name: "Apple 0\"", category: "PC", brand: "Apple", quantity: 200, price: 1499 },
    { id: 7, name: "Apple iPad Air", category: "Tablet", brand: "Apple", quantity: 4578, price: 1199 },
    { id: 8, name: "Xbox Series S", category: "Gaming/Console", brand: "Microsoft", quantity: 56, price: 299 },
    { id: 9, name: "Apple iPhone 14", category: "Phone", brand: "Apple", quantity: 1237, price: 999 },
    { id: 10, name: "Apple iPad Air", category: "Tablet", brand: "Apple", quantity: 4578, price: 1199 },
    { id: 11, name: "Apple iMac 20\"", category: "PC", brand: "Apple", quantity: 200, price: 1499 },
    { id: 12, name: "Xbox Series S", category: "Gaming/Console", brand: "Microsoft", quantity: 56, price: 299 },
];

const ModernTable = ({ options, feature}) => {
    const [data, setData] = useState(sampleData);
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
    const filteredData = data.filter(
        (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) &&
            (filters.category ? item.category === filters.category : true) &&
            (filters.brand ? item.brand === filters.brand : true) &&
            (filters.minPrice ? item.price >= filters.minPrice : true) &&
            (filters.maxPrice ? item.price <= filters.maxPrice : true)
    );

    const sortedData = [...filteredData].sort((a, b) => {
        if (sortConfig.key) {
            const valueA = a[sortConfig.key];
            const valueB = b[sortConfig.key];
            return sortConfig.direction === "asc"
                ? valueA > valueB
                    ? 1
                    : -1
                : valueA < valueB
                    ? 1
                    : -1;
        }
        return 0;
    });

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
        <div className="p-4">
            {/* Header with Search and Add */}
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search"
                    className="border rounded p-2 w-1/3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex flex-row gap-6">
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded"
                        onClick={() => {
                            setIsEdit(false);
                            setIsModalOpen(true);
                            setCurrentItem(null);
                        }}
                    >
                        + Add Product
                    </button>
                    <button
                        className="bg-gray-500 text-white py-2 px-4 rounded"
                        onClick={() => setIsFilterOpen(true)}
                    >
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto shadow-lg">
                <table className="w-full border-collapse bg-white">
                    <thead>
                        <tr className="bg-gray-100">
                            <th onClick={() => handleSort("name")} className="p-3">
                                Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                            </th>
                            <th onClick={() => handleSort("category")} className="p-3">
                                Category {sortConfig.key === "category" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                            </th>
                            <th onClick={() => handleSort("brand")} className="p-3">
                                Brand {sortConfig.key === "brand" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                            </th>
                            <th onClick={() => handleSort("quantity")} className="p-3">
                                Quantity {sortConfig.key === "quantity" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                            </th>
                            <th onClick={() => handleSort("price")} className="p-3">
                                Price {sortConfig.key === "price" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                            </th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-100">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3">{item.category}</td>
                                <td className="p-3">{item.brand}</td>
                                <td className="p-3">{item.quantity}</td>
                                <td className="p-3">${item.price}</td>
                                <td className="p-3 flex gap-2">
                                    <button
                                        className="bg-yellow-500 text-white p-2 rounded"
                                        onClick={() => handleEdit(item)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-500 text-white p-2 rounded"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between mt-4">
                <span>Page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="bg-gray-300 text-gray-700 p-2 rounded"
                    >
                        Previous
                    </button>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="bg-gray-300 text-gray-700 p-2 rounded"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Filter Modal */}
            {isFilterOpen && <FilterModal filters={filters} setFilters={applyFilters} onClose={() => setIsFilterOpen(false)} />}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <Modal
                    onClose={() => setIsModalOpen(false)}
                    onSave={isEdit ? handleEditSave : handleAdd}
                    item={currentItem}
                    isEdit={isEdit}
                />
            )}
        </div>
    );
};

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
                    <div className="mb-2">
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

export default ModernTable;
