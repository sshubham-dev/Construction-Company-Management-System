import React, { useState, useRef, useEffect } from 'react';
import { Tabs } from 'antd';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import moment from 'moment';
import { FcApproval } from "react-icons/fc";
import { BiLinkExternal } from "react-icons/bi";
import { LuShieldX } from "react-icons/lu";
import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
axios.defaults.withCredentials = true;


const Reject = ({ onClose, Id }) => {
    const [message, setMessage] = useState();
    console.log(Id)
    const handleReject = async (e) => {
        e.preventDefault();
        try {
            console.log(Id)
            console.log(message)
            const response = await axios.put(`/api/v1/approval/reject/${Id}`, {message});
            console.log(response.data)
            toast.success(response.data.message)
            onClose()
        } catch (error) {
            console.error(error)
        }
    };
    return (
        <form
            onSubmit={handleReject}
        >
            <div className="mb-2">
                <label htmlFor="message" className="block text-sm font-medium">
                    Message
                </label>
                <textarea
                    name="message"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Wite Message..."
                    value={message}
                    >
                </textarea>
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-500 text-white p-2 rounded"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    Save
                </button>
            </div>
        </form>
    )
}

const Approval = () => {
    const [allApprovals, setAllApprovals] = useState([]);
    const [pendingApprovals, setPendingApproval] = useState([]);
    const [approved, setApproved] = useState([]);
    const [rejected, setRejectedApproval] = useState([]);
    const [rejectModal, setRejectModal] = useState(false)
    const [rejectId, setRejectId] = useState('')
    const [activeTab, setActiveTab] = useState("pending");
    const { user } = useSelector((state) => {
        return state.auth
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (user?._id) {
            fetchApproval(user._id);
            fetchApproved(user._id);
            fetchRejected(user._id);
        }
    }, []);

    const fetchApproval = async (id) => {
        try {
            console.log(id)
            const response = await axios.get(`/api/v1/approval/pending/user/${id}`);
            const approvalData = response.data;
            // const sites = async (id)=>{
            //     return await axios.get(`/api/v1/site/${id}`);
            // };
            // let siteData = [];
            // //  await axios.get(`/api/v1/site/${siteId}`);
            // const siteId = approvalData.map(approval => {
            //      return approval.data.site
            // });
            // siteId.forEach( site =>  {
            //     siteData = sites(site)
            // });
            // console.log("siteData.data:", siteData)
            // approvalData.data.site = siteData.data;
            // if(approvalData?.data.supplier){
            //   const supplierData = await axios.get(`/api/v1/supplier/${approvalData?.data.supplier}`);
            //   approvalData?.data.supplier = supplierData.data;
            // }else if(approvalData?.data.contractor){
            //   const contractorData = await axios.get(`/api/v1/contractor/${approvalData?.data.contractor}`);
            //   approvalData?.data.contractor = contractorData.data;
            // }
            setAllApprovals(approvalData)
            setPendingApproval(approvalData)
            console.log(approvalData)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchRejected = async (id) => {
        try {
            console.log(id)
            const response = await axios.get(`/api/v1/approval/rejected/user/${id}`);
            const rejectData = response.data;
            setRejectedApproval(rejectData)
            console.log('rejectData', rejectData)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchApproved = async (id) => {
        try {
            // console.log(id)
            const response = await axios.get(`/api/v1/approval/approved/user/${id}`);
            const approvedData = response.data;
            setApproved(approvedData)
            // console.log(approvedData)
        } catch (error) {
            console.error(error)
        }
    }

    const handleApprove = async (id) => {
        try {
            // console.log(id)
            const response = await axios.put(`/api/v1/approval/${id}`);
            // console.log(response.data)
            setPendingApproval(pendingApprovals.filter((pendingApproval) => pendingApproval._id !== id))
            toast.success(response.data.message)
        } catch (error) {
            console.error(error)
        }
    };

    const handleReject = async (id) => {
        try {
            setRejectId(id);
            setRejectModal(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            console.log(id)
            const response = await axios.delete(`/api/v1/approval/${id}`);
            setApproved(approved.filter((approved) => approved._id !== id))
        } catch (error) {
            console.error(error)
        }
    };

    const navigateTo = (approvalOf, id) => {
        switch (approvalOf) {
            case 'Bill':
                navigate(`/bill/${id}`)
                break;
            case 'Purchase Order':
                navigate(`/purchase-order/${id}`)
                break;
            case 'Work Order':
                navigate(`/work-order/${id}`)
                break;

            default:
                break;
        }
    };

    const ApprovalCard = ({ workDescription, site, by, date, view, approve, reject }) => {
        return (
            <div className=" px-4 py-6 ">
                <h2 className="text-xl font-semibold mb-4 uppercase">{workDescription} {site}</h2>
                <div className='flex flex-col gap-2 text-md'>
                    <div className="flex justify-between gap-4 tracking-tight">
                        <div className="text-gray-600">Date:</div>
                        <div className="text-gray-800">{date ? moment(date).format('DD-MM-YYYY') : '-'}</div>
                    </div>
                    <div className="flex justify-between gap-4 tracking-tight">
                        <div className="text-gray-600">Created By:</div>
                        <div className='text-gray-600'>{by}</div>
                    </div>
                    <div className="flex justify-between gap-4 tracking-tight text-lg mt-2">
                        <button onClick={view} className="text-blue-500 mr-2 hover:text-blue-700">
                            <BiLinkExternal className="inline-block mr-1" />
                            View
                        </button>
                        <button onClick={approve} className="text-green-500 hover:text-green-700 mr-2">
                            <FcApproval className="inline-block mr-1" />
                            Approve
                        </button>
                        <button onClick={reject} className="text-red-500 hover:text-red-700">
                            <LuShieldX className="inline-block mr-1" />
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ApprovedCard = ({ workDescription, site, by, date, view, remove }) => {
        return (
            <div className=" px-4 py-6">
                <h2 className="text-xl font-semibold mb-4 uppercase">{workDescription} {site}</h2>
                <div className='flex flex-col gap-2 text-md'>
                    <div className="flex justify-between gap-4 tracking-tight">
                        <div className="text-gray-600">Date:</div>
                        <div className="text-gray-800">{date ? moment(date).format('DD-MM-YYYY') : '-'}</div>
                    </div>
                    <div className="flex justify-between gap-4 tracking-tight">
                        <div className="text-gray-600">Approved By:</div>
                        <div className='text-gray-600'>{by}</div>
                    </div>
                    <div className="flex justify-between gap-4 tracking-tight text-lg mt-2">
                        <button onClick={view} className="text-blue-500 mr-2 hover:text-blue-700">
                            <BiLinkExternal className="inline-block mr-1" />
                            View
                        </button>
                        <button onClick={remove} className="text-red-500 hover:text-red-700">
                            <MdDelete className="inline-block mr-1" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const RejectCard = ({ workDescription, site, by, date, view, message, remove }) => {
        return (
            <div className=" px-4 py-6">
                <h2 className="text-xl font-semibold mb-4 uppercase">{workDescription} {site}</h2>
                <div className='flex flex-col gap-2 text-md'>
                    <div className="flex justify-between gap-4 tracking-tight">
                        <div className="text-gray-600">Date:</div>
                        <div className="text-gray-800">{date ? moment(date).format('DD-MM-YYYY') : '-'}</div>
                    </div>
                    <div className="flex justify-between gap-4 tracking-tight">
                        <div className="text-gray-600">Approved By:</div>
                        <div className='text-gray-600'>{by}</div>
                    </div>
                    <div className="flex justify-between gap-4 tracking-tight">
                        <div className="text-gray-600">Message:</div>
                        <div className='text-gray-600'>{message}</div>
                    </div>
                    <div className="flex justify-between gap-4 tracking-tight text-lg mt-2">
                        <button onClick={view} className="text-blue-500 mr-2 hover:text-blue-700">
                            <BiLinkExternal className="inline-block mr-1" />
                            View
                        </button>
                        {/* <button onClick={remove} className="text-red-500 hover:text-red-700">
                            <MdDelete className="inline-block mr-1" />
                            Delete
                        </button> */}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div >
            <Header category="Page" title="Approval" />
            <section className='h-full w-full overflow-x-auto'>

                <div className="flex space-x-4 border-b-2 mb-4 w-full md:w-auto">
                    <button
                        className={`px-4 py-2 ${activeTab === "pending" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
                        onClick={() => setActiveTab("pending")}
                    >
                        Pending
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === "approved" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
                        onClick={() => setActiveTab("approved")}
                    >
                        Approved
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === "rejected" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
                        onClick={() => setActiveTab("rejected")}
                    >
                        Rejected
                    </button>
                </div>

                {activeTab === "pending" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1 h-full">
                        {pendingApprovals.map((approval) => (
                            <div key={approval._id} className='bg-white shadow-md rounded-2xl'>
                                <ApprovalCard
                                    workDescription={approval.approvalOf}
                                    date={approval.date}
                                    by={approval.by?.name}
                                    view={() => navigateTo(approval.approvalOf, approval?.data?._id)}
                                    approve={() => handleApprove(approval?._id)}
                                    reject={() => handleReject(approval?._id)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "approved" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1 h-full">
                        {approved.map((approved) => (
                            <div key={approved._id} className='bg-white shadow-md rounded-2xl'>
                                <ApprovedCard
                                    workDescription={approved.approvalOf}
                                    date={approved.date}
                                    by={approved.by?.name}
                                    view={() => navigateTo(approved.approvalOf, approved?.data?._id)}
                                    remove={() => handleDelete(approved?._id)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "rejected" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1 h-full">
                        {rejected.map((reject) => (
                            <div key={reject._id} className='bg-white shadow-md rounded-2xl'>
                                <RejectCard
                                    workDescription={reject.approvalOf}
                                    date={reject.date}
                                    by={reject.by?.name}
                                    message={reject.message}
                                    view={() => navigateTo(reject.approvalOf, reject?.data?._id)}
                                // remove={() => handleDelete(approved?._id)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} head='Reject Reason'>
                    <Reject onClose={() => setRejectModal(false)} Id={rejectId} />
                </Modal>

                <Toaster
                    position="top-right"
                    reverseOrder={false}
                />
            </section>
        </div>
    )
}

export default Approval


