import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import Header from '../../components/Header';
import { useSelector } from 'react-redux'
import CreateContractor from '../../components/CreateContractor';
import Modal from '../../components/Modal';
axios.defaults.withCredentials = true;

const Contractors = () => {
    const navigate = useNavigate();
    const [contractors, setContractor] = useState([]);
    const { user, isLoggedIn } = useSelector((state) => state.auth)
    const [createModal, setCreateModal] = useState(false);

    useEffect(() => {
        getContractors();
    }, []);

    const getContractors = async () => {
        try {
            const contractorData = await axios.get('/api/v1/contractor');
            console.log(contractorData.data)
            setContractor(contractorData.data);
        } catch (error) {
            console.error(error)
        }
    }

    const handleEdit = (id) => {
        navigate(`/edit-contractor/${id}`)
    };

    const handleDelete = async (id) => {
        try {
            const contractorData = await axios.delete(`/api/v1/contractor/${id}`);
            setContractor(contractors.filter((contractor) => contractor._id !== id));
            toast.success(contractorData.data.message);
        } catch (error) {
            console.error(error)
        }
    };

    return (
        <div >
            <div className="overflow-x-auto scrollbar-hide">
                <Header category="Page" title="Contractor's" />
                <div className="w-full mx-auto mb-6 text-gray-700 p-1 flex flex-row justify-between items-center">
                    <h2 className="text-lg text-wrap sm:text-md md:text-lg lg:text-xl text-green-600 mr-4 pr-4">
                        Total Contractor: {contractors?.length}
                    </h2>
                    {/* {user.department === 'Site Incharge' && ( */}
                    <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
                        <MdAdd className='text-xl' />
                    </button>
                    {/* )} */}
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <table className='w-full whitespace-nowrap divide-y divide-gray-300 overflow-hidden'>
                        <thead className="bg-gray-300">
                            <tr className=" text-left">
                                <th className="font-semibold text-sm uppercase px-6 py-4 "> Contractor </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4"> Contact No. </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Total Sites </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {contractors?.map((contractor) => (
                                <tr key={contractor._id} className='border-b border-blue-gray-200'>
                                    <td className="px-6 py-4">
                                        {contractor.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm"> {contractor.contactNo} </p>
                                        <p className="text-gray-500 text-sm tracking-wide"> {contractor.whatsapp} </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {contractor.site?.length}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* <button onClick={() => handleRedirect(contractor._id)} className="mr-2">
                                            <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                                        </button> */}
                                        {/* <button onClick={() => handleEdit(contractor._id)} className="mr-2">
                                            <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                                        </button> */}
                                        <button onClick={() => handleDelete(contractor._id)} className="mr-2">
                                            <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Toaster
                    position="top-right"
                    reverseOrder={false}
                />
            </div>
            {/* Contractor Modal */}
            {createModal && (
                <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Contractor' >
                    <CreateContractor onClose={() => setCreateModal(false)} />
                </Modal>
            )}
        </div>
    )
}

export default Contractors