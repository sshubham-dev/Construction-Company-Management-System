import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

axios.defaults.withCredentials = true;
const CreateContractor = ({ onClose, isEdit }) => {
  const [contractor, setContractor] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    addhar: '',
    pan: '',
    bank: '',
    jobWork: '',
    isUser: '',
  });
  const [contractorToEdit, setContractorToEdit] = useState(null);
  const { id } = useParams();
  useEffect(() => {
    if (id) {
      console.log(id)
      setContractorToEdit(id)
      fetchContractor(id)
    }
  }, [id])
  const navigate = useNavigate();

  const fetchContractor = async (id) => {
    try {
      const contractorData = await axios.get(`/api/v1/contractor/${id}`);
      const Contractor = contractorData.data;
      setContractor({
        name: Contractor?.name,
        phone: Contractor?.phone,
        whatsapp: Contractor?.whatsapp,
        address: Contractor?.address,
        addhar: Contractor?.addhar,
        pan: Contractor?.pan,
        bank: Contractor?.bank,
        jobWork: Contractor?.jobWork,
      })
      console.log(Contractor)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContractor((prevContractor) => ({
      ...prevContractor,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setContractor({
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      addhar: '',
      pan: '',
      bank: '',
      jobWork: '',
      isUser: '',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(contractor)
    try {
      if (contractorToEdit) {
        const response = await axios.put(`/api/v1/contractor/${contractorToEdit}`, {
          name: contractor.name,
          phone: contractor.phone,
          whatsapp: contractor.whatsapp,
          address: contractor.address,
          addhar: contractor.addhar,
          pan: contractor.pan,
          bank: contractor.bank,
          jobWork: contractor.jobWork,
        });
        toast.success(response.data.message);
        console.log('Form data submitted:', contractor);
        onClose()
      } else {
        const response = await axios.post('/api/v1/contractor', {
          name: contractor.name,
          phone: contractor.phone,
          whatsapp: contractor.whatsapp,
          address: contractor.address,
          addhar: contractor.addhar,
          pan: contractor.pan,
          bank: contractor.bank,
          jobWork: contractor.jobWork,
        });
        toast.success(response.data.message);
        console.log('Form data submitted:', contractor);
        onClose()
      }
    } catch (error) {
      console.error('Error creating contractor:', error);
      toast.error('Failed Creating Contractor. Please check your credentials.');
    }
  };
  return (
    <div>
      <form
        className='space-y-4'
        onSubmit={handleSubmit}>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Name:
          </label>
          <input
            type="text"
            name="name"
            value={contractor.name}
            onChange={handleChange}
            placeholder='Name'
            required
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="UserEmail"
            className="block text-sm font-medium text-gray-600"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={contractor.email}
            onChange={handleChange}
            placeholder="Email"
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500" />
        </div>

        <div className='mb-4'>
          <label htmlFor='phone'
            className='block text-sm font-medium text-gray-600'>
            Contact Number:
          </label>
          <input
            className='mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500'
            type='text'
            name='phone'
            id='phone'
            placeholder='Enter Contact Number'
            required
            autoComplete='off'
            value={contractor.phone}
            onChange={handleChange}
          />
        </div>

        <div className='mb-4'>
          <label htmlFor='whatsapp'
            className='block text-sm font-medium text-gray-600'>
            Whatsapp Number:
          </label>
          <input
            className='mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500'
            type='text'
            name='whatsapp'
            id='whatsapp'
            placeholder='Enter Your Whatsapp Number'
            autoComplete='off'
            value={contractor.whatsapp}
            onChange={handleChange}
          />
        </div>

        <div className='mb-4'>
          <label htmlFor="address" className="block text-sm font-medium text-gray-600">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={contractor.address}
            onChange={handleChange}
            placeholder="Address"
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className='mb-4'>
          <label htmlFor="jobWork" className="block text-sm font-medium text-gray-600">
            Work Of Contractor
          </label>
          <input
            type="text"
            id="jobWork"
            name="jobWork"
            value={contractor.jobWork}
            onChange={handleChange}
            placeholder="Job Work"
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="isUser"
            className="border-none rounded-lg focus:outline-none mr-2"
            onChange={handleChange}
            value='true' />
          <label htmlFor="isUser" className="block text-md font-medium text-gray-600">Is a User</label>
        </div>

        {/* <div className="mb-5">
          <h4 className="text-lg font-semibold mb-2">Documents</h4>
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label htmlFor="addhar" className="block text-sm font-medium text-gray-600">
                Addhar No:
              </label>
              <input
                type="text"
                id="addhar"
                name="addhar"
                value={contractor.addhar}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="pan" className="block text-sm font-medium text-gray-600">
                Pan No:
              </label>
              <input
                type="text"
                id="pan"
                name="pan"
                value={contractor.pan}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="account" className="block text-sm font-medium text-gray-600">
                Account Details:
              </label>
              <input
                type="file"
                id="bank"
                name="bank"
                value={contractor.bank}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

          </div>
        </div> */}

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-red-400 text-white rounded-md">
            Cancel
          </button>
          <button
            type='submit'
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" >
            Create
          </button>
          <button type="button" onClick={handleReset}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400">
            Reset
          </button>
        </div>

      </form>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </div>
  )
}

export default CreateContractor