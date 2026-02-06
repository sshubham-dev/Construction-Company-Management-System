import axios from 'axios';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { MdOutlineRemoveCircle, MdOutlineAddCircle } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from 'react-router-dom';
import { fetchNotifications } from '../features/notification/notificationSlice';

axios.defaults.withCredentials = true;

const CreateClient = ({ onClose, isEdit }) => {
  const [client, setClient] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: {
      street: "",
      city: "",
      district: "",
      state: "",
    },
    isUser: false,
    gstNo:''
  });
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
  useEffect(() => {
    if (isEdit) {
      setClientId(isEdit)
      fetchClient(isEdit)
    }
  }, [])

  const fetchClient = async (id) => {
    try {
      const clientData = await axios.get(`/api/v1/client/${id}`);
      console.log(clientData.data)
      setClient({
        name: clientData.data?.name,
        email: clientData.data?.email,
        phone: clientData.data?.phone,
        whatsapp: clientData.data?.whatsapp,
        address: {
          street: clientData.data?.address.street,
          city: clientData.data?.address.city,
          district: clientData.data?.address.district,
          state: clientData.data?.address.state,
        },
      })
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReset = () => {
    setClient({
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: {
        street: "",
        city: "",
        district: "",
        state: "",
      },
      isUser: '',
    })
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setClient((prevclient) => ({
        ...prevclient,
        address: {
          ...prevclient.address,
          [addressField]: value,
        },
      }));
    } else {
      setClient({ ...client, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Before data submitted:', client);
    try {
      if (isEdit !== undefined) {
        const response = await axios.put(`/api/v1/client/${clientId}`, client);
        if (response.data) {
          toast.success(response.data.message)
          console.log(response.data)
          setLoading(false)
          dispatch(fetchNotifications(user._id));
          onClose()
        }
      } else {
        const response = await axios.post('/api/v1/client', client);
        if (response.data) {
          toast.success(response.data.message)
          console.log(response.data)
          setLoading(false)
          dispatch(fetchNotifications(user._id));
          onClose()
        }
      }
    } catch (error) {
      console.log(error)
      setLoading(false)
      toast.error(error.message)
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}
        className='space-y-4'>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Name:
          </label>
          <input
            type="text"
            name="name"
            value={client.name}
            onChange={handleChange}
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
            value={client.email}
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
            type='tel'
            name='phone'
            id='phone'
            placeholder='Enter Your Contact Number'
            value={client.phone}
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
            type='tel'
            name='whatsapp'
            id='whatsapp'
            placeholder='Enter Your Whatsapp Number'
            autoComplete='off'
            value={client.whatsapp}
            onChange={handleChange}
          />
        </div>

        {/* Address */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold mb-2">Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-600">
                Street
              </label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                placeholder="Street"
                value={client.address.street}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-600">
                City
              </label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={client.address.city}
                placeholder="City"
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-600">
                District
              </label>
              <input
                type="text"
                id="address.district"
                name="address.district"
                value={client.address.district}
                placeholder="District"
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-600">
                State
              </label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={client.address.state}
                placeholder="State"
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

          </div>
        </div>
        
        <div className='mb-4'>
          <label htmlFor="gstNo" className="block text-sm font-medium text-gray-600">
            GST No
          </label>
          <input
            type="text"
            name="gstNo"
            onChange={handleChange}
            placeholder="GST No."
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

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-red-400 text-white rounded-md">
            Cancel
          </button>
          <button
            type='submit'
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" 
                          disabled={loading}
            >
              {loading ? "Submitting..." : `${clientId ? 'Update' : 'Create'} Client`}
           
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
  );
};

export default CreateClient;
