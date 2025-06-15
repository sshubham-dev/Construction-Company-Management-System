import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useSelector } from 'react-redux';
import { Tabs } from 'antd';
import { FcApproval } from "react-icons/fc";
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import CreateSite from '../../components/CreateSite';

axios.defaults.withCredentials = true;

const Sites = () => {
  const navigate = useNavigate();
  const [sites, setSite] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');

  useEffect(() => {
    if (user && user.department === 'Site Incharge') {
      console.log(user._id)
      getUserSites(user._id);
    } else if (user && user.department === 'Site Supervisor') {
      console.log(user)
      getUserSites(user._id);
    } else if (user && user.department === 'Client') {
      console.log(user)
      getUserSites(user._id);
    } else {
      const getSites = async () => {
        try {
          const siteData = await axios.get('/api/v1/site');
          setSite(siteData.data);
          console.log(siteData.data)
        } catch (error) {
          console.error(error)
          setError(error.message);
        }
      }
      getSites();
    }
  }, [])

  const getUserSites = async (id) => {
    try {
      const siteData = await axios.get(`/api/v1/site/user/${id}`);
      console.log(siteData.data)
      setSite(siteData.data);
    } catch (error) {
      console.error(error)
      setError(error.message);
    }
  }
  console.log(sites)

  const handleEdit = (id) => {
    setEditModal(true);
    setEditId(id)
  };

  const handleRedirect = (id) => {
    navigate(`/site/${id}`);
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/site/${id}`);
      setSite(sites.filter((site) => site._id !== id));
    } catch (error) {
      toast.error(error.message)
    }
  };


  return (
    <div>
      <section className="overflow-x-auto scrollbar-hide">
        <Header category="Page" title="Site Management" />
        <div className="w-full mx-auto mb-6 text-gray-700 py-1 flex flex-row sm:flex-row justify-between items-center">
          <h2 className="text-lg sm:text-md md:text-lg lg:text-xl text-green-600 mb-2 sm:mb-0 sm:mr-4">Total Sites: {sites?.length}</h2>
          {user.department === 'Ceo' || user.department === 'Account Head' && (
            <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
              <MdAdd className='text-xl' />
            </button>
          )}
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
            <thead className="bg-gray-300">
              <tr className=" text-left">
                <th className="font-semibold text-sm uppercase px-6 py-4 "> Name </th>
                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Total Floor </th>
                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Incharge </th>
                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Project Type </th>
                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sites?.map((site) => (
                <tr key={site._id} className='border-b border-blue-gray-200'>
                  <td className="px-6 py-4">
                    <Link to={`/site/${site._id}`}> {site?.name} </Link>
                    <p className="text-gray-500 text-sm font-semibold tracking-wide"> {site?.client?.name} </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {site?.floors}
                  </td>
                  <td className="px-6 py-4 text-center">{site?.incharge?.name}</td>
                  <td className="px-6 py-4 text-center">{site?.projectType}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleRedirect(site?._id)} className="mr-2">
                      <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                    </button>
                    {user.role !== 'Client' && (
                      <button onClick={() => handleEdit(site?._id)} className="mr-2">
                        <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                      </button>)}
                    {user.department === 'Ceo' || user.department === 'Account Head' && (
                      <button onClick={() => handleDelete(site?._id)} className="mr-2">
                        <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                      </button>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        <Toaster position="top-right" reverseOrder={false} />
        <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Site' >
          <CreateSite onClose={() => setCreateModal(false)} />
        </Modal>
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Create Site' >
          <CreateSite onClose={() => setEditModal(false)} isEdit={editId} />
        </Modal>
      </section>
    </div>
  );
}

export default Sites