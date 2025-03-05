import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useSelector } from 'react-redux';
import { Tabs } from 'antd';
import { FcApproval } from "react-icons/fc";
import Header from '../../components/Header';
import CreateReturnOrder from '../../components/CreateReturnOrder';
import Modal from '../../components/Modal';
axios.defaults.withCredentials = true;

const ReturnOrders = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrder] = useState([]);
  const [draftOrder, setDraftOrder] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("approved");

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const purchaseOrdersData = await axios.get('/api/v1/return-order');
        if (user.department === 'Site Supervisor' || user.department === 'Site Incharge') {
          const sites = user?.site;
          let PurchaseOrders = [];
          for (let site of sites) {
            const filteredPurchaseOrders = purchaseOrdersData.data?.filter((purchaseOrder) => purchaseOrder.site?._id.includes(site));
            PurchaseOrders = [...PurchaseOrders, ...filteredPurchaseOrders]
          }
          setPurchaseOrder(PurchaseOrders)
        } else {
          setPurchaseOrder(purchaseOrdersData.data);
        }
        console.log(purchaseOrdersData.data)
      } catch (error) {
        console.error(error)
      }
    };
    const getDraftOrders = async () => {
      try {
        const orderData = await axios.get(`/api/v1/return-order/draft/${user?._id}`);
        const orders = orderData.data;
        if (user.department === 'Site Supervisor' || user.department === 'Site Incharge' && isLoggedIn) {
          const sites = user?.site;
          // console.log('user', user);
          // console.log('sites', sites);
          let draftOrders = [];
          for (let site of sites) {
            const filteredDraftOrders = orders?.filter((order) => order.site?._id.includes(site));
            draftOrders = [...draftOrders, ...filteredDraftOrders]
          }
          setDraftOrder(draftOrders);
          console.log(draftOrders);
        }
      } catch (error) {
        toast.error(error.message)
      }
    };
    fetchPurchaseOrders();
    getDraftOrders();
  }, [])
  const handleEdit = (id) => {
    navigate(`/edit-returnOrder/${id}`);
  };
  const handleRedirect = (id) => {
    navigate(`/return-order/${id}`);
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/return-order/${id}`);
      setPurchaseOrder(purchaseOrders.filter((purchaseOrder) => purchaseOrder._id !== id));
      setDraftOrder(draftOrder.filter((order) => order._id !== id));
    } catch (error) {
      toast.error(error.message)
    }
  };
  const handleSave = async (id) => {
    try {
      const response = await axios.put(`/api/v1/return-order/save/${id}`);
      setDraftOrder(draftOrder.filter((purchaseOrder) => purchaseOrder._id !== id));
      toast.success(response.data?.message);
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  };

  return (
    <div>
      <section className="overflow-x-auto scrollbar-hide">
        <Header category="Page" title="Return Order's" />
        <div className="w-full mx-auto text-gray-700 p-1 flex flex-row justify-end items-center">
          <h2 className="text-lg text-wrap sm:text-md md:text-lg lg:text-xl text-green-600 mr-4 pr-4">
            Total Return Orders: {purchaseOrders?.length}
          </h2>
          <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
            <MdAdd className='text-xl' />
          </button>
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
          <div className="overflow-x-auto scrollbar-hide">
            <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-x-auto scrollbar-hide'>
              <thead className="bg-gray-300">
                <tr className=" text-left">
                  <th className="font-semibold text-sm uppercase px-6 py-4 "> Name </th>
                  <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Admin Approve </th>
                  {/* <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Supplier Approve</th> */}
                  <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Total Amount </th>
                  <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Total Paid </th>
                  <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Total Due </th>
                  <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {purchaseOrders?.map((purchaseOrder) => (
                  <tr key={purchaseOrder._id} className='border-b border-blue-gray-200'>
                    <td className="px-6 py-4">
                      <p className=""> {purchaseOrder.site?.name} </p>
                      <p className="text-gray-500 text-sm font-semibold tracking-wide"> {purchaseOrder.supplier?.name} </p>
                    </td>
                    <td className="px-6 py-4 text-center">{purchaseOrder?.adminApprove}</td>
                    {/* <td className="px-6 py-4 text-center">{purchaseOrder?.supplierApprove}</td> */}
                    <td className="px-6 py-4 text-center">₹ {purchaseOrder?.totalValue ? purchaseOrder?.totalValue : ' 0'}</td>
                    <td className="px-6 py-4 text-center">₹ {purchaseOrder?.totalPaid ? purchaseOrder?.totalPaid : ' 0'}</td>
                    <td className="px-6 py-4 text-center">₹ {purchaseOrder?.totalDue ? purchaseOrder?.totalDue : ' 0'}</td>
                    <td className="px-6 py-4 text-center">
                      {/* <button onClick={() => handleRedirect(purchaseOrder._id)} className="mr-2">
                        <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                      </button>
                      <button onClick={() => handleEdit(purchaseOrder._id)} className="mr-2">
                        <GrEdit className="text-green-500 hover:text-green-800 text-lg" />
                      </button> */}
                      <button onClick={() => handleDelete(purchaseOrder._id)} className="mr-2">
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
          <>
            {user.department === 'Site Incharge' && (
              <div className="overflow-x-auto scrollbar-hide">
                <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
                  <thead className="bg-gray-300">
                    <tr className=" text-left">
                      <th className="font-semibold text-sm uppercase px-6 py-4 "> Name </th>
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Admin Approve </th>
                      {/* <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Supplier Approve</th> */}
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {draftOrder?.map((purchaseOrder) => (
                      <tr key={purchaseOrder._id} className='border-b border-blue-gray-200'>
                        <td className="px-6 py-4">
                          <p className=""> {purchaseOrder.site?.name} </p>
                          <p className="text-gray-500 text-sm font-semibold tracking-wide"> {purchaseOrder.supplier?.name} </p>
                        </td>
                        <td className="px-6 py-4 text-center">{purchaseOrder?.adminApprove}</td>
                        {/* <td className="px-6 py-4 text-center">{purchaseOrder?.supplierApprove}</td> */}
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleSave(purchaseOrder._id)} className=" mr-2">
                            <FcApproval className="text-green-500 hover:text-green-700 text-xl" />
                          </button>
                          {/* <button onClick={() => handleRedirect(purchaseOrder._id)} className="mr-2">
                            <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                          </button>
                          <button onClick={() => handleEdit(purchaseOrder._id)} className="mr-2">
                            <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                          </button> */}
                          <button onClick={() => handleDelete(purchaseOrder._id)}>
                            <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>)}

        <Toaster
          position="top-right"
          reverseOrder={false} />
      </section>
      {/* Return Order Modal */}
      {createModal && (
        <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Return Order' >
          <CreateReturnOrder onClose={() => setCreateModal(false)} />
        </Modal>
      )}
    </div>
  )
}

export default ReturnOrders