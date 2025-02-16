import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import Select from 'react-select';

axios.defaults.withCredentials = true;

const CreateReturnOrder = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    supplier: '',
    site: '',
    returnOrderNo: '',
    createdBy: '',
    itemType: '',
    returnable: [{
      item: '',
      quantity: '',
      unit: '',
    }],
  });

  const [returnable, setReturnable] = useState({
    item: '',
    quantity: '',
    unit: '',
  });

  const [data, setData] = useState({
    supplier: '',
    site: '',
    createdBy: '',
  });

  const [items, setItem] = useState([]);
  const [sites, setSite] = useState([]);
  const [suppliers, setSupplier] = useState([]);
  const units = ['SQFT', 'RFT', 'LUMSUM', 'NOS', 'FIXED', 'RMT', 'SQMT', 'CUM', 'BAG', 'KG', 'TONES', 'LITERS'];
  const [returnableToEdit, setReturnableToEdit] = useState({ id: '', index: '' });
  const [returnOrderToEdit, setReturnOrderToEdit] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { id, index } = useParams();

  useEffect(() => {
    if (id && index) {
      setReturnableToEdit({ id, index });
      fetchReturnOrder(id, index);
    } else if (id && !index) {
      setReturnOrderToEdit(id);
      fetchReturnOrder(id);
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

    const fetchSupplier = async () => {
      try {
        const supplierData = await axios.get('/api/v1/Supplier');
        setSupplier(supplierData.data);
      } catch (error) {
        console.error(error.message);
      }
    };

    const fetchItem = async () => {
      try {
        const title = 'Return Order';
        const data = await axios.post('/api/v1/work-details/name', { title });
        const item = data.data.description.flat();
        setItem(item);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchSite();
    fetchSupplier();
    fetchItem();
  }, [user]);

  const fetchReturnOrder = async (id, index) => {
    try {
      const response = await axios.get(`/api/v1/return-order/${id}`);
      if (id && index) {
        const returnableItem = response.data.returnable[index];
        setReturnable(returnableItem);
      } else if (id && !index) {
        setData({
          site: response.data.site.name,
          supplier: response.data.supplier.name,
          createdBy: response.data.createdBy,
        });
        setFormData({
          supplier: response.data.supplier._id,
          site: response.data.site._id,
          returnOrderNo: response.data.returnOrderNo,
          createdBy: response.data.createdBy,
          itemType: response.data.itemType,
          returnable: response.data.returnable,
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleUpdate = (field, value) => {
    setReturnable(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step < formData.returnable.length) {
      setStep(step + 1);
    } else {
      setFormData(prevState => ({
        ...prevState,
        returnable: [...prevState.returnable, { item: '', quantity: '', unit: '' }],
      }));
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleReturnableChange = (field, value) => {
    setFormData(prevState => {
      const updatedReturnable = [...prevState.returnable];
      updatedReturnable[step] = { ...updatedReturnable[step], [field]: value };
      return { ...prevState, returnable: updatedReturnable };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (returnOrderToEdit) {
        const response = await axios.put(`/api/v1/return-order/${returnOrderToEdit}`, formData);
        toast.success(response.data.message);
        navigate(-1);
      } else if (returnableToEdit.id && returnableToEdit.index) {
        const response = await axios.put(`/api/v1/return-order/${returnableToEdit.id}/returnable/${returnableToEdit.index}`, returnable);
        toast.success(response.data.message);
        navigate(-1);
      } else {
        const response = await axios.post('/api/v1/return-order/create', formData);
        toast.success(response.data.message);
        navigate(-1);
      }
    } catch (error) {
      console.error('Error submitting return order:', error.message);
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
                  <option>{returnOrderToEdit ? data.site : 'Select Site'}</option>
                  {sites.map((site) => (
                    <option key={site._id} value={site._id}>{site.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="returnOrderNo" className="block text-sm font-semibold text-gray-600">Return Order No</label>
                <input
                  type="text"
                  name="returnOrderNo"
                  value={formData.returnOrderNo}
                  onChange={(e) => handleChange('returnOrderNo', e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="itemType" className="block text-sm font-semibold text-gray-600">Item Type</label>
                <input
                  type="text"
                  name="itemType"
                  value={formData.itemType}
                  onChange={(e) => handleChange('itemType', e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
            </>
          )}

          {step > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mt-4">Item</label>
              <Select
                value={{ value: formData.returnable[step - 1]?.item, label: formData.returnable[step - 1]?.item }}
                onChange={(selectedOption) => handleReturnableChange('item', selectedOption.value)}
                options={items.map(item => ({ value: item.work, label: item.work }))}
                placeholder="Select Item"
              />
              <label className="block text-sm font-semibold text-gray-600 mt-4">Quantity</label>
              <input
                type="number"
                value={formData.returnable[step - 1]?.quantity || ''}
                onChange={(e) => handleReturnableChange('quantity', e.target.value)}
                className="border p-2 rounded w-full"
              />
              <label className="block text-sm font-semibold text-gray-600 mt-4">Unit</label>
              <select
                value={formData.returnable[step - 1]?.unit || ''}
                onChange={(e) => handleReturnableChange('unit', e.target.value)}
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

export default CreateReturnOrder;