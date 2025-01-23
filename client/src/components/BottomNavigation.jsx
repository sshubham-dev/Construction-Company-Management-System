import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from 'react-redux';
import { MdPerson, MdInventory, MdDateRange, MdWarehouse, MdWorkHistory, MdTrolley, MdMessage, MdOutlineCancel, MdLocationOn, MdBusiness, MdPeople, MdReceipt, MdConstruction, MdApproval, MdBuild, MdDesignServices, MdMoney, MdAssignment, MdWork, MdManageAccounts, MdAccountBalance, MdOutlineMoreHoriz } from "react-icons/md";
import { AiFillNotification, AiFillPieChart, AiOutlineMenu, AiOutlineProject } from "react-icons/ai";
import { CgProfile } from 'react-icons/cg'
import { GiExpense } from "react-icons/gi";
import { RiCustomerService2Fill } from "react-icons/ri";
import { FcManager, FcApproval } from "react-icons/fc";
import { FaWallet, FaBalanceScale, FaFileInvoiceDollar, FaBusinessTime } from "react-icons/fa";
import { AiTwotoneAccountBook } from "react-icons/ai";
import { FaHome } from "react-icons/fa";

const BottomNavigation = () => {
  const { user } = useSelector((state) => state.auth);
  const navItems = [
    /* ERP */
    {
      to: '/erp',
      name: 'ERP',
      icon: <AiTwotoneAccountBook />,
      role: ['Admin', 'Company', 'Ceo', 'Accountant', 'Account Head'],
    },

    /* Customer Management*/
    {
      to: '/crm',
      name: 'CRM',
      icon: <RiCustomerService2Fill />,
      role: ['Admin', 'Company', 'Marketing', 'Ceo', 'Design Head', 'Design Engineer', 'Account Head'],
    },

    /* Site Management*/
    {
      to: '/site',
      name: 'Site',
      icon: <MdLocationOn />,
      role: ['Admin', 'Company', 'Accountant', 'Ceo', 'Site Incharge', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head'],
    },

    /* Site Management*/
    {
      to: '/more',
      name: 'more',
      icon: <MdOutlineMoreHoriz />,
      role:  ['Admin', 'Company', 'Client', 'Supplier', 'Contractor', 'Accountant', 'Marketing', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head', 'H.R'],
    },

  ];

  return (
    <div className="fixed bottom-0 w-full bg-white border-t-2 shadow-lg flex justify-evenly items-center h-14 z-50">
      {navItems.map((item, index) => (
        item.role.includes(user.department) && (
          < NavLink
            key={index}
            to={item.to}
            className="flex flex-col items-center text-gray-500 hover:text-blue-500"
            activeClassName="text-blue-500"
          >
            <div className="text-2xl">{item.icon}</div>
            <span className="text-xs">{item.name}</span>
          </NavLink>
        )))
      }
    </div >
  );
};

export default BottomNavigation;

