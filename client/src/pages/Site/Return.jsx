import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { MdDelete, MdAdd } from "react-icons/md";
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import ReturnFormModal from '../../components/CreateReturn';
import moment from 'moment';
import { FaExternalLinkAlt } from "react-icons/fa";
import { GrEdit } from "react-icons/gr";
axios.defaults.withCredentials = true;

const ReturnRequest = () => {
    const navigate = useNavigate();
    const [returnRequests, setReturnRequest] = useState([]);  // ✅ Ensure default state is an array
    const [createModal, setCreateModal] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const [editModal, setEditModal] = useState(false);
    const [editId, setEditId] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);

    const handleEdit = (id) => {
        setEditModal(true);
        setEditId(id)
    };
    const handleRedirect = (id) => {
        navigate(`/sites/return/${id}`);
    };
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
                        const siteRequests = response.data.filter((req) => req.site?.id._id === site.id);
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
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Material Type </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Total Material </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Date </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {returnRequests.length > 0 ? (
                                returnRequests.map((returnRequest, index) => (
                                    <tr key={index} className='border-b border-blue-gray-200'>
                                        <Link to={`/sites/return/${returnRequest._id}`} className="px-6 py-4">
                                            {returnRequest.site?.name}
                                        </Link>
                                        <td className="px-6 py-4 text-center">{returnRequest?.materialType}</td>
                                        <td className="px-6 py-4 text-center">{returnRequest?.returnable.length || 0}</td>
                                        <td className="px-6 py-4 text-center">{moment(returnRequest?.date).format('DD-MM-YYYY') || 0}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleRedirect(returnRequest._id)} className="mr-2">
                                                <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(returnRequest._id)}
                                                className="mr-2">
                                                <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                                            </button>
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

            <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Return Request'>
                <ReturnFormModal onClose={() => setCreateModal(false)} />
            </Modal>
            <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Edit Return Request'>
                <ReturnFormModal onClose={() => setEditModal(false)} editId={editId} />
            </Modal>
        </div>
    );
};

export default ReturnRequest;
