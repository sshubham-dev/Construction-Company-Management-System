import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import { useSelector } from 'react-redux';
import { FaExternalLinkAlt } from "react-icons/fa";
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import CreateSupplier from '../../components/CreateSupplier';

const Suppliers = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const { user } = useSelector((state) => state.auth);
    const [createModal, setCreateModal] = useState(false);

    useEffect(() => {
        const getSuppliers = async () => {
            try {
                const supplierData = await axios.get('/api/v1/supplier');
                setSuppliers(supplierData.data);
            } catch (error) {
                console.error(error)
            }
        }
        getSuppliers();
    }, [])

    const handleEdit = (id) => {
        navigate(`/edit-supplier/${id}`)
    };

    const handleRedirect = (id) => {
        navigate(`/supplier/${id}`);
    }

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/v1/supplier/${id}`);
            setSuppliers(suppliers.filter((supplier) => supplier._id !== id));
        } catch (error) {
            toast.error(error.message)
        }
    };


    return (
        <div >
            <section className="overflow-x-auto">
                <Header category="Page" title="Supplier's" />
                <div className="w-full mx-auto mb-6 text-gray-700 p-1 flex flex-row justify-between items-center">
                    <h2 className="text-lg text-wrap sm:text-md md:text-lg lg:text-xl text-green-600 mr-4 pr-4">
                        Total Suppliers: {suppliers?.length}
                    </h2>
                    {user.department === 'Site Incharge' || user.department === 'Account Head' && (
                        <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
                            <MdAdd className='text-xl' />
                        </button>)}
                </div>

                <div className="overflow-x-auto"
                    style={{
                        scrollbarWidth: 'none',
                        '-ms-overflow-style': 'none',
                    }}>
                    <table className='w-full whitespace-nowrap divide-y divide-gray-300 overflow-hidden'>
                        <thead className="bg-gray-800">
                            <tr className="text-white text-left">
                                <th className="font-semibold text-sm uppercase px-6 py-4 "> Name </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4"> Contact No. </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> GST No </th>
                                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {suppliers?.map((supplier) => (
                                <tr key={supplier._id} className='border-b border-blue-gray-200'>
                                    <td className="px-6 py-4">
                                        {supplier.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm"> {supplier.contactNo} </p>
                                        <p className="text-gray-500 text-sm tracking-wide"> {supplier.whatsapp} </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {supplier.gst}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* <button onClick={() => handleRedirect(supplier._id)} className="mr-2">
                                            <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                                        </button> */}
                                        <button onClick={() => handleEdit(supplier._id)} className="mr-2">
                                            <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                                        </button>
                                        <button onClick={() => handleDelete(supplier._id)} className="mr-2">
                                            <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Modal onClose={() => setCreateModal(false)} isOpen={createModal} head='Create Supplier'>
                    <CreateSupplier
                        onClose={() => setCreateModal(false)} />
                </Modal>
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                />
            </section>
        </div>
    )
}

export default Suppliers