import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import ReturnFormModal from '../../components/CreateReturnRequest';
axios.defaults.withCredentials = true;

const ReturnRequest = () => {
    const navigate = useNavigate();
    const [ReturnRequest, setReturnRequest] = useState([]);
    const [draftOrder, setDraftOrder] = useState([]);
    const [createModal, setCreateModal] = useState(false);
    const { user, isLoggedIn } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState("approved");

    useEffect(() => {
        const fetchReturnRequest = async () => {
            try {
                const ReturnRequestData = await axios.get('/api/v1/return');
                if (user.department === 'Site Supervisor' || user.department === 'Site Incharge') {
                    const sites = user?.site;
                    let ReturnRequest = [];
                    for (let site of sites) {
                        const filteredReturnRequest = ReturnRequestData.data?.filter((ReturnRequest) => ReturnRequest.site?._id.includes(site));
                        ReturnRequest = [...ReturnRequest, ...filteredReturnRequest]
                    }
                    setReturnRequest(ReturnRequest)
                } else {
                    setReturnRequest(ReturnRequestData.data);
                }
                console.log(ReturnRequestData.data)
            } catch (error) {
                console.error(error)
            }
        };
        const getDraftOrders = async () => {
            try {
                const orderData = await axios.get(`/api/v1/return/draft/${user?._id}`);
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
        fetchReturnRequest();
        getDraftOrders();
    }, [])
    const handleEdit = (id) => {
        navigate(`/edit-ReturnRequestOrder/${id}`);
    };
    const handleRedirect = (id) => {
        navigate(`/ReturnRequest-order/${id}`);
    };
    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/v1/return/${id}`);
            setReturnRequest(ReturnRequest.filter((ReturnRequest) => ReturnRequest._id !== id));
            setDraftOrder(draftOrder.filter((order) => order._id !== id));
        } catch (error) {
            toast.error(error.message)
        }
    };

    ReturnRequest(
        <div>
            <section className="overflow-x-auto scrollbar-hide">
                <Header category="Page" title="ReturnRequest Order's" />
                <div className="w-full mx-auto text-gray-700 p-1 flex flex-row justify-end items-center">
                    <h2 className="text-lg text-wrap sm:text-md md:text-lg lg:text-xl text-green-600 mr-4 pr-4">
                        Total ReturnRequest Orders: {ReturnRequest?.length}
                    </h2>
                    <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
                        <MdAdd className='text-xl' />
                    </button>
                </div>

                {/* <div className="flex space-x-4 border-b-2 mb-4 w-full md:w-auto">
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
                </div> */}

                {/* {activeTab === "approved" && ( */}
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
                                {ReturnRequest?.map((ReturnRequest) => (
                                    <tr key={ReturnRequest._id} className='border-b border-blue-gray-200'>
                                        <td className="px-6 py-4">
                                            <p className=""> {ReturnRequest.site?.name} </p>
                                            <p className="text-gray-500 text-sm font-semibold tracking-wide"> {ReturnRequest.supplier?.name} </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">{ReturnRequest?.adminApprove}</td>
                                        {/* <td className="px-6 py-4 text-center">{ReturnRequest?.supplierApprove}</td> */}
                                        <td className="px-6 py-4 text-center">₹ {ReturnRequest?.totalValue ? ReturnRequest?.totalValue : ' 0'}</td>
                                        <td className="px-6 py-4 text-center">₹ {ReturnRequest?.totalPaid ? ReturnRequest?.totalPaid : ' 0'}</td>
                                        <td className="px-6 py-4 text-center">₹ {ReturnRequest?.totalDue ? ReturnRequest?.totalDue : ' 0'}</td>
                                        <td className="px-6 py-4 text-center">
                                            {/* <button onClick={() => handleRedirect(ReturnRequest._id)} className="mr-2">
                        <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                      </button>
                      <button onClick={() => handleEdit(ReturnRequest._id)} className="mr-2">
                        <GrEdit className="text-green-500 hover:text-green-800 text-lg" />
                      </button> */}
                                            <button onClick={() => handleDelete(ReturnRequest._id)} className="mr-2">
                                                <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                {/* )} */}


                <Toaster
                    position="top-right"
                    reverseOrder={false} />
            </section>
            {/* ReturnRequest Order Modal */}
            {createModal && (
                <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create ReturnRequest Order' >
                    <ReturnFormModal onClose={() => setCreateModal(false)} />
                </Modal>
            )}
        </div>
    )
}

export default ReturnRequest