import React from "react";
import { useSelector } from 'react-redux';
import { NavLink } from "react-router-dom";
import { FaClipboardList, FaCog, FaInfoCircle } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";  // Fixed import
import { GiExpense } from "react-icons/gi";  // Fixed import
import { MdPerson, MdAssignment } from "react-icons/md";
import { FcManager, FcApproval } from "react-icons/fc";
import { FaBusinessTime } from "react-icons/fa";


const MorePage = ({options}) => {
  const { user } = useSelector((state) => state.auth);
  const MoreOptions = [
    {
      to: '/attendance',
      name: 'Attendance',
      icon: <FaBusinessTime size={22} />,
      role: ['Admin', 'Company', 'Accountant', 'Marketing', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head', 'H.R']
    },

    {
      to: '/settings',
      name: 'Settings',
      icon: <FaCog size={22} />,
      role: ['Admin', 'Company', 'Client', 'Supplier', 'Contractor', 'Accountant', 'Marketing', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head', 'H.R'],
    },

    {
      to: '/profile',
      name: 'Profile',
      icon: <CgProfile size={22} />,
      role: ['Admin', 'Company', 'Client', 'Supplier', 'Contractor', 'Accountant', 'Marketing', 'Marketing Incharge', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head']
    },

    {
      to: '/user',
      name: 'Users Management',
      icon: <MdPerson size={22} />,
      role: ['Admin', 'Company', 'Ceo', 'Account Head']
    },

    {
      to: '/site-kharchi',
      name: 'Expenses Record',
      icon: <GiExpense size={22} />,
      role: ['Admin', 'Company', 'Accountant', 'Marketing', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head', 'H.R']
    },

    /* Employee Management*/
    {
      to: '/employee',
      name: 'Employee Management',
      icon: <FcManager size={22} />,
      role: ['Admin', 'Company', 'Ceo', 'Account Head', 'H.R'],
    },

    {
      to: '/approval',
      name: 'Approval',
      icon: <FcApproval size={22} />,
      role: ['Admin', 'Company', 'Company', 'Client', 'Supplier', 'Contractor', 'Accountant', 'Ceo', 'Site Incharge', 'Quality Head', 'Quality Engineer', 'Account Head']
    },

    {
      to: '/work-details',
      name: 'Work-Details',
      icon: <MdAssignment size={22} />,
      role: ['Admin', 'Company', 'Company', 'Client', 'Supplier', 'Contractor', 'Accountant', 'Marketing', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head'],
    },

    {
      to: '/help',
      name: 'Help',
      icon: <FaInfoCircle size={22} />,
      role: ['Admin', 'Company', 'Client', 'Supplier', 'Contractor', 'Accountant', 'Marketing', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head', 'H.R'],
    },

    {
      to: '/terms',
      name: 'Terms & Conditions',
      icon: <FaClipboardList size={22} />,
      role: ['Admin', 'Company', 'Client', 'Supplier', 'Contractor', 'Accountant', 'Marketing', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head', 'H.R'],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-semibold mb-4">More Options</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(options || MoreOptions).map((option, index) =>
          option.role.includes(user.department) && (
            <div key={index} className="bg-white shadow-lg p-4 rounded-md hover:bg-gray-100 transition-all">
              <NavLink to={option.to} className="flex items-center space-x-2 text-lg text-gray-700">
                {option.icon}
                <span>{option.name}</span>
              </NavLink>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MorePage;
