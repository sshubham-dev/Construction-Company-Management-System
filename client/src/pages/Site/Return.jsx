import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { MdDelete, MdAdd } from "react-icons/md";
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import ReturnFormModal from '../../components/CreateReturn';
axios.defaults.withCredentials = true;

const ReturnRequest = () => {
    const navigate = useNavigate();
    const [returnRequests, setReturnRequest] = useState([]);  // ✅ Ensure default state is an array
    const [createModal, setCreateModal] = useState(false);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchReturnRequest = async () => {
            try {
                const response = await axios.get('/api/v1/return');
                console.log("API Response:", response.data); // ✅ Debugging log

                if (!Array.isArray(response.data)) {
                    throw new Error("Invalid data format: Expected an array");
                }

                if (user?.department === 'Site Supervisor' || user?.department === 'Site Incharge') {
                    const sites = user?.site || [];
                    let filteredRequests = [];

                    for (let site of sites) {
                        const siteRequests = response.data.filter((req) => req.site?._id.includes(site));
                        filteredRequests = [...filteredRequests, ...siteRequests];
                    }

                    setReturnRequest(filteredRequests);
                } else {
                    setReturnRequest(response.data);
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                toast.error("Failed to load return requests.");
                setReturnRequest([]);  // ✅ Ensure it remains an array
            }
        };

        fetchReturnRequest();
    }, [user]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/v1/return/${id}`);
            setReturnRequest((prevRequests) => prevRequests.filter((req) => req._id !== id));
        } catch (error) {
            console.error("Delete Error:", error);
            toast.error("Failed to delete return request.");
        }
    };

    return (
        <div>
            <section className="overflow-x-auto scrollbar-hide">
                <Header category="Page" title="Return Request" />

                <div className="w-full mx-auto text-gray-700 p-1 flex flex-row justify-between items-center">
                    <h2 className="text-lg text-green-600 mr-4 pr-4">
                        Total Return Requests: {returnRequests.length}
                    </h2>
                    <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
                        <MdAdd className='text-xl' />
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-x-auto scrollbar-hide">
                    <table className="w-full border-collapse overflow-x-auto table-auto whitespace-nowrap">
                        <thead >
                            <tr className="text-left bg-gray-300">
                                <th className="font-semibold text-sm uppercase px-6 py-4"> Name </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Admin Approve </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Total Amount </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Total Paid </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Total Due </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {returnRequests.length > 0 ? (
                                returnRequests.map((returnRequest) => (
                                    <tr key={returnRequest._id} className='border-b border-blue-gray-200'>
                                        <td className="px-6 py-4">
                                            <p>{returnRequest.site?.name}</p>
                                            <p className="text-gray-500 text-sm font-semibold">{returnRequest.supplier?.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">{returnRequest?.adminApprove}</td>
                                        <td className="px-6 py-4 text-center">₹ {returnRequest?.totalValue || 0}</td>
                                        <td className="px-6 py-4 text-center">₹ {returnRequest?.totalPaid || 0}</td>
                                        <td className="px-6 py-4 text-center">₹ {returnRequest?.totalDue || 0}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleDelete(returnRequest._id)} className="mr-2">
                                                <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-gray-500">
                                        No return requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Toaster position="top-right" reverseOrder={false} />
            </section>

            {createModal && (
                <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Return Request'>
                    <ReturnFormModal onClose={() => setCreateModal(false)} />
                </Modal>
            )}
        </div>
    );
};

export default ReturnRequest;
