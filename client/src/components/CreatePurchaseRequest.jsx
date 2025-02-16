import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import axios from 'axios';

const CreatePurchaseRequest = () => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        site: '',
        reqDate: '',
        createdBy: '',
        requirementFor: '',
        category: '',
        requirement: [{
            material: '',
            reqQuantity: '',
            unit: '',
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
        if (step < formData.requirement.length) {
            setStep(step + 1);
        } else {
            setFormData(prevState => ({
                ...prevState,
                requirement: [...prevState.requirement, { material: '', reqQuantity: '', unit: '' }],
            }));
            setStep(step + 1);
        }
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
            updatedRequirement[step] = { ...updatedRequirement[step], [field]: value };
            return { ...prevState, requirement: updatedRequirement };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (purchaseReqToEdit) {
                const response = await axios.put(`/api/v1/purchase-request/${purchaseReqToEdit}`, formData);
                toast.success(response.data.message);
                navigate(-1);
            } else {
                const response = await axios.post('/api/v1/purchase-request/create', formData);
                toast.success(response.data.message);
                navigate(-1);
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
                    </>
                )}

                {step > 0 && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mt-4">Material</label>
                        <Select
                            value={{ value: formData.requirement[step - 1]?.material, label: formData.requirement[step - 1]?.material }}
                            onChange={(selectedOption) => handleRequirementChange('material', selectedOption.value)}
                            options={materials.map(material => ({ value: material.work, label: material.work }))}
                            placeholder="Select Material"
                        />
                        <label className="block text-sm font-semibold text-gray-600 mt-4">Quantity</label>
                        <input
                            type="number"
                            value={formData.requirement[step - 1]?.reqQuantity || ''}
                            onChange={(e) => handleRequirementChange('reqQuantity', e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                        <label className="block text-sm font-semibold text-gray-600 mt-4">Unit</label>
                        <select
                            value={formData.requirement[step - 1]?.unit || ''}
                            onChange={(e) => handleRequirementChange('unit', e.target.value)}
                            className="border p-2 rounded w-full"
                        >
                            <option value="">Select a Unit</option>
                            {units.map((unit, index) => (
                                <option key={index} value={unit}>{unit}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="mt-5 flex justify-between">
                    {step > 0 && (
                        <button type="button" onClick={handlePrevious} className="bg-gray-500 text-white p-2 rounded">
                            Previous
                        </button>
                    )}
                    <button type="submit" className="bg-green-500 text-white p-2 rounded">
                        Submit
                    </button>
                    <button type="button" onClick={handleNext} className="bg-blue-500 text-white p-2 rounded">
                        Next
                    </button>
                </div>
            </form>
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
};

export default CreatePurchaseRequest;