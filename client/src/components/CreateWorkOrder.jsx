import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Select from 'react-select';

axios.defaults.withCredentials = true;

const CreateWorkOrder = ({ onClose, id, index }) => {
  const [formData, setFormData] = useState({
    workOrderName: '',
    workOrderNo: '',
    contractor: '',
    site: '',
    startdate: '',
    duration: '',
    work: [{
      workDetail: '',
      rate: '',
      area: '',
      unit: '',
      amount: '',
    }],
  });

  const [workDetails, setWorkDetails] = useState([]);
  const [data, setData] = useState({
    site: '',
    contractor: '',
    workName: '',
  });

  const [sites, setSite] = useState([]);
  const [contractors, setContractor] = useState([]);
  const [workToEdit, setWorkToEdit] = useState({ id: '', index: '' });
  const [workOrderToEdit, setWorkOrderToEdit] = useState(null);
  const units = ['SQFT', 'RFT', 'LUMSUM', 'NOS', 'FIXED', 'RMT', 'SQMT', 'CUM'];
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id && index) {
      setWorkToEdit({ id, index });
      fetchWorkOrder(id, index);
    } else if (id && !index) {
      setWorkOrderToEdit(id);
      fetchWorkOrder(id);
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

    const fetchContractor = async () => {
      try {
        const contractorData = await axios.get('/api/v1/contractor');
        setContractor(contractorData.data);
      } catch (error) {
        console.error(error.message);
      }
    };

    const fetchWorkDetails = async () => {
      try {
        const response = await axios.get('/api/v1/work-details');
        const data = response.data;
        const workDetail = data.filter(data => data.title.includes('Work'))
        setWorkDetails(workDetail);
        console.log(workDetail)
      } catch (error) {
        console.error('Error fetching work details:', error.message);
      }
    };

    fetchSite();
    fetchContractor();
    fetchWorkDetails();
  }, [user]);

  const fetchWorkOrder = async (id, index) => {
    try {
      const response = await axios.get(`/api/v1/work-order/${id}`);
      if (id && index) {
        const work = response.data.work[index];
        setFormData(prevState => ({
          ...prevState,
          work: [{ ...work }],
        }));
      } else if (id && !index) {
        setData({
          site: response.data.site.name,
          contractor: response.data.contractor.name,
          workName: response.data.workOrderName,
        });
        setFormData({
          workOrderName: response.data.workOrderName,
          workOrderNo: response.data.workOrderNo,
          contractor: response.data.contractor._id,
          site: response.data.site._id,
          startdate: response.data.startdate,
          duration: response.data.duration,
          work: response.data.work,
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

  const handleAddWork = () => {
    setFormData(prevState => ({
      ...prevState,
      work: [
        ...prevState.work,
        { workDetail: '', rate: '', area: '', unit: '', amount: '' },
      ],
    }));
  };

  const handleRemoveWork = (index) => {
    const updatedWork = [...formData.work];
    updatedWork.splice(index, 1);
    setFormData(prevState => ({
      ...prevState,
      work: updatedWork,
    }));
  };

  const handleWorkChange = (index, field, value) => {
    const updatedWork = [...formData.work];
    updatedWork[index][field] = value;
    setFormData(prevState => ({
      ...prevState,
      work: updatedWork,
    }));
  };
  const options = workDetails.flatMap(workDetail =>
    workDetail.description.map(detail => ({
      value: detail.work,
      label: detail.work
    }))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData)
    try {
      if (workOrderToEdit) {
        const response = await axios.put(`/api/v1/work-order/${workOrderToEdit}`, formData);
        toast.success(response.data.message);
        onClose()
      } else {
        const response = await axios.post('/api/v1/work-order', formData);
        toast.success(response.data.message);
        onClose()
      }
    } catch (error) {
      console.error('Error submitting work order:', error.message);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <form className="max-w-xl mx-auto" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="workOrderName" className="block text-sm font-semibold text-gray-600">Work Order Name</label>
          <select
            id="workOrderName"
            value={formData.workOrderName}
            onChange={(e) => handleChange('workOrderName', e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value=''>{workOrderToEdit ? data.workName : 'Select Work Order Name'}</option>
            {workDetails.map((work) => (
              <option key={work._id} value={work._id}>{work.title}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="workOrderNo" className="block text-sm font-semibold text-gray-600">Work Order No</label>
          <input
            type="text"
            id="workOrderNo"
            value={formData.workOrderNo}
            onChange={(e) => handleChange('workOrderNo', e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="site" className="block text-sm font-semibold text-gray-600">Site</label>
          <select
            name="site"
            value={formData.site}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={(e) => handleChange('site', e.target.value)}>
            <option>{workOrderToEdit ? data.site : 'Select Site'}</option>
            {sites.map((site) => (
              <option key={site._id} value={site._id}>{site.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="contractor" className="block text-sm font-semibold text-gray-600">Contractor</label>
          <select
            id="contractor"
            name="contractor"
            value={formData.contractor}
            onChange={(e) => handleChange('contractor', e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option>{workOrderToEdit ? data.contractor : "Select Contractor"}</option>
            {contractors.map((contractor) => (
              <option key={contractor._id} value={contractor._id}>{contractor.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="startdate" className="block text-sm font-semibold text-gray-600">Starting Date</label>
          <input
            type="date"
            value={formData.startdate}
            onChange={(e) => handleChange('startdate', e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="duration" className="block text-sm font-semibold text-gray-600">Project Duration</label>
          <input
            type="month"
            value={formData.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Work Details</h2>
          {formData.work.map((workItem, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`work[${index}].workDetail`} className="block text-sm font-semibold text-gray-600">Work Detail</label>
                  <Select
                    options={options}
                    value={options.find(opt => opt.value === workItem.workDetail) || null}
                    onChange={selectedOption => handleWorkChange(index, 'workDetail', selectedOption.value)}
                    placeholder="Select Work Detail"
                  />

                </div>

                <div>
                  <label htmlFor={`work[${index}].rate`} className="block text-sm font-semibold text-gray-600">Rate</label>
                  <input
                    type="number"
                    value={workItem.rate}
                    onChange={(e) => handleWorkChange(index, 'rate', e.target.value)}
                    placeholder="Rate"
                    className="border p-2 rounded w-full"
                  />
                </div>

                <div>
                  <label htmlFor={`work[${index}].area`} className="block text-sm font-semibold text-gray-600">Area</label>
                  <input
                    type="number"
                    value={workItem.area}
                    onChange={(e) => handleWorkChange(index, 'area', e.target.value)}
                    placeholder="Area"
                    className="border p-2 rounded w-full"
                  />
                </div>

                <div>
                  <label htmlFor={`work[${index}].unit`} className="block text-sm font-semibold text-gray-600">Unit</label>
                  <select
                    value={workItem.unit}
                    onChange={(e) => handleWorkChange(index, 'unit', e.target.value)}
                    className="border p-2 rounded w-full"
                  >
                    <option>Select a Unit</option>
                    {units.map((unit, index) => (
                      <option key={index} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                {formData.work.length > 1 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => handleRemoveWork(index)}
                      className="bg-red-500 text-white p-2 mt-5 rounded"
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
            Add Work
          </button>
        </div>

        <button type="submit" className="bg-green-500 text-white p-2 rounded mt-4">
          Submit Work Order
        </button>
      </form>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default CreateWorkOrder;