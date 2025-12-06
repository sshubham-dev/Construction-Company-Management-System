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
      console.log(user.site)
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
    <div className="p-2 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-green-600">
          Total Sites: {sites?.length}
        </h2>
        {(user?.department === "Ceo" || user?.department === "Account Head") && (
          <button
            onClick={() => setCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 rounded-full p-2 text-white shadow"
          >
            <MdAdd className="text-xl" />
          </button>
        )}
      </div>

      {/* Mobile First: Card Layout */}
      <div className="grid gap-4 sm:hidden">
        {sites?.map((site) => (
          <div
            key={site._id}
            className="bg-white shadow rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <Link
                  to={`/site/${site._id}`}
                  className="text-lg font-semibold text-gray-800 hover:text-green-600"
                >
                  {site?.name}
                </Link>
                <p className="text-sm text-gray-500">{site?.client?.name}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleRedirect(site?._id)}>
                  <FaExternalLinkAlt className="text-blue-500 hover:text-blue-700 text-lg" />
                </button>
                {user?.role !== "Client" && (
                  <button onClick={() => handleEdit(site?._id)}>
                    <GrEdit className="text-blue-500 hover:text-blue-700 text-lg" />
                  </button>
                )}
                {(user?.department === "Ceo" ||
                  user?.department === "Account Head") && (
                  <button onClick={() => handleDelete(site?._id)}>
                    <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                  </button>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-700 grid grid-cols-2 gap-2 mt-2">
              <p>
                <span className="font-medium">Incharge:</span>{" "}
                {site?.incharge?.name}
              </p>
              <p>
                <span className="font-medium">Type:</span> {site?.projectType}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-center">Incharge</th>
              <th className="px-4 py-3 text-center">Project Type</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sites?.map((site) => (
              <tr
                key={site._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/site/${site._id}`}
                    className="font-medium text-gray-800 hover:text-green-600"
                  >
                    {site?.name}
                  </Link>
                  <p className="text-xs text-gray-500">{site?.client?.name}</p>
                </td>
                <td className="px-4 py-3 text-center">{site?.incharge?.name}</td>
                <td className="px-4 py-3 text-center">{site?.projectType}</td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button onClick={() => handleRedirect(site?._id)}>
                    <FaExternalLinkAlt className="text-blue-500 hover:text-blue-700 text-lg" />
                  </button>
                  {user?.role !== "Client" && (
                    <button onClick={() => handleEdit(site?._id)}>
                      <GrEdit className="text-blue-500 hover:text-blue-700 text-lg" />
                    </button>
                  )}
                  {(user?.department === "Ceo" ||
                    user?.department === "Account Head") && (
                    <button onClick={() => handleDelete(site?._id)}>
                      <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      {/* Modals */}
      <Toaster position="top-right" reverseOrder={false} />
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        head="Create Site"
      >
        <CreateSite onClose={() => setCreateModal(false)} />
      </Modal>
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        head="Edit Site"
      >
        <CreateSite onClose={() => setEditModal(false)} isEdit={editId} />
      </Modal>
    </div>
  );
}

export default Sites