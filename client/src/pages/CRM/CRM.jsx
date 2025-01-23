import React, { useState } from 'react';
import { RiCustomerService2Fill } from 'react-icons/ri';
import { FaPersonCircleQuestion, FaPersonCircleCheck } from 'react-icons/fa6';
import { AiOutlineProject } from 'react-icons/ai';
import { TbInvoice } from 'react-icons/tb';
import toast, { Toaster } from 'react-hot-toast';
import Lead from './Lead.jsx';
import Clients from './Clients.jsx';
import Project from './Project.jsx';
import Invoice from './Invoice.jsx';

const CRM = () => {
    const menu = [
        {
            to: <Lead />,
            name: 'Lead',
            icon: <FaPersonCircleQuestion />,
            role: ['Admin', 'Company', 'Marketing', 'Ceo', 'Design Head', 'Design Engineer', 'Account Head'],
        },
        {
            to: <Clients />,
            name: 'Client',
            icon: <FaPersonCircleCheck />,
            role: ['Admin', 'Company', 'Ceo', 'Design Head', 'Design Engineer', 'Account Head'],
        },
        {
            to: <Project />,
            name: 'Project',
            icon: <AiOutlineProject />,
            role: ['Admin', 'Company', 'Ceo', 'Design Head', 'Design Engineer', 'Account Head'],
        },
        {
            to: <Invoice/>,
            name: 'Invoice',
            icon: <TbInvoice />,
            role: ['Admin', 'Company', 'Ceo', 'Design Head', 'Design Engineer', 'Account Head'],
        },
    ];

    const [activeTab, setActiveTab] = useState(menu[0].name);

    return (
            <section className="w-full flex flex-col items-center">
                {/* Tabs */}
                <nav
                    className="flex justify-between border-b-2 mb-8 w-full max-w-screen-xl px-2 sm:gap-4 overflow-x-auto scrollbar-hide"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {menu.map((item, index) => (
                        <button
                            key={index}
                            className={`flex items-center flex-col gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                activeTab === item.name
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-600 hover:text-blue-500'
                            }`}
                            onClick={() => setActiveTab(item.name)}
                        >
                            <span className="text-xs md:text-sm lg:text-md">{item.name}</span>
                        </button>
                    ))}
                </nav>
    
                {/* Tab Content */}
                <div className="w-full max-w-screen-xl">
                    {menu.map((item, index) =>
                        activeTab === item.name ? (
                            item.to
                        ) : null
                    )}
                </div>
            <Toaster position="top-right" reverseOrder={false} />
            </section>
    );
    
};

export default CRM;
