import React, { useState, useEffect } from 'react';
import axios from 'axios'
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
  const [items, setitem] = useState([]);
  const [sites, setSite] = useState([]);
  const [suppliers, setSupplier] = useState([]);
  const [categorys, setCategory] = useState([]);
  const status = ['Delivered', 'Pending', 'Returned'];
  const units = ['SQFT', 'RFT', 'LUMSUM', 'NOS', 'FIXED', 'RMT', 'SQMT', 'CUM', 'BAG', 'KG', 'TONES', 'LITERS'];
  const [returnableToEdit, setReturnableToEdit] = useState({
    id: '',
    index: '',
  });
  const [returnOrderToEdit, setreturnOrderToEdit] = useState(null);
  const navigate = useNavigate();
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const { id } = useParams();
  const { index } = useParams();
  const { from } = useParams();
  console.log(from)


  useEffect(() => {
    if (id && index) {
      setReturnableToEdit({ id, index })
      fetchPurchaseOrder(id, index);
    } else if (id && !index) {
      setreturnOrderToEdit(id)
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

    const fetchSupplier = async () => {
      try {
        const supplierData = await axios.get('/api/v1/Supplier');
        setSupplier(supplierData.data);
      } catch (error) {
        console.error(error.message)
      }
    }

    const fetchitem = async () => {
      try {
        const title = 'Purchase Order';
        const data = await axios.post('/api/v1/work-details/name', {
          title
        });
        // console.log(data.data)
        let item = [];
        for (let i = 0; i < data.data.description.length; i++) {
          item = item.concat(data.data.description[i]);
        }
        console.log(item)
        setitem(item)
      } catch (error) {
        console.error(error.message)
      }
    }

    fetchSite();
    fetchSupplier();
    fetchitem();
  }, []);


  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleUpdate = (field, value) => {
    setReturnable({
      ...returnable,
      [field]: value
    })
  }

  const handleNext = () => {
    if (step < formData.returnable.length) {
      setStep(step + 1);
    } else {
      setFormData({
        ...formData,
        returnable: [...formData.returnable, { item: '', quantity: '', unit: '' }],
      });
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleReturnableChange = (field, value) => {
    setFormData(prevState => {
        let updatedReturnable = [...prevState.returnable];

        // Ensure the current requirement entry exists
        if (!updatedReturnable[step - 1]) {
          updatedReturnable[step - 1] = { material: '', reqQuantity: '', unit: '' };
        }

        updatedReturnable[step - 1] = { ...updatedReturnable[step - 1], [field]: value };

        return { ...prevState, returnable: updatedReturnable };
    });
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (returnOrderToEdit) {
        const response = await axios.put(`/api/v1/purchase-order/${returnOrderToEdit}`, formData);
        toast.success(response.data.message)
        navigate(-1)
      } else if (returnableToEdit.id && returnableToEdit.index) {
        console.log(returnable)
        const response = await axios.put(`/api/v1/purchase-order/${returnableToEdit.id}/returnable/${returnableToEdit.index}`, returnable);
        toast.success(response.data.message)
        navigate(-1)
      } else {
        console.log(formData)
        const response = await axios.post('/api/v1/purchase-order/create', formData);
        toast.success(response.data.message)
        navigate(-1)
      }
    } catch (error) {
      console.error('Error submitting work order:', error.message);
      toast.error(error.message)
    }
  };

  if (returnableToEdit.id && returnableToEdit.index) {
    return (
      <div >
        <Header category="Page" title="Return Order" />
        <section className="flex items-center justify-center max-h-screen mb-16 mt-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded px-8 pt-6 pb-6 mb-2 w-full max-w-md">

            <div className='mb-4'>
              <label
                htmlFor='item'
                className="block text-sm font-semibold text-gray-600 mb-1">
                Item
              </label>
              <Select
                value={{ value: returnable.item, label: returnable.item }}
                onChange={(selectedOption) => handleUpdate('item', selectedOption.value)}
                options={items.map(item => ({ value: item.work, label: item.work }))}
                placeholder={returnableToEdit ? returnable.item : 'item'}
              />
            </div>

            <div className='mb-4'>
              <label
                htmlFor='quantity'
                className="block text-sm font-semibold text-gray-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={returnable.quantity}
                onChange={(e) => handleUpdate('quantity', e.target.value)}
                placeholder="Quantity"
                className="border p-2 rounded w-full"
              />
            </div>

            <div className='mb-4'>
              <label
                htmlFor='unit'
                className="block text-sm font-semibold text-gray-600 mb-1">
                Unit
              </label>
              <select
                value={returnable.unit}
                onChange={(e) => handleUpdate('unit', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option>{returnableToEdit ? returnable.unit : 'Select a Unit'}</option>
                {units.map((unit, index) => (
                  <option key={index} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 mt-4 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Update returnable
            </button>

          </form>
        </section>
      </div>
    )
  } else {
    return (
      <div >
        <Header category="Page" title="Create Request Order" />
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
                    <option>{returnOrderToEdit ? data?.site : 'Site'}</option>
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
                  <label htmlFor="itemCategory" className="block text-sm font-semibold text-gray-600">
                    Item Category
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
                    <option value="shuttering">Shuttering item</option>
                  </select>
                </div>
              </>)}

            {step > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mt-4">Item</label>
                <Select
                  value={{ value: formData.returnable[step - 1]?.item, label: formData.returnable[step - 2]?.item }}
                  onChange={(selectedOption) => handleReturnableChange('item', selectedOption.value)}
                  options={items.map(item => ({ value: item.work, label: item.work }))}
                  placeholder="Select item"
                />
                <label className="block text-sm font-semibold text-gray-600 mt-4">Quantity</label>
                <input
                  type="number"
                  value={formData.returnable[step - 1]?.reqQuantity || ''}
                  onChange={(e) => handleReturnableChange('reqQuantity', e.target.value)}
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
      </div >
    );
  }
}

export default CreateReturnOrder