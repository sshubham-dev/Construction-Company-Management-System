import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable';
import CreateStock from './CreateStock';
import Modal from './Modal';
import moment from 'moment';



const CreatePurchaseRequest = ({ onClose, id, index }) => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        site: '',
        reqDate: '',
        createdBy: '',
        requirementFor: '',
        category: '',
        requirement: [{
            item: '',
            request: {
                quantity: '',
                unit: '',
                remarks: '',
            },
            approved: {
                quantity: '',
                unit: '',
                remarks: '',
            },
        }],
    });
    const [materials, setMaterial] = useState([]);
    const [categories, setCategory] = useState([]);
    const [sites, setSite] = useState([]);
    const [orderFor, setOrderFor] = useState([])
    const [createModal, setCreateModal] = useState(false)
    const units = ['SQFT', 'RFT', 'LUMSUM', 'NOS', 'FIXED', 'RMT', 'SQMT', 'CUM', 'BAG', 'KG', 'TONES', 'LITERS'];
    const [requirementToEdit, setRequirementToEdit] = useState({ id: '', index: '' });
    const [requirement, setRequirement] = useState({
        item: '',
        request: {
            quantity: '',
            unit: '',
            remarks: '',
        },
        approved: {
            quantity: '',
            unit: '',
            remarks: '',
        },
    });
    const [purchaseReqToEdit, setPurchaseReqToEdit] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const [item, setItem] = useState('')

    useEffect(() => {
        if (id && index !== undefined) {
            setRequirementToEdit({ id, index });
            fetchPurchaseDetail(id, index);
        } else if (id) {
            setPurchaseReqToEdit(id);
            fetchPurchaseRequest(id);
        }
    }, [id, index]);

    useEffect(() => {
        const fetchSite = async () => {
            try {
                const response = await axios.get('/api/v1/site');
                if (user.department === 'Site Supervisor' || user.department === 'Site Incharge') {
                    console.log(response.data)
                    const existingSites = user?.site;
                    console.log(existingSites)
                    let Sites = [];
                    for (let site of response.data) {
                        console.log(site)
                        if (existingSites?.map(existingSite => existingSite.id.includes(site._id))) {
                            console.log(site)
                            Sites.push(site);
                        }
                    }
                    setSite(Sites)
                } else {
                    setSite(response.data)
                }
            } catch (error) {
                console.error(error.message)
            }
        };
        const fetchCategory = async () => {
            try {
                const response = await axios.get('/api/v1/stock-group')
                setCategory(response.data);
                console.log(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchCategory()
        fetchSite();
    }, [user]);

    useEffect(() => {
        const selectedSite = sites.filter(site => site._id === formData.site)[0]
        console.log(selectedSite)
        console.log(selectedSite?.projectSchedule?.projectDetail)
        setOrderFor(selectedSite?.projectSchedule?.projectDetail)
        const fetchProjectSchedule = async () => {
            try {
                const projectScheduleData = await axios.get('/api/v1/project-schedule');
                console.log(projectScheduleData.data)
                const filteredProjectSchedules = projectScheduleData.data.filter((projectSchedule) => projectSchedule.site?.id._id === formData.site)[0]
                console.log(filteredProjectSchedules)
                setOrderFor(filteredProjectSchedules.projectDetail)
            } catch (error) {
                console.error(error);
            }
        }
        fetchProjectSchedule()
    }, [formData.site]);

    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                const response = await axios.get('/api/v1/stock')
                const stockByCategory = response.data.filter(item => item.category.name === formData.category)
                console.log(response.data);
                setMaterial(stockByCategory);
                console.log(stockByCategory);
            } catch (error) {
                console.error(error.message);
            }
        };
        fetchMaterial();
    }, [formData.category])

    const fetchPurchaseRequest = async (id) => {
        try {
            const response = await axios.get(`/api/v1/purchase-request/${id}`);
            console.log(response.data)
            setFormData({
                site: response.data.site.id._id,
                reqDate: response.data.reqDate,
                createdBy: response.data.createdBy,
                requirementFor: response.data.requirementFor,
                category: response.data.category,
                requirement: [{
                    item: '',
                    request: {
                        quantity: '',
                        unit: '',
                        remarks: '',
                    },
                    approved: {
                        quantity: '',
                        unit: '',
                        remarks: '',
                    },
                }],
            });
        } catch (error) {
            toast.error(error.message);
        }
    };

    const fetchPurchaseDetail = async (id, index) => {
        try {
            const response = await axios.get(`/api/v1/purchase-request/${id}`);
            const requirement = response.data.requirement[index];
            setRequirement({
                item: requirement.item,
                request: {
                    quantity: requirement.request.quantity,
                    unit: requirement.request.unit,
                    remarks: requirement.request.remarks,
                },
                approved: {
                    quantity: requirement.approved.quantity,
                    unit: requirement.approved.unit,
                    remarks: requirement.approved.remarks,
                },
            })
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleNext = () => {
        setFormData((prevState) => {
            const updatedRequirement = [...prevState.requirement];

            // If current step is a new one, push an empty object
            if (step === updatedRequirement.length) {
                updatedRequirement.push({
                    item: '',
                    request: {
                        quantity: '',
                        unit: '',
                        remarks: '',
                    },
                    approved: {
                        quantity: '',
                        unit: '',
                        remarks: '',
                    },
                });
            }

            return { ...prevState, requirement: updatedRequirement };
        });

        setStep((prevStep) => prevStep + 1);
    };

    const handlePrevious = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleEdit = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setRequirement(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                }
            }));
        } else {
            setRequirement(prev => ({
                ...prev,
                [field]: value
            }));
        }

    };

    const handleChange = (name, value) => {
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleRequirementChange = (field, value) => {
        setFormData(prevState => {
            const updatedRequirement = [...prevState.requirement];

            // Determine if the field is inside "request" or "approved"
            if (field.includes('.')) {
                const [parent, key] = field.split('.');
                updatedRequirement[step - 1] = {
                    ...updatedRequirement[step - 1],
                    [parent]: {
                        ...updatedRequirement[step - 1][parent],
                        [key]: value,
                    },
                };
            } else {
                updatedRequirement[step - 1] = {
                    ...updatedRequirement[step - 1],
                    [field]: value,
                };
            }

            return { ...prevState, requirement: updatedRequirement };
        });
    };

    const handleCreateNewMaterial = async (newItemName) => {
        setCreateModal(true)
        setItem({ name: newItemName })
    };

    const handleReset = () => {
        setFormData({
            site: '',
            reqDate: '',
            createdBy: '',
            requirementFor: '',
            category: '',
            requirement: [{
                item: '',
                request: {
                    quantity: '',
                    unit: '',
                    remarks: '',
                },
                approved: {
                    quantity: '',
                    unit: '',
                    remarks: '',
                },
            }],
        });
        setStep(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData)
        try {
            if (purchaseReqToEdit) {
                const response = await axios.put(`/api/v1/purchase-request/${purchaseReqToEdit}`, formData);
                toast.success(response.data.message);
                onClose()
            } else if (requirementToEdit.id && requirementToEdit.index !== undefined) {
                console.log(requirement)
                const response = await axios.put(`/api/v1/purchase-request/${requirementToEdit.id}/requirement/${requirementToEdit.index}`, requirement);
                toast.success(response.data.message);
                // onClose()
            } else {
                const response = await axios.post('/api/v1/purchase-request', formData);
                toast.success(response.data.message);
                onClose()
            }
        } catch (error) {
            console.error('Error submitting purchase request:', error.message);
            toast.error(error.message);
        }
    };

    return (
        <div>
            <form className="max-w-xl mx-auto" onSubmit={handleSubmit}>
                {requirementToEdit.index !== undefined && requirementToEdit.id ? (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-600 mt-4">Material</label>
                            <CreatableSelect
                                value={{ value: requirement?.item, label: requirement?.item }}
                                onChange={(selectedOption) => handleEdit('item', selectedOption.value)}
                                onCreateOption={(selectedOption) => handleRequirementChange('item', selectedOption)} // New item added
                                options={materials.map(material => ({ value: material.name, label: material.name }))}
                                placeholder="Select or Add New Material"
                            />
                        </div>

                        <h3 className='mb-4 mt-6 font-bold text-lg'>Requested Material</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-600 mt-4">Quantity</label>
                            <input
                                type="number"

                                value={requirement?.request.quantity || ''}
                                onChange={(e) => handleEdit('request.quantity', e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-600 mt-4">Unit: {requirement?.request.unit}</label>
                            <select
                                value={requirement?.request.unit || ''}
                                onChange={(e) => handleEdit('request.unit', e.target.value)}
                                className="border p-2 rounded w-full"
                            >
                                <option value="">Select a Unit</option>
                                {(materials.find(m => m.name === requirement?.item)?.unit || units).map((unit, index) => (
                                    <option key={index} value={unit}>{unit}</option>
                                ))}

                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-600 mt-4">Remarks</label>
                            <input
                                type="text"
                                value={requirement?.request.remarks || ''}
                                onChange={(e) => handleEdit('request.remarks', e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                        </div>

                        {user.department === 'Accountant' && (
                            <>
                                <h3 className='mb-4 mt-6 font-bold text-lg'>Approved Material</h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-600 mt-4">Quantity</label>
                                    <input
                                        type="number"
                                        value={requirement?.approved.quantity || ''}
                                        onChange={(e) => handleEdit('approved.quantity', e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-600 mt-4">Unit</label>
                                    <select
                                        value={requirement?.approved.unit || ''}
                                        onChange={(e) => handleEdit('approved.unit', e.target.value)}
                                        className="border p-2 rounded w-full"
                                    >
                                        <option value="">Select a Unit</option>
                                        {(materials.find(m => m.name === requirement?.item)?.unit || units).map((unit, index) => (
                                            <option key={index} value={unit}>{unit}</option>
                                        ))}

                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-600 mt-4">Remarks</label>
                                    <input
                                        type="text"
                                        value={requirement?.approved.remarks || ''}
                                        onChange={(e) => handleEdit('approved.remarks', e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <button type="button" onClick={handleReset} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600">Reset</button>
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 ml-6 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Submit
                            </button>
                        </div>
                    </>) : (<>
                        {step === 0 && (
                            <>
                                <div className="mb-4">
                                    <label htmlFor="site" className="block text-sm font-semibold text-gray-600">Site</label>
                                    <select
                                        name="site"
                                        value={formData.site}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        onChange={(e) => handleChange('site', e.target.value)}>
                                        <option>Select Site</option>
                                        {sites.map((site, index) => (
                                            <option key={index} value={site._id}>{site.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="reqDate" className="block text-sm font-semibold text-gray-600">Required Date: {moment(formData.reqDate).format('DD-MM-YYYY')}</label>
                                    <input
                                        type="date"
                                        value={formData.reqDate}
                                        onChange={(e) => handleChange('reqDate', e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="category" className="block text-sm font-semibold text-gray-600">Material Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={(e) => handleChange('category', e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                        <option value="">Select A Category</option>
                                        {categories.map((category, index) => (
                                            <option key={index} value={category.name}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="requirementFor" className="block text-sm font-semibold text-gray-600">Requirement For:</label>
                                    <select
                                        name="requirementFor"
                                        value={formData.requirementFor}
                                        onChange={(e) => handleChange('requirementFor', e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                        <option>Requirement For</option>
                                        {orderFor?.map((work, index) => (
                                            <option key={index} value={work.workDetail}>{work.workDetail}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="button" onClick={() => setStep(step + 1)} className="bg-blue-500 text-white p-2 rounded">Add Requirement</button>
                            </>
                        )}

                        {step > 0 && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mt-4">Material</label>
                                <CreatableSelect
                                    value={{ value: formData.requirement[step - 1]?.item, label: formData.requirement[step - 1]?.item }}
                                    onChange={(selectedOption) => handleRequirementChange('item', selectedOption.value)}
                                    onCreateOption={(selectedOption) => handleRequirementChange('item', selectedOption)} // New item added
                                    options={materials.map(material => ({ value: material.name, label: material.name }))}
                                    placeholder="Select or Add New Material"
                                />
                                {/* <Select
                            value={{ value: formData.requirement[step - 1]?.item, label: formData.requirement[step - 1]?.item }}
                            onChange={(selectedOption) => handleRequirementChange('item', selectedOption.value)}
                            options={materials.map(material => ({ value: material.name, label: material.name }))}
                            placeholder="Select Material"
                        /> */}

                                <label className="block text-sm font-semibold text-gray-600 mt-4">Quantity</label>
                                <input
                                    type="number"

                                    value={formData.requirement[step - 1]?.request.quantity || ''}
                                    onChange={(e) => handleRequirementChange('request.quantity', e.target.value)}
                                    className="border p-2 rounded w-full"
                                />

                                <label className="block text-sm font-semibold text-gray-600 mt-4">Unit</label>
                                <select
                                    value={formData.requirement[step - 1]?.request.unit || ''}
                                    onChange={(e) => handleRequirementChange('request.unit', e.target.value)}
                                    className="border p-2 rounded w-full"
                                >
                                    <option value="">Select a Unit</option>
                                    {(materials.find(m => m.name === formData.requirement[step - 1]?.item)?.unit || units).map((unit, index) => (
                                        <option key={index} value={unit}>{unit}</option>
                                    ))}

                                </select>

                            </div>
                        )}

                        <div className="mt-5">
                            {step > 0 && (
                                <div className='flex justify-between '>
                                    <button type="button" onClick={handlePrevious} className="bg-gray-500 text-white p-2 rounded">Previous</button>
                                    <button type="button" onClick={handleReset} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600">Reset</button>
                                    <button type="submit" className="bg-green-500 text-white p-2 rounded">Submit</button>
                                    <button type="button" onClick={handleNext} className="bg-blue-500 text-white p-2 rounded">Next</button>
                                </div>
                            )}
                        </div>
                    </>)}
            </form>
            <Toaster position="top-right" reverseOrder={false} />
            <Modal onClose={() => setCreateModal(false)} isOpen={createModal}>
                <CreateStock onClose={() => setCreateModal(false)} item={item} />
            </Modal>
        </div >
    );
};

export default CreatePurchaseRequest;