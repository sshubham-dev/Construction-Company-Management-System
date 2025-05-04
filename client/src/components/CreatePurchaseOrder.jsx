import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Select from 'react-select';

axios.defaults.withCredentials = true;

const CreatePurchaseOrder = ({onClose, id, index}) => {
  const [formData, setFormData] = useState({
    supplier: '',
    site: '',
    purchaseOrderNo: '',
    createdBy: '',
    requirementFor: '',
    category: '',
    requirement: [{
      material: '',
      rate: '',
      quantity: '',
      unit: '',
      amount: '',
    }],
  });

  const [requirement, setRequirement] = useState({
    material: '',
    rate: '',
    quantity: '',
    unit: '',
    amount: '',
    status: '',
    slip: '',
  });

  const [data, setData] = useState({
    supplier: '',
    site: '',
    createdBy: '',
  });

  const [materials, setMaterial] = useState([]);
  const [sites, setSite] = useState([]);
  const [suppliers, setSupplier] = useState([]);

  const statusOptions = ['Delivered', 'Pending', 'Returned'];
  const units = ['SQFT', 'RFT', 'LUMSUM', 'NOS', 'FIXED', 'RMT', 'SQMT', 'CUM', 'BAG', 'KG', 'TONES', 'LITERS'];
  const [requirementToEdit, setRequirementToEdit] = useState({ id: '', index: '' });
  const [purchaseOrderToEdit, setPurchaseOrderToEdit] = useState(null);
  const { user } = useSelector((state) => state.auth);


  useEffect(() => {
    if (id && index) {
      setRequirementToEdit({ id, index });
      fetchPurchaseOrder(id, index);
    } else if (id && !index) {
      setPurchaseOrderToEdit(id);
      fetchPurchaseOrder(id);
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

    const fetchSupplier = async () => {
      try {
        const supplierData = await axios.get('/api/v1/Supplier');
        setSupplier(supplierData.data);
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
    fetchSupplier();
    fetchMaterial();
  }, [user]);

  const fetchPurchaseOrder = async (id, index) => {
    try {
      const response = await axios.get(`/api/v1/purchase-order/${id}`);
      if (id && index) {
        const require = response.data.requirement[index];
        setRequirement({
          material: require.material,
          rate: require.rate,
          quantity: require.quantity,
          unit: require.unit,
          amount: require.amount,
          status: require.status,
        });
      } else if (id && !index) {
        setData({
          site: response.data?.site.name,
          supplier: response.data?.supplier.name,
        });
        setFormData({
          supplier: response.data?.supplier._id,
          site: response.data?.site._id,
          purchaseOrderNo: response.data?.purchaseOrderNo,
          createdBy: response.data?.createdBy?._id,
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
    setRequirement(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleAddRequirement = () => {
    setFormData(prevState => ({
      ...prevState,
      requirement: [
        ...prevState.requirement,
        { material: '', rate: '', quantity: '', unit: '', amount: '' },
      ],
    }));
  };

  const handleRemoveRequirement = (index) => {
    const updatedRequirement = [...formData.requirement];
    updatedRequirement.splice(index, 1);
    setFormData(prevState => ({
      ...prevState,
      requirement: updatedRequirement,
    }));
  };

  const handleRequirementChange = (index, field, value) => {
    const updatedRequirement = [...formData.requirement];
    updatedRequirement[index][field] = value;
    setFormData(prevState => ({
      ...prevState,
      requirement: updatedRequirement,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      requirement: formData.requirement.map(detail => {
        const amount = parseFloat(detail.quantity) * parseFloat(detail.rate);
        return {
          ...detail,
          amount: isNaN(amount) ? '' : amount.toFixed(2),
        };
      }),
    };

    try {
      if (purchaseOrderToEdit) {
        const response = await axios.put(`/api/v1/purchase-order/${purchaseOrderToEdit}`, updatedFormData);
        toast.success(response.data.message);
        onClose()
      } else if (requirementToEdit.id && requirementToEdit.index) {
        const updatedDetail = {
          ...requirement,
          amount: parseFloat(requirement.quantity) * parseFloat(requirement.rate),
        };
        const response = await axios.put(`/api/v1/purchase-order/${requirementToEdit.id}/requirement/${requirementToEdit.index}`, updatedDetail);
        toast.success(response.data.message);
        onClose()
      } else {
        const response = await axios.post('/api/v1/purchase-order', updatedFormData);
        toast.success(response.data.message);
        onClose()
      }
    } catch (error) {
      console.error('Error submitting purchase order:', error.message);
      toast.error(error.message);
    }
  };

  return (
    <div>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-6 mb-2 w-full max-w-md">
          {requirementToEdit.id && requirementToEdit.index ? (
            <>
              <div className='mb-4'>
                <label htmlFor='material' className="block text-sm font-semibold text-gray-600 mb-1">Material</label>
                <Select
                  value={{ value: requirement.material, label: requirement.material }}
                  onChange={(selectedOption) => handleUpdate('material', selectedOption.value)}
                  options={materials.map(material => ({ value: material.work, label: material.work }))}
                  placeholder="Material"
                />
              </div>

              <div className='mb-4'>
                <label htmlFor='rate' className="block text-sm font-semibold text-gray-600 mb-1">Rate</label>
                <input
                  type="number"
                  value={requirement.rate}
                  onChange={(e) => handleUpdate('rate', e.target.value)}
                  placeholder="Rate"
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className='mb-4'>
                <label htmlFor='quantity' className="block text-sm font-semibold text-gray-600 mb-1">Quantity</label>
                <input
                  type="number"
                  value={requirement.quantity}
                  onChange={(e) => handleUpdate('quantity', e.target.value)}
                  placeholder="Quantity"
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className='mb-4'>
                <label htmlFor='unit' className="block text-sm font-semibold text-gray-600 mb-1">Unit</label>
                <select
                  value={requirement.unit}
                  onChange={(e) => handleUpdate('unit', e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option>Select a Unit</option>
                  {units.map((unit, index) => (
                    <option key={index} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div className='mb-4'>
                <label htmlFor='status' className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                <select
                  value={requirement.status}
                  onChange={(e) => handleUpdate('status', e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option>{requirement.status || 'Status'}</option>
                  {statusOptions.map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="bg-blue-500 hover:bg-blue-700 mt-4 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Update Requirement</button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="site" className="block text-sm font-semibold text-gray-600">Site</label>
                <select
                  name="site"
                  value={formData.site}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  onChange={(e) => handleChange('site', e.target.value)}>
                  <option>{purchaseOrderToEdit ? data?.site : 'Site'}</option>
                  {sites.map((site) => (
                    <option key={site._id} value={site._id}>{site.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="supplier" className="block text-sm font-semibold text-gray-600">Supplier</label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option>{purchaseOrderToEdit ? data?.supplier : 'Supplier'}</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-semibold text-gray-600">Material Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Select A Category</option>
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

              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Material Details</h2>
                {formData.requirement.map((item, index) => (
                  <div key={index} className="mb-4 p-4 border rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div>
                        <label htmlFor={`work[${index}].material`} className="block text-sm font-semibold text-gray-600">Material</label>
                        <Select
                          value={{ value: item.material, label: item.material }}
                          onChange={(selectedOption) => handleRequirementChange(index, 'material', selectedOption.value)}
                          options={materials.map(material => ({ value: material.work, label: material.work }))}
                          placeholder="Material"
                        />
                      </div>

                      <div>
                        <label htmlFor={`work[${index}].quantity`} className="block text-sm font-semibold text-gray-600">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleRequirementChange(index, 'quantity', e.target.value)}
                          placeholder="Quantity"
                          className="border p-2 rounded w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor={`work[${index}].rate`} className="block text-sm font-semibold text-gray-600">Rate</label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleRequirementChange(index, 'rate', e.target.value)}
                          placeholder="Rate"
                          className="border p-2 rounded w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor={`work[${index}].unit`} className="block text-sm font-semibold text-gray-600">Unit</label>
                        <select
                          value={item.unit}
                          onChange={(e) => handleRequirementChange(index, 'unit', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                          <option>Select a Unit</option>
                          {units.map((unit, index) => (
                            <option key={index} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>

                      {formData.requirement.length > 1 && (
                        <div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(index)}
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
                  onClick={handleAddRequirement}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  More Requirement
                </button>
              </div>

              <button type="submit" className="bg-green-500 text-white p-2 rounded mt-2">
                {purchaseOrderToEdit ? 'Update Purchase Order' : 'Create Purchase Order'}
              </button>
            </>
          )}
        </form>
        <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default CreatePurchaseOrder;