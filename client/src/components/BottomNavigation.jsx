import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiTwotoneAccountBook, AiOutlineClose } from "react-icons/ai";
import { MdInventory, MdWarehouse, MdTrolley, MdLocationOn, MdBuild, MdWork, MdOutlineMoreHoriz, MdAccountBalance } from "react-icons/md";
import { GrUserWorker, GrSchedulePlay } from "react-icons/gr";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { AiOutlineProject } from "react-icons/ai";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { TbCalendarDollar, TbInvoice } from "react-icons/tb";
import { LuCalendarCheck2, LuClipboardCheck } from "react-icons/lu";
import { RiCustomerService2Fill } from "react-icons/ri";
import { FaWallet, FaBalanceScale, FaReceipt } from "react-icons/fa";
import { TbTruckReturn } from "react-icons/tb";
import { FaPersonCircleQuestion, FaPersonCircleCheck, FaPersonShelter, FaTruckArrowRight, FaTruckMedical, FaMoneyBillTransfer } from "react-icons/fa6";



const BottomNavigation = () => {
  const { user } = useSelector((state) => state.auth);
  const [modal, setModal] = useState(null); // Track the active modal

  const navItems = [
    {
      to: '/erp',
      name: 'ERP',
      icon: <AiTwotoneAccountBook />,
      children: [

        /* Accounts Management*/
        // {
        //   to: '/erp/account',
        //   name: 'Accounts Management',
        //   icon: <MdAccountBalance />,
        //   role: ['Admin', 'Company', 'Ceo', 'Account Head', 'Accountant'],
        // },
        {
          to: '/erp/receipt_payment',
          name: 'Receipt & Payment',
          icon: <FaReceipt/>,
          role: ['Admin', 'Company', 'Ceo', 'Account Head'],
        },
        {
          to: '/erp/contra',
          name: 'Contra',
          icon: <FaMoneyBillTransfer />,
          role: ['Admin', 'Company', 'Ceo', 'Account Head'],
        },
        // {
        //   to: '/erp/balance-sheet',
        //   name: 'Balance Sheet',
        //   icon: <FaBalanceScale />,
        //   role: ['Admin', 'Company', 'Ceo', 'Account Head'],
        // },
        // {
        //   to: '/erp/expenses',
        //   name: 'Expenses',
        //   icon: <FaWallet />,
        //   role: ['Admin', 'Company', 'Ceo', 'Account Head'],
        // },


        /* Inventory Management*/
        // {
        //   to: '/erp/inventory',
        //   name: 'Inventory Management',
        //   icon: <MdWarehouse />,
        //   role: ['Admin', 'Company', 'Ceo', 'Accountant', 'Account Head'],
        // },
        {
          to: '/erp/inventory/stock',
          name: 'Stock',
          icon: <MdInventory />,
          role: ['Admin', 'Company', 'Ceo', 'Accountant', 'Account Head'],
        },
        // {
        //   to: '/erp/inventory/sales',
        //   name: 'Sales',
        //   icon: <FaTruckArrowRight style={{ transform: 'rotate(360deg) scaleX(-1)' }} />,
        //   role: ['Admin', 'Company', 'Ceo', 'Accountant', 'Account Head'],
        // },
        // {
        //   to: '/erp/inventory/purchase',
        //   name: 'Purchase',
        //   icon: <FaTruckMedical />,
        //   role: ['Admin', 'Company', 'Ceo', 'Accountant', 'Account Head'],
        // },
        {
          to: '/erp/inventory/purchase-request',
          name: 'Purchase-Request',
          icon: <BiSolidPurchaseTag />,
          role: ['Admin', 'Company', 'Supplier', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'],
        },
        {
          to: '/erp/inventory/return-request',
          name: 'Return-Request',
          icon: <FaTruckArrowRight />,
          role: ['Admin', 'Company', 'Ceo', 'Accountant', 'Account Head'],
        },
        {
          to: '/erp/inventory/suppliers',
          name: 'Suppliers',
          icon: <MdTrolley />,
          role: ['Admin', 'Company', 'Ceo', 'Accountant', 'Account Head'],
        },
      ],
      role: ['Admin', 'Company', 'Ceo', 'Accountant', 'Account Head'],
    },

    {
      to: '/crm',
      name: 'CRM',
      icon: <RiCustomerService2Fill />,
      children: [
        {
          to: '/crm/lead',
          name: 'Lead',
          icon: <FaPersonCircleQuestion />,
          role: ['Admin', 'Company', 'Marketing', 'Ceo', 'Design Head', 'Design Engineer', 'Account Head'],
        },
        {
          to: '/crm/client',
          name: 'Client',
          icon: <FaPersonCircleCheck />,
          role: ['Admin', 'Company', 'Ceo', 'Design Head', 'Design Engineer', 'Account Head'],
        },
        // {
        //   to: '/crm/project',
        //   name: 'Project',
        //   icon: <AiOutlineProject />,
        //   role: ['Admin', 'Company', 'Ceo', 'Design Head', 'Design Engineer', 'Account Head'],
        // },
        // {
        //   to: '/crm/invoice',
        //   name: 'Invoice',
        //   icon: <TbInvoice />,
        //   role: ['Admin', 'Company', 'Ceo', 'Design Head', 'Design Engineer', 'Account Head'],
        // },
      ],
      role: ['Admin', 'Company', 'Marketing', 'Ceo', 'Design Head', 'Design Engineer', 'Account Head'],
    },

    {
      name: "Site",
      to: '/sites',
      icon: <MdLocationOn />,
      role: ['Admin', 'Company', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Engineer', 'Account Head'],
      children: [
        // {
        //   to: '/site/report',
        //   name: 'Sites Report',
        //   icon: <FaPersonShelter />,
        //   role: ['Admin', 'Company', 'Ceo', 'Account Head']
        // },
        {
          to: '/sites/project-schedules',
          name: 'Project Schedules',
          icon: <GrSchedulePlay />,
          role: ['Admin', 'Company', 'Client', 'Contractor', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Engineer', 'Account Head'],
        },
        {
          to: '/sites/payment-schedules',
          name: 'Payment Schedules',
          icon: <TbCalendarDollar />,
          role: ['Admin', 'Company', 'Contractor', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Engineer', 'Account Head'],
        },
        {
          to: '/sites/quality-schedules',
          name: 'Quality Schedules',
          icon: <LuCalendarCheck2 />,
          role: ['Admin', 'Company', 'Ceo', 'Quality Head', 'Quality Engineer', 'Account Head'],
        },
        {
          to: '/sites/work-orders',
          name: 'Work-Orders',
          icon: <MdWork />,
          role: ['Admin', 'Company', 'Ceo', 'Contractor', 'Accountant', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'],
        },
        {
          to: '/sites/bills',
          name: 'Bills',
          icon: <LiaFileInvoiceDollarSolid />,
          role: ['Admin', 'Company', 'Supplier', 'Contractor', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'],
        },
        {
          to: '/site/purchase-request',
          name: 'Purchase-Request',
          icon: <BiSolidPurchaseTag />,
          role: ['Admin', 'Company', 'Supplier', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'],
        },
        {
          to: '/sites/return',
          name: 'Return-Request',
          icon: <TbTruckReturn />,
          role: ['Admin', 'Company', 'Supplier', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'],
        },
        {
          to: '/sites/extra-work',
          name: 'Extra-Works',
          icon: <MdBuild />,
          role: ['Admin', 'Company', 'Supplier', 'Contractor', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'],
        },
        {
          to: '/sites/contractors',
          name: 'Contractors',
          icon: <GrUserWorker />,
          role: ['Admin', 'Company', 'Accountant', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Quality Head', 'Quality Engineer', 'Account Head'],
        },
        {
          to: '/sites/checklists',
          name: 'Check-List ',
          icon: <LuClipboardCheck />,
          role: ['Admin', 'Company', 'Ceo', 'Site Incharge', 'Quality Engineer', 'Account Head'],
        },
      ],
    },

    {
      to: '/more',
      name: "More",
      icon: <MdOutlineMoreHoriz />,
      role: ['Admin', 'Company', 'Accountant', 'Marketing', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head', 'H.R'],
    },
  ];

  const openModal = (item) => {
    if (item.children) setModal(item.name); // Open modal if item has children
    else setModal(null); // Close modal if no children exist
  };

  return (
    <div className="fixed bottom-0 w-full bg-white border-t shadow-lg flex justify-around items-center h-14 z-50 sm:h-16 md:h-20">
      {/* Main Menu */}
      {navItems.map(
        (item, index) =>
          item.role.includes(user.department) && (
            <NavLink
              key={index}
              to={item.to}
              className="flex flex-col items-center text-gray-500 hover:text-blue-500 cursor-pointer"
              onClick={() => openModal(item)}
            >
              <span className="text-xl sm:text-2xl"> {item.icon}</span>
              <span className="text-xs sm:text-sm md:text-base">{item.name}</span>
              {/* <div
              key={index}
              className="flex flex-col items-center text-gray-500 hover:text-blue-500 cursor-pointer"
              onClick={() => openModal(item)}
              >
              <div className="text-xl sm:text-2xl">{item.icon}</div>
              <span className="text-xs sm:text-sm md:text-base">{item.name}</span>
            </div> */}
            </NavLink>
          )
      )}

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 mt-2"
          onClick={() => setModal(null)} // Close modal when clicking on the backdrop
        >
          <div
            className="bg-white rounded-lg shadow-lg w-4/5 max-w-md max-h-[75vh] p-3 overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{modal}</h2>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => setModal(null)}
              >
                <AiOutlineClose className="text-2xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col space-y-1 overflow-y-auto max-h-[60vh] p-2 mb-2">
              {navItems
                .find((item) => item.name === modal)
                ?.children.map((child, index) =>
                  child.role.includes(user.department) && (
                    <NavLink
                      key={index}
                      to={child.to}
                      className="p-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700 space-x-4"
                      onClick={() => setModal(null)}
                    >
                      <span className="text-xl"> {child.icon} </span>
                      <span className="text-md">{child.name}</span>
                    </NavLink>
                  ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BottomNavigation;
