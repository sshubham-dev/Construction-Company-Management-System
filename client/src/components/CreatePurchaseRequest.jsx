import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import axios from 'axios'

const CreatePurchaseRequest = () => {
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

    const handleUpdate = (field, value) => {
        setRequirement({
            ...requirement,
            [field]: value
        })
    }

    const handleAddWork = () => {
        setFormData({
            ...formData,
            requirement: [
                ...formData.requirement,
                {
                    material: '',
                    reqQuantity: '',
                    unit: '',
                },
            ],
        });
    };

    const handleRemoveWork = (index) => {
        const updatedRequirement = [...formData.requirement];
        updatedRequirement.splice(index, 1);
        setFormData({
            ...formData,
            requirement: updatedRequirement,
        });
    };

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleRequirementChange = (index, field, value) => {
        const updatedRequirement = [...formData.requirement];
        updatedRequirement[index][field] = value;
        setFormData({
            ...formData,
            requirement: updatedRequirement,
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

                    {purchaseReqToEdit ? '' :
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold mb-2">Material Details</h2>

                            {formData.requirement.map((item, index) => (
                                <div key={index} className="mb-4 p-4 border rounded">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <div>
                                            <label htmlFor={`work[${index}].material`} className="block text-sm font-semibold text-gray-600">
                                                Material
                                            </label>
                                            <Select
                                                value={{ value: item.material, label: item.material }}
                                                onChange={(selectedOption) => handleRequirementChange(index, 'material', selectedOption.value)}
                                                options={materials.map(material => ({ value: material.work, label: material.work }))}
                                                placeholder="Material"
                                            />
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <label
                                                htmlFor={`work[${index}].reqQuantity`}
                                                className="block text-sm font-semibold text-gray-600">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={item.reqQuantity}
                                                onChange={(e) => handleRequirementChange(index, 'reqQuantity', e.target.value)}
                                                placeholder="Quantity"
                                                className="border p-2 rounded w-full"
                                            />
                                        </div>

                                        {/* Unit */}
                                        <div>
                                            <label
                                                htmlFor={`work[${index}].unit`}
                                                className="block text-sm font-semibold text-gray-600">
                                                Unit
                                            </label>
                                            <select
                                                value={item.unit}
                                                onChange={(e) => handleRequirementChange(index, 'unit', e.target.value)}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                                <option>Select a Unit</option>
                                                {units.map((unit, index) => (
                                                    <option key={index} value={unit}>
                                                        {unit}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {formData.requirement.length > 1 && (
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveWork(index)}
                                                    className="bg-red-500 text-white p-2 mt-4 rounded"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddWork}
                                className="bg-blue-500 text-white p-2 rounded"
                            >
                                More Request
                            </button>
                        </div>
                    }
                    <button type="submit" className="bg-green-500 text-white p-2 rounded mt-2">
                        Create Purchase Request
                    </button>
                </form>
                <Toaster position="top-right" reverseOrder={false} />
            </div>
        </div>
    );
};

export default CreatePurchaseRequest;