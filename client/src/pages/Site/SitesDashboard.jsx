import React, { useState } from 'react';
import { FaPersonShelter } from 'react-icons/fa6';
import { GrSchedulePlay, GrUserWorker } from 'react-icons/gr';
import { TbCalendarDollar, TbTruckReturn } from 'react-icons/tb';
import { LuCalendarCheck2, LuClipboardCheck } from 'react-icons/lu';
import { MdWork, MdBuild } from 'react-icons/md';
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia';
import { BiSolidPurchaseTag } from 'react-icons/bi';
import toast, { Toaster } from 'react-hot-toast';
import Sites from './Site';
import Report from './Report';
import ProjectSchedules from './ProjectSchedules';
import PaymentSchedules from './PaymentSchedule';
import QualitySchedules from './QualitySchedules';
import WorkOrders from './WorkOrder';
import Bills from './Bill';
import PurchaseRequest from './PurchaseRequest';
import ReturnOrders from './ReturnOrders';
import ExtraWork from './ExtraWork';
import Contractors from './Contractors';
import CheckList from './CheckList';

const SitesDashboard = () => {
    const menu = [
        { to: <Sites/>, name: 'Sites', icon: <FaPersonShelter />, role: ['Admin', 'Company', 'Ceo', 'Account Head'] },
        { to: <Report/>, name: 'Report', icon: <FaPersonShelter />, role: ['Admin', 'Company', 'Ceo', 'Account Head'] },
        { to: <ProjectSchedules/>, name: 'Project Schedules', icon: <GrSchedulePlay />, role: ['Admin', 'Company', 'Client', 'Contractor', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'] },
        { to: <PaymentSchedules />, name: 'Payment Schedules', icon: <TbCalendarDollar />, role: ['Admin', 'Company', 'Client', 'Contractor', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'] },
        { to: < QualitySchedules/>, name: 'Quality Schedules', icon: <LuCalendarCheck2 />, role: ['Admin', 'Company', 'Client', 'Ceo', 'Quality Head', 'Quality Engineer', 'Account Head'] },
        { to: <WorkOrders />, name: 'Work-Orders', icon: <MdWork />, role: ['Admin', 'Company', 'Ceo', 'Contractor', 'Accountant', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'] },
        { to: <Bills/>, name: 'Bills', icon: <LiaFileInvoiceDollarSolid />, role: ['Admin', 'Company', 'Supplier', 'Contractor', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'] },
        { to: <PurchaseRequest />, name: 'Purchase-Requests', icon: <BiSolidPurchaseTag />, role: ['Admin', 'Company', 'Supplier', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'] },
        { to: <ReturnOrders />, name: 'Return-Orders', icon: <TbTruckReturn />, role: ['Admin', 'Company', 'Supplier', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'] },
        { to: <ExtraWork/>, name: 'Extra-Works', icon: <MdBuild />, role: ['Admin', 'Company', 'Client', 'Supplier', 'Contractor', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'] },
        { to: <Contractors/>, name: 'Contractors', icon: <GrUserWorker />, role: ['Admin', 'Company', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'] },
        { to: <CheckList/>, name: 'Check-List', icon: <LuClipboardCheck />, role: ['Admin', 'Company', 'Contractor', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'] },
    ];

    const [activeTab, setActiveTab] = useState(menu[0].name);

    return (
            <section className="w-full flex flex-col items-center">
                {/* Tabs */}
                <nav className="flex justify-between gap-1 border-b-2 mb-8 w-full max-w-screen-xl px-2 sm:gap-4 overflow-x-auto scrollbar-hide scroll-p-2">
                    {menu.map((item, index) => (
                        <button
                            key={index}
                            className={`flex items-center flex-col min-w-fit gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === item.name
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

export default SitesDashboard;
