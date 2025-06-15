import React, { useEffect, useState } from 'react';
import axios from 'axios'
import Select from "react-select";

const CreateStock = ({ item, isEdit, onClose, onSave }) => {
    console.log(item)
    const [formData, setFormData] = useState({
        name: item.name ? item.name : "",
        code: '',
        category: "",
        unit: [],
        openingStock: "",
        cp: "",
        sp: '',
        mp: '',
        gstRate: '',
    });

    const [groups, setGroup] = useState([]);
    const [workDetails, setWorkDetails] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const response = await axios.get('/api/v1/stock-group')
                setGroup(response.data)
                console.log(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        const fetchWorkDetails = async () => {
            try {
                const title = 'Unit';
                const workData = await axios.post('/api/v1/work-details/name', { title });
                setWorkDetails(workData.data.description);
            } catch (error) {
                console.log('Error fetching work details:', error.message);
            }
        };
        fetchWorkDetails()
        fetchGroup();
    }, [])

    // ✅ Fixed function to handle react-select
    const handleMultiSelect = (selected) => {
        const values = selected ? selected.map((opt) => opt.value) : [];
        setSelectedOptions(selected);
        setFormData((prev) => ({
            ...prev,
            unit: values, // Save only values inside the group state
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setFormData({
            name: "",
            code: '',
            category: "",
            unit: [],
            openingStock: "",
            cp: "",
            sp: '',
            mp: '',
            gstRate: '',
        })
        onClose();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // onSave(formData);
        try {
            console.log(formData)
            const response = await axios.post('/api/v1/stock', formData);
            console.log(response)
            handleReset();
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
                    <select
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="border rounded p-2 w-full">
                        <option value="">Stock Group</option>
                        {groups.map((group, index) => (
                            <option key={index} value={group._id}>{group.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-2">
                    <label htmlFor="code" className="block text-sm font-medium">
                        Code
                    </label>
                    <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                    />
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-medium">Unit: {formData.unit.join(", ")}</label>
                    <Select
                        options={workDetails.map((workDetail) => ({
                            value: workDetail.work,
                            label: workDetail.work,
                        }))}
                        isMulti
                        value={selectedOptions}
                        onChange={handleMultiSelect}
                    />
                </div>

                <div className="mb-2">
                    <label htmlFor="openingStock" className="block text-sm font-medium">
                        Opening Stock
                    </label>
                    <input
                        type="number"
                        id="openingStock"
                        name="openingStock"
                        value={formData.openingStock}
                        onChange={handleChange}
                        min='0'
                        className="border rounded p-2 w-full"
                    />
                </div>

                <div className="mb-2">
                    <label htmlFor="cp" className="block text-sm font-medium">
                        Cost Price
                    </label>
                    <input
                        type="number"
                        id="cp"
                        name="cp"
                        value={formData.cp}
                        onChange={handleChange}
                        min='0'
                        className="border rounded p-2 w-full"
                    />
                </div>

                <div className="mb-2">
                    <label htmlFor="sp" className="block text-sm font-medium">
                        Selling Price
                    </label>
                    <input
                        type="number"
                        id="sp"
                        name="sp"
                        value={formData.sp}
                        onChange={handleChange}
                        min='0'
                        className="border rounded p-2 w-full"
                    />
                </div>

                <div className="mb-2">
                    <label htmlFor="mp" className="block text-sm font-medium">
                        Market Price
                    </label>
                    <input
                        type="number"
                        id="mp"
                        name="mp"
                        value={formData.mp}
                        onChange={handleChange}
                        min='0'
                        className="border rounded p-2 w-full"
                    />
                </div>

                <div className="mb-2">
                    <label htmlFor="rate" className="block text-sm font-medium">
                        GST Rate %
                    </label>
                    <input
                        type="number"
                        id="gstRate"
                        name="gstRate"
                        value={formData.gstRate}
                        onChange={handleChange}
                        min='0'
                        className="border rounded p-2 w-full"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleReset}
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