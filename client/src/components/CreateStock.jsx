import React, { useState } from 'react';
import axios from 'axios'

const CreateStock = ({ item, isEdit, onClose, onSave }) => {
    const [formData, setFormData] = useState(isEdit ? item : { name: "", category: "", brand: "", quantity: "", price: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // onSave(formData);
        try {
            console.log(formData)
            const response = await axios.post('/api/v1/stock', formData);
            console.log(response)
            onClose();
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div >
            <form
                onSubmit={handleSubmit}
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
    );
};

export default CreateStock