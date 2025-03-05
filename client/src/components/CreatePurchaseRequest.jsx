import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import axios from 'axios';

const CreatePurchaseRequest = ({ onClose }) => {
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
    const [sites, setSite] = useState([]);
    const units = ['SQFT', 'RFT', 'LUMSUM', 'NOS', 'FIXED', 'RMT', 'SQMT', 'CUM', 'BAG', 'KG', 'TONES', 'LITERS'];
    const [requirementToEdit, setRequirementToEdit] = useState({ id: '', index: '' });
    const [purchaseReqToEdit, setPurchaseReqToEdit] = useState(null);
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { id, index } = useParams();

    useEffect(() => {
        if (id && index) {
            setRequirementToEdit({ id, index });
            fetchPurchaseOrder(id, index);
        } else if (id && !index) {
            setPurchaseReqToEdit(id);
            fetchPurchaseOrder(id);
        }
    }, [id, index]);

    useEffect(() => {
        const fetchSite = async () => {
            try {
                const response = await axios.get('/api/v1/site');
                const filteredSites = user.department === 'Site Supervisor' || user.department === 'Site Incharge'
                    ? response.data.filter(site => user.site.includes(site._id))
                    : response.data;
                setSite(filteredSites);
            } catch (error) {
                console.error(error.message);
            }
        };

        const fetchMaterial = async () => {
            try {
                const title = 'Purchase Order';
                const data = await axios.post('/api/v1/work-details/name', { title });
                const material = data.data.description.flat();
                setMaterial(material);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchSite();
        fetchMaterial();
    }, [user]);

    const fetchPurchaseOrder = async (id, index) => {
        try {
            const response = await axios.get(`/api/v1/purchase-request/${id}`);
            if (id && index) {
                const requirement = response.data.requirement[index];
                setFormData(prevState => ({
                    ...prevState,
                    requirement: [{ ...requirement }]
                }));
            } else if (id && !index) {
                setFormData({
                    site: response.data.site._id,
                    reqDate: response.data.reqDate,
                    createdBy: response.data.createdBy,
                    requirementFor: response.data.requirementFor,
                    category: response.data.category,
                    requirement: response.data.requirement,
                });
            }
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
                {step === 0 && (
                    <>
                        <div className="mb-4">
                            <label htmlFor="site" className="block text-sm font-semibold text-gray-600">Site</label>
                            <select
                                name="site"
                                value={formData.site}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                onChange={(e) => handleChange('site', e.target.value)}>
                                <option>{purchaseReqToEdit ? formData.site : 'Select Site'}</option>
                                {sites.map((site) => (
                                    <option key={site._id} value={site._id}>{site.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="reqDate" className="block text-sm font-semibold text-gray-600">Required Date</label>
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
                                <option value="hardware">Hardware</option>
                                <option value="plumbing">Plumbing</option>
                                <option value="electrical">Electrical</option>
                                <option value="cement">Cement</option>
                                <option value="steel">Steel</option>
                                <option value="shuttering">Shuttering Material</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="requirementFor" className="block text-sm font-semibold text-gray-600">Requirement For</label>
                            <select
                                name="requirementFor"
                                value={formData.requirementFor}
                                onChange={(e) => handleChange('requirementFor', e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                <option>Requirement For</option>
                            </select>
                        </div>
                        <button type="button" onClick={() => setStep(step + 1)} className="bg-blue-500 text-white p-2 rounded">Add Requirement</button>
                    </>
                )}

                {step > 0 && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mt-4">Material</label>
                        <Select
                            value={{ value: formData.requirement[step - 1]?.item, label: formData.requirement[step - 1]?.item }}
                            onChange={(selectedOption) => handleRequirementChange('item', selectedOption.value)}
                            options={materials.map(material => ({ value: material.work, label: material.work }))}
                            placeholder="Select Material"
                        />
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
                            {units.map((unit, index) => (
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
            </form>
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
};

export default CreatePurchaseRequest;