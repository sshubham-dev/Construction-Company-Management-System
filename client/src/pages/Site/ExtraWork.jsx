import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { Tabs } from 'antd';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import moment from 'moment';
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import { FcApproval } from "react-icons/fc";
import CreateExtraWork from '../../components/CreateExtraWork';
import Modal from '../../components/Modal';
axios.defaults.withCredentials = true;

const ExtraWork = () => {
  const navigate = useNavigate();
  const [clientExtraWorks, setClientExtraWork] = useState([]);
  const [draftExtraWorks, setDraftExtraWork] = useState([]);
  const [contractorExtraWorks, setContractorExtraWork] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("client");
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');

  useEffect(() => {

    const fetchExtraWork = async () => {
      try {
        const extraWorkData = await axios.get('/api/v1/extra-work');
        let clientExtraWork;
        let contractorExtraWork;
        let draftExtraWork;
        console.log(extraWorkData.data)
        if (user.department === 'Site Supervisor' || user.department === 'Site Incharge' && isLoggedIn) {
          const sites = user?.site;
          for (let site of sites) {
            clientExtraWork = extraWorkData.data.filter((extra) => extra.extraFor === 'Client' && extra?.site?.id._id === site.id && extra?.approvalStatus !== 'Pending')
            contractorExtraWork = extraWorkData.data.filter((extra) => extra.extraFor === 'Contractor' && extra?.site?.id._id === site.id && extra?.approvalStatus !== 'Pending')
            draftExtraWork = extraWorkData.data.filter((extra) => extra?.site?.id._id === site.id && extra?.approvalStatus === 'Pending')
          }
          setClientExtraWork(clientExtraWork);
          setContractorExtraWork(contractorExtraWork);
          setDraftExtraWork(draftExtraWork)
        } else {
          setClientExtraWork(extraWorkData.data.filter((extra) => extra.extraFor === 'Client'));
          setContractorExtraWork(extraWorkData.data.filter((extra) => extra.extraFor === 'Contractor'));
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchExtraWork();
  }, [])

  const handleEdit = (id) => {
    setEditModal(true)
    setEditId(id)
  };

  const handleRedirect = (id) => {
    navigate(`/extra-work/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/extra-work/${id}`);
      setClientExtraWork(clientExtraWorks.filter((extraWork) => extraWork._id !== id));
      setContractorExtraWork(contractorExtraWorks.filter((extraWork) => extraWork._id !== id));
    } catch (error) {
      toast.error(error.message)
    }
  };

  const handleSave = async (id) => {
    try {
      const response = await axios.put(`/api/v1/extra-work/save/${id}`);
      setDraftExtraWork(draftExtraWorks.filter((extraWork) => extraWork._id !== id));
      toast.success(response.data?.message);
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  };

  return (
    <div >
      <section className="overflow-x-auto scrollbar-hide">
        <Header category="Page" title="Extra Work's" />
        <div className="w-full mx-auto text-gray-700 px-2 flex justify-end items-center">
          <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
            <MdAdd className='text-xl' />
          </button>
        </div>

        <div className="flex space-x-4 border-b-2 mb-4 w-full md:w-auto">
          <button
            className={`px-4 py-2 ${activeTab === "client" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
            onClick={() => setActiveTab("client")}
          >
            Client
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "contractor" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
            onClick={() => setActiveTab("contractor")}
          >
            Contractor
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "draft" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
            onClick={() => setActiveTab("draft")}
          >
            Drafts
          </button>
        </div>

        {activeTab === "client" && (
          <div className="overflow-x-auto scrollbar-hide">
            <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
              <thead className="bg-gray-300">
                <tr className=" text-left">
                  <th className="font-semibold text-sm uppercase px-6 py-4 "> Name </th>
                  <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Payment Status </th>
                  <th className="font-semibold text-sm uppercase px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {clientExtraWorks?.map((extraWork) => (
                  <tr key={extraWork._id} className='border-b border-blue-gray-200'>
                    <td className="px-6 py-4">
                      <p className=""> {extraWork.site?.name} </p>
                      <p className="text-gray-500 text-sm font-semibold tracking-wide"> {extraWork.client?.name} </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {extraWork.paymentStatus}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleRedirect(extraWork._id)} className="mr-2">
                      <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                    </button>
                      <button onClick={() => handleEdit(extraWork._id)} className="mr-2">
                        <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                      </button>
                      <button onClick={() => handleDelete(extraWork._id)} className="mr-2">
                        <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>)}

        {activeTab === "contractor" && (
          <div className="overflow-x-auto scrollbar-hide">
            <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
              <thead className="bg-gray-300">
                <tr className=" text-left">
                  <th className="font-semibold text-sm uppercase px-6 py-4 "> Name </th>
                  <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Payment Status </th>
                  <th className="font-semibold text-sm uppercase px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {contractorExtraWorks?.map((extraWork) => (
                  <tr key={extraWork._id} className='border-b border-blue-gray-200'>
                    <td className="px-6 py-4">
                      <p className=""> {extraWork.site?.name} </p>
                      <p className="text-gray-500 text-sm font-semibold tracking-wide"> {extraWork.contractor?.name} </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {extraWork.paymentStatus}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleRedirect(extraWork?._id)} className="mr-2">
                      <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                    </button>
                      <button onClick={() => handleEdit(extraWork?._id)} className="mr-2">
                        <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                      </button>
                      <button onClick={() => handleDelete(extraWork?._id)} className="mr-2">
                        <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>)}

        {activeTab === "draft" && (
          <>
            {user.department === 'Site Incharge' && (
              <div className="overflow-x-auto scrollbar-hide">
                <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
                  <thead className="bg-gray-300">
                    <tr className=" text-left">
                      <th className="font-semibold text-sm uppercase px-6 py-4 "> Name </th>
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center "> Approval Status </th>
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {draftExtraWorks?.map((extraWork) => (
                      <tr key={extraWork._id} className='border-b border-blue-gray-200'>
                        <td className="px-6 py-4">
                          <p className=""> {extraWork.site?.name} </p>
                          <p className="text-gray-500 text-sm font-semibold tracking-wide"> {extraWork.contractor?.name ? extraWork.contractor.name : extraWork.client?.name} </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {extraWork.approvalStatus}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleRedirect(extraWork?._id)} className="mr-2">
                          <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                        </button>
                          <button onClick={() => handleSave(extraWork?._id)} className=" mr-2">
                            <FcApproval className="text-green-500 hover:text-green-700 text-xl" />
                          </button>
                          <button onClick={() => handleEdit(extraWork?._id)} className="mr-2">
                            <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                          </button>
                          <button onClick={() => handleDelete(extraWork?._id)} className="mr-2">
                            <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
      {/* Extra Work Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Extra Work' >
        <CreateExtraWork onClose={() => setCreateModal(false)} />
      </Modal>
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Update Extra Work' >
        <CreateExtraWork onClose={() => setEditModal(false)} id={editId} />
      </Modal>
    </div>
  )
}

export default ExtraWork