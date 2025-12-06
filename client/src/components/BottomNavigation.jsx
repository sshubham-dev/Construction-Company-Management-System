import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiHome } from "react-icons/fi";
import { AiTwotoneAccountBook } from "react-icons/ai";
import { RiCustomerService2Fill } from "react-icons/ri";
import { MdLocationOn, MdWarehouse } from "react-icons/md";
import { FcManager } from "react-icons/fc";
import { FaCog } from "react-icons/fa";

const BottomNavigation = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const navItems = [
    {
      icon: <FiHome size={20} />,
      name: "Home",
      to: "/",
      role: [
        "Admin",
        "Company",
        "Accountant",
        "Marketing",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Design Head",
        "Design Engineer",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
        "H.R",
        "Store Helper",
        "Store Incharge",
      ],
    },
    {
      to: "/erp",
      name: "ERP",
      icon: <AiTwotoneAccountBook size={20} />,
      role: ["Admin", "Company", "Ceo", "Accountant", "Account Head"],
    },
    {
      to: "/erp/inventory",
      name: "Store",
      icon: <MdWarehouse size={24} />,
      role: ["Admin", "Ceo", "Accountant", "Account Head", "Store Incharge"],
    },
    {
      to: "/crm",
      name: "CRM",
      icon: <RiCustomerService2Fill size={20} />,
      role: [
        "Admin",
        "Company",
        "Marketing",
        "Ceo",
        "Design Head",
        "Design Engineer",
        "Account Head",
      ],
    },
    {
      name: "Site",
      to: "/sites",
      icon: <MdLocationOn size={20} />,
      role: [
        "Admin",
        "Company",
        "Accountant",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Design Head",
        "Design Engineer",
        "Quality Engineer",
        "Account Head",
      ],
    },
    {
      to: "/hrms/employee/dashboard",
      name: "HRMS",
      icon: <FcManager size={22} />,
      role: ["H.R", "Marketing", "Account Head",],
    },
    {
      to: "/setting",
      name: "Settings",
      icon: <FaCog size={22} />,
      role: [
        "Admin",
        "Company",
        "Client",
        "Supplier",
        "Contractor",
        "Accountant",
        "Marketing",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Design Head",
        "Design Engineer",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
        "HR",
        "Store Incharge",
      ],
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t lg:hidden z-40">
      <div className="flex justify-around py-2">
        {navItems
          .filter((item) => item.role.includes(user.department))
          .map((item, index) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={index}
                to={item.to}
                className={`flex flex-col items-center transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {item.icon}
                <span className="text-xs">{item.name}</span>
              </NavLink>
            );
          })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
