import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { GrEdit } from "react-icons/gr";
import { MdAdd, MdDelete } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import CreatePurchaseRequest from '../../components/CreatePurchaseRequest';
import Modal from '../../components/Modal';
import axios from 'axios';

const PurchaseRequest = () => {
  const navigate = useNavigate();
  const [purchaseRequest, setPurchaseRequest] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("approved");
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  const { user, isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchPurchaseRequest = async () => {
      const response = await axios.get('/api/v1/purchase-request')
      console.log(...response.data)
      setPurchaseRequest(response.data)
    }
    fetchPurchaseRequest();
  }, [])

  const handleRedirect = (id) => {
    navigate(`/purchase-request/${id}`);
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearch(searchValue);
  };

  const handleEdit = (id) => {
    setSelectedRequest(purchaseRequest);
    setEditModal(true);
    setEditId(id)
  };

  const handleDelete = async (request) => {
    try {
      await axios.delete(`/api/v1/purchase-request/${request}`)
      setPurchaseRequest((prevpurchaseRequests) => prevpurchaseRequests.filter((l) => l !== purchaseRequest));
      toast.success("purchaseRequest deleted successfully!");
    } catch (error) {
      console.log(error)
    }
  };

  const handleSubmit = (request) => {
    if (selectedRequest) {
      setPurchaseRequest((prevpurchaseRequests) =>
        prevpurchaseRequests.map((l) => (l === selectedRequest ? purchaseRequest : l))
      );
      toast.success("purchaseRequest updated successfully!");
    } else {
      setPurchaseRequest((prevpurchaseRequests) => [...prevpurchaseRequests, purchaseRequest]);
      toast.success("purchaseRequest added successfully!");
    }
    setSelectedRequest(null);
  };

  return (
    <div >
      <section className="overflow-x-auto scrollbar-hide">
        <Header category="Page" title="Purchase Request" />
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
          {/* <input
                type="text"
                placeholder="Search by name"
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={handleSearch}
              /> */}
          <div className="space-x-6 flex justify-end">
            <button
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
              onClick={() => setCreateModal(true)}
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex space-x-4 border-b-2 mb-4 w-full md:w-auto">
          <button
            className={`px-4 py-2 ${activeTab === "approved" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "draft" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
            onClick={() => setActiveTab("draft")}
          >
            Drafts
          </button>
        </div>

        {activeTab === "approved" && (
          <div className='bg-white rounded-lg shadow overflow-x-auto scrollbar-hide'>
            <table className="w-full border-collapse overflow-x-auto table-auto whitespace-nowrap">
              <thead>
                <tr className="bg-gray-300">
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Site</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Requirement For</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Approval status</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseRequest.map((request, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50 ">
                    <td className="p-3 text-left">{request.site}</td>
                    <td className="p-3 text-left">{request.requirementFor}</td>
                    <td className="p-3 text-left">{request.status}</td>
                    <td className="p-3 text-left">{request.approvalStatus}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleRedirect(qualitySchedule._id)} className="mr-2">
                          <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                        </button>
                      <button
                          onClick={() => handleEdit(request._id)}
                          className="mr-2">
                          <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                        </button>
                      <button
                        onClick={() => handleDelete(request._id)}>
                        <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "draft" && (
          <div className='bg-white rounded-lg shadow overflow-x-auto scrollbar-hide'>
            <table className="w-full border-collapse overflow-x-auto table-auto whitespace-nowrap">
              <thead>
                <tr className="bg-gray-300">
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Site</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
          </div>
        )}

        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>

      {/* Work Order Modal */}
        <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Purchase Request' >
          <CreatePurchaseRequest onClose={() => setCreateModal(false)} />
        </Modal>
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Update Purchase Request' >
          <CreatePurchaseRequest onClose={() => setEditModal(false)} id={editId} />
        </Modal>
    </div>
  )
}

export default PurchaseRequest