import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import axios from 'axios'

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
    const [categorys, setCategory] = useState([]);
    const units = ['SQFT', 'RFT', 'LUMSUM', 'NOS', 'FIXED', 'RMT', 'SQMT', 'CUM', 'BAG', 'KG', 'TONES', 'LITERS'];
    const [requirementToEdit, setRequirementToEdit] = useState({
        id: '',
        index: '',
    });
    const [purchaseReqToEdit, setPurchaseReqToEdit] = useState(null);
    const navigate = useNavigate();
    const { user, isLoggedIn } = useSelector((state) => state.auth);
    const { id } = useParams();
    const { index } = useParams();
    useEffect(() => {
        if (id && index) {
            setRequirementToEdit({ id, index })
            fetchPurchaseOrder(id, index);
        } else if (id && !index) {
            setPurchaseReqToEdit(id)
            fetchPurchaseOrder(id)
        }
    }, [id, index]);

    useEffect(() => {

        const fetchSite = async () => {
            try {
                const response = await axios.get('/api/v1/site');
                if (user.department === 'Site Supervisor' || user.department === 'Site Incharge') {
                    const existingSites = user?.site;
                    let Sites = [];
                    for (let site of response.data) {
                        if (existingSites.includes(site._id)) {
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

        const fetchMaterial = async () => {
            try {
                const title = 'Purchase Order';
                const data = await axios.post('/api/v1/work-details/name', {
                    title
                });
                // console.log(data.data)
                let material = [];
                for (let i = 0; i < data.data.description.length; i++) {
                    material = material.concat(data.data.description[i]);
                }
                console.log(material)
                setMaterial(material)
            } catch (error) {
                console.error(error.message)
            }
        }

        fetchSite();
        fetchMaterial();
    }, []);

    const handleNext = () => {
        if (step < formData.requirement.length) {
            setStep(step + 1);
        } else {
            setFormData({
                ...formData,
                requirement: [...formData.requirement, { material: '', reqQuantity: '', unit: '' }],
            });
            setStep(step + 1);
        }
    };

    const handlePrevious = () => {
        if (step > 0) setStep(step - 1);
    };
    
    const handleUpdate = (field, value) => {
        setRequirement({
            ...requirement,
            [field]: value
        })
    }

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleRequirementChange = (field, value) => {
        setFormData(prevState => {
            let updatedRequirement = [...prevState.requirement];
    
            // Ensure the current requirement entry exists
            if (!updatedRequirement[step - 1]) {
                updatedRequirement[step - 1] = { material: '', reqQuantity: '', unit: '' };
            }
    
            updatedRequirement[step - 1] = { ...updatedRequirement[step - 1], [field]: value };
    
            return { ...prevState, requirement: updatedRequirement };
        });
    };
    

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        toast.success('Purchase Request Created Successfully');
        console.log(formData)
        // navigate('/purchase-requests');
        setFormData({
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
        })
    };

    return (
        <div >
            <Header category="Page" title="Create Purchase Order" />
            <div className="container mx-auto mt-4 mb-16">
                <form className="max-w-xl mx-auto " onSubmit={handleSubmit}>
                    {step === 0 && (
                        <>
                            <div className="mb-4">
                                <label htmlFor="site" className="block text-sm font-semibold text-gray-600">
                                    Site
                                </label>
                                <select
                                    name="site"
                                    value={formData.site}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    onChange={(e) => handleChange('site', e.target.value)}>
                                    <option>{purchaseReqToEdit ? data?.site : 'Site'}</option>
                                    {sites.map((site) => (
                                        <option key={site._id} value={site._id}>
                                            {site.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor='reqDate'
                                    className="block text-sm font-semibold text-gray-600">
                                    Required Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.reqDate}
                                    onChange={(e) => handleChange('reqDate', e.target.value)}
                                    className="border p-2 rounded w-full"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="materialCategory" className="block text-sm font-semibold text-gray-600">
                                    Material Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="">Select A Category</option>
                                    <option value="hardware">Hardware</option>
                                    <option value="plumbing pipe">Plumbing Pipe</option>
                                    <option value="plumbing pipe">Plumbing</option>
                                    <option value="electrical pipe">Electrical Pipe</option>
                                    <option value="electrical pipe">Electrical</option>
                                    <option value="cememt">Cement</option>
                                    <option value="steel">Steel</option>
                                    <option value="shuttering">Shuttering Material</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="requirementFor" className="block text-sm font-semibold text-gray-600">
                                    Requirement For
                                </label>
                                <select
                                    name="requirementFor"
                                    value={formData.requirementFor}
                                    onChange={(e) => handleChange('requirementFor', e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    <option>Requirement For</option>
                                </select>
                            </div>
                        </>)}

                    {step > 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mt-4">Material</label>
                            <Select
                                value={{ value: formData.requirement[step - 1]?.material, label: formData.requirement[step - 2]?.material }}
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
        </div >
    );
};

export default CreatePurchaseRequest;