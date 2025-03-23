import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import { IoIosAddCircle } from "react-icons/io";
import CreateContra from "../../components/CreateContra";
import Modal from "../../components/Modal";


const Contra = () => {
    const [contraVouchers, setContraVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchContraVouchers = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/api/v1/contra");
                console.log(response.data)
                setContraVouchers(response.data);
            } catch (error) {
                console.error("Error fetching Contra vouchers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContraVouchers();
    }, []);

    return (
        <div>
            <section className="overflow-x-auto">
                <Header category="Page" title="Contra Voucher" />
                <div className="w-full mx-auto mb-6 text-gray-700 p-1 flex flex-row justify-end items-center">
                    <button
                        className="bg-blue-500 text-white py-2 px-2 rounded-4xl shadow-lg "
                        onClick={() => setIsModalOpen(true)}>
                        <IoIosAddCircle size={24} />
                    </button>
                </div>
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full whitespace-nowrap overflow-x-auto scrollbar-hide">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left border-b">Voucher No</th>
                                <th className="px-4 py-2 text-left border-b">Date</th>
                                <th className="px-4 py-2 text-left border-b">From Account</th>
                                <th className="px-4 py-2 text-left border-b">To Account</th>
                                <th className="px-4 py-2 text-left border-b">Amount</th>
                                <th className="px-4 py-2 text-left border-b">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contraVouchers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-2 text-center">No vouchers available.</td>
                                </tr>
                            ) : (
                                contraVouchers.map((voucher) => (
                                    <tr key={voucher._id} className="border-b bg-white">
                                        <td className="px-4 py-2">{voucher.voucherNo}</td>
                                        <td className="px-4 py-2">{new Date(voucher.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2">{voucher.from.name}</td>
                                        <td className="px-4 py-2">{voucher.to.name}</td>
                                        <td className="px-4 py-2">{voucher.amount}</td>
                                        <td className="px-4 py-2">{voucher.description || "N/A"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                )}
                {/* Add/Edit Modal */}
                <Modal onClose={() => setIsModalOpen(false)} isOpen={isModalOpen} head='Record Contra'>
                    <CreateContra onClose={() => setIsModalOpen(false)} isOpen={isModalOpen} />
                </Modal>
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                />
            </section>
        </div>
    );
};


export default Contra