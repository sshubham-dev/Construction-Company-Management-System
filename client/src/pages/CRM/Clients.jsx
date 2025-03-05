import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import CreateClient from '../../components/CreateClient';
import Modal from '../../components/Modal';
axios.defaults.withCredentials = true;


const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClient] = useState([]);
  const [error, setError] = useState(null);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [createModal, setCreateModal] = useState(false);

  useEffect(() => {
    const getClients = async () => {
      try {
        const clientData = await axios.get('/api/v1/client');
          setClient(clientData.data);
        console.log(clientData.data)
      } catch (error) {
        console.error(error)
        setError(error.message);
      }
    }
    getClients();
  }, [])

  const handleEdit = (id) => {
    navigate(`/edit-client/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/client/${id}`);
      setClient(clients.filter((client) => client._id !== id));
    } catch (error) {
      toast.error(error.message)
    }
  };


  return (
    <div >
      <section className="overflow-x-auto">
        <Header category="Page" title="Client's" />
        <div className="w-full mx-auto mb-6 text-gray-700 p-1 flex flex-row justify-between items-center">
          <h2 className="text-lg text-wrap sm:text-md md:text-lg lg:text-xl text-green-600 mr-4 pr-4">
            Total Client: {clients?.length}
          </h2>
          {/* {user.department === 'Account Head' || user.department === 'Ceo' && ( */}
          <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
            <MdAdd className='text-xl' />
          </button>
          {/* )} */}
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            '-ms-overflow-style': 'none',
          }}>
          <table className='w-full whitespace-nowrap divide-y divide-gray-300 overflow-hidden '>
            <thead >
              <tr className="text-left bg-gray-200">
                <th className="font-semibold text-sm uppercase px-6 py-4 "> Name </th>
                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Email </th>
                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Contact No. </th>
                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients?.map((client) => (
                <tr key={client._id} className='border-b border-blue-gray-200'>
                  <td className="px-6 py-4">
                    <p className=""> {client.name} </p>
                    <p className="text-gray-500 text-sm font-semibold tracking-wide"> {client.site?.name} </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {client.email}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className=""> {client.contactNo} </p>
                    <p className="text-gray-500 text-sm font-semibold tracking-wide"> {client.whatsapp} </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* <button onClick={() => handleRedirect(client._id)} className="mr-2">
                      <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                    </button> */}
                    <button onClick={() => handleEdit(client._id)} className="mr-2">
                      <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                    </button>
                    <button onClick={() => handleDelete(client._id)} className="mr-2">
                      <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
      {/* Client Modal */}
      {createModal && (
        <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Client' >
          <CreateClient isOpen={createModal} onClose={() => setCreateModal(false)} />
        </Modal>
      )}
    </div>
  );
}

export default Clients;


{/* <table className="w-full text-sm text-left rtl:text-right text-gray-500">
  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
    <tr>
      <th scope="col" className="px-6 py-3">Name</th>
      <th scope="col" className="px-6 py-3">Email</th>
      <th scope="col" className="px-6 py-3">Phone</th>
      <th scope="col" className="px-6 py-3">Whatsapp</th>
      <th scope="col" className="px-6 py-3">Site</th>
      <th scope="col" className="px-6 py-3">Actions</th>
    </tr>
  </thead>
  <tbody>
    {clients.map((client) => (
      <tr key={client._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
        <td className="px-6 py-4">{client.name}</td>
        <td className="px-6 py-4">{client.email}</td>
        <td className="px-6 py-4">{client.contactNo}</td>
        <td className="px-6 py-4">{client.whatsapp}</td>
        <td className="px-6 py-4">{client.site?.name}</td>
        <td className="px-6 py-4">
          <button
            onClick={() => handleRedirect(client._id)}
            className="bg-blue-500 text-white px-2 py-1 mr-2"
          >
            <FaExternalLinkAlt />
          </button>
          <button
            onClick={() => handleEdit(client._id)}
            className="bg-blue-500 text-white px-2 py-1 mr-2"
          >
            <GrEdit />
          </button>
          <button
            onClick={() => handleDelete(client._id)}
            className="bg-red-500 text-white px-2 py-1 mr-2"
          >
            <MdDelete />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table> */}