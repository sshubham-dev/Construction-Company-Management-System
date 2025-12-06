import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import logo from "../asset/logo.webp";
import {
  MdPerson,
  MdInventory,
  MdDateRange,
  MdWarehouse,
  MdWorkHistory,
  MdTrolley,
  MdMessage,
  MdOutlineCancel,
  MdLocationOn,
  MdBusiness,
  MdPeople,
  MdReceipt,
  MdConstruction,
  MdApproval,
  MdBuild,
  MdDesignServices,
  MdMoney,
  MdAssignment,
  MdWork,
  MdManageAccounts,
  MdAccountBalance,
  MdRequestQuote,
} from "react-icons/md";
import { ImBlog } from "react-icons/im";
import { GrUserWorker, GrSchedulePlay } from "react-icons/gr";
import { BiSolidPurchaseTag } from "react-icons/bi";
import {
  AiFillNotification,
  AiFillPieChart,
  AiOutlineMenu,
  AiOutlineProject,
} from "react-icons/ai";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { CgProfile } from "react-icons/cg";
import { TbCalendarDollar, TbInvoice } from "react-icons/tb";
import { LuCalendarCheck2, LuClipboardCheck } from "react-icons/lu";
import { GiExpense } from "react-icons/gi";
import { IoIosJournal } from "react-icons/io";
import { FcCustomerSupport } from "react-icons/fc";
import { RiCustomerService2Fill } from "react-icons/ri";
import { FcManager, FcApproval } from "react-icons/fc";
import {
  FaWallet,
  FaBalanceScale,
  FaFileInvoiceDollar,
  FaBusinessTime,
  FaCog,
} from "react-icons/fa";
import { TbTruckReturn } from "react-icons/tb";
import {
  FaPersonCircleQuestion,
  FaPersonCircleCheck,
  FaPersonShelter,
  FaTruckArrowRight,
  FaTruckMedical,
} from "react-icons/fa6";
import { HiUserGroup } from "react-icons/hi2";
import { AiTwotoneAccountBook } from "react-icons/ai";
import { FaReceipt } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { PiNoteFill } from "react-icons/pi";
import { TbReportAnalytics } from "react-icons/tb";
import { FaUserCheck } from "react-icons/fa";
import { FaRegCalendarCheck } from "react-icons/fa6";
import {
  FiHome,
  FiLayers,
  FiUsers,
  FiBox,
  FiBriefcase,
  FiBarChart2,
  FiX,
} from "react-icons/fi";

const Sidebar = ({ isOpen, onClose }) => {
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const [openDropdowns, setOpenDropdowns] = useState({}); // Track dropdown states
  const [isDesktop, setIsDesktop] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  // Detect screen size for desktop vs mobile
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDropdown = (menu) => {
    setOpenDropdowns((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const Menus = [
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
      to: "/attendance",
      name: "Attendance",
      icon: <FaBusinessTime />,
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
      to: "/user",
      name: "Users Management",
      icon: <MdPerson />,
      role: ["Admin", "Company", "Ceo", "Account Head"],
    },

    {
      to: "/site-kharchi",
      name: "Expenses Record",
      icon: <GiExpense />,
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
        "HR",
        "Store Incharge",
      ],
    },

    /* ERP */
    /* Accounts Management*/
    {
      to: "/erp/account",
      name: "Accounts Management",
      icon: <MdAccountBalance />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/ledger",
      name: "Report",
      icon: <TbReportAnalytics />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/receipt_payment",
      name: "Receipt & Payment",
      icon: <FaReceipt />,
      role: ["Admin", "Company", "Ceo", "Account Head"],
    },
    {
      to: "/erp/contra",
      name: "Contra",
      icon: <FaMoneyBillTransfer />,
      role: ["Admin", "Company", "Ceo", "Account Head"],
    },
    {
      to: "/erp/journal",
      name: "Journal",
      icon: <IoIosJournal />,
      role: ["Admin", "Company", "Ceo", "Account Head"],
    },
    {
      to: "/erp/business_unit",
      name: "Business Unit",
      icon: <IoIosJournal />,
      role: ["Admin", "Company", "Ceo", "Account Head"],
    },
    // {
    //   to: '/erp/credit-note',
    //   name: 'Credit / Debit Note',
    //   icon: <PiNoteFill />,
    //   role: ['Admin', 'Company', 'Ceo', 'Account Head'],
    // },
    {
      to: "/erp/balance-sheet",
      name: "Balance Sheet",
      icon: <FaBalanceScale />,
      role: ["Admin", "Company", "Ceo", "Account Head"],
    },
    // {
    //   to: '/erp/expenses',
    //   name: 'Expenses',
    //   icon: <FaWallet />,
    //   role: ['Admin', 'Company', 'Ceo', 'Account Head'],
    // },

    /* Inventory Management*/
    {
      to: "/erp/inventory",
      name: "Inventory Management",
      icon: <MdWarehouse />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Accountant",
        "Account Head",
        "Store Incharge",
      ],
    },
    {
      to: "/erp-setting",
      name: "Setting",
      icon: <TbReportAnalytics />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/inventory/stock",
      name: "Stock",
      icon: <MdInventory />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Accountant",
        "Account Head",
        "Store Helper",
        "Store Incharge",
      ],
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
      to: "/erp/inventory/purchase-request",
      name: "Purchase-Request",
      icon: <BiSolidPurchaseTag />,
      role: [
        "Admin",
        "Company",
        "Supplier",
        "Accountant",
        "Ceo",
        "Site Incharge",
        "Account Head",
        "Store Helper",
        "Store Incharge",
      ],
    },
    {
      to: "/erp/inventory/return-request",
      name: "Return-Request",
      icon: <FaTruckArrowRight />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Accountant",
        "Account Head",
        "Store Helper",
        "Store Incharge",
      ],
    },
    {
      to: "/erp/inventory/suppliers",
      name: "Suppliers",
      icon: <MdTrolley />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Accountant",
        "Account Head",
        "Store Incharge",
      ],
    },

    /* Customer Management*/
    // {
    //   to: '/design',
    //   name: 'Design',
    //   icon: <MdDesignServices />,
    //   role: ['Company', 'Ceo', 'Design Head', 'Design Engineer']
    // },
    {
      to: "/crm/leads",
      name: "Lead",
      icon: <FaPersonCircleQuestion />,
      role: [
        "Admin",
        "Company",
        "Marketing",
        "Ceo",
        "Design Head",
        "Design Engineer",
        "Account Head",
        "Store Incharge",
      ],
    },
    {
      to: "/crm/client",
      name: "Client",
      icon: <FaPersonCircleCheck />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Design Head",
        "Design Engineer",
        "Account Head",
      ],
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
    {
      to: "/crm/Quotation",
      name: "Quotation",
      icon: <MdRequestQuote />,
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
      to: "/cms/blog-editor",
      name: "CreateBlog",
      icon: <ImBlog />,
      role: ["Admin", "Company", "Ceo", "Marketing", "Account Head"],
    },

    /* Site Management*/
    // {
    //   to: '/site/report',
    //   name: 'Sites Report',
    //   icon: <FaPersonShelter />,
    //   role: ['Admin', 'Company', 'Ceo', 'Account Head']
    // },
    {
      to: "/sites/project-schedules",
      name: "Project Schedules",
      icon: <GrSchedulePlay />,
      role: [
        "Admin",
        "Company",
        "Client",
        "Contractor",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
      ],
    },
    {
      to: "/sites/payment-schedules",
      name: "Payment Schedules",
      icon: <TbCalendarDollar />,
      role: ["Admin", "Company", "Ceo", "Account Head"],
    },
    {
      to: "/sites/quality-schedules",
      name: "Quality Schedules",
      icon: <LuCalendarCheck2 />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Contractor",
        "Accountant",
        "Site Incharge",
        "Site Supervisor",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
      ],
    },
    {
      to: "/sites/work-orders",
      name: "Work-Orders",
      icon: <MdWork />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Contractor",
        "Accountant",
        "Site Incharge",
        "Site Supervisor",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
      ],
    },
    {
      to: "/sites/bills",
      name: "Bills",
      icon: <LiaFileInvoiceDollarSolid />,
      role: [
        "Admin",
        "Company",
        "Supplier",
        "Contractor",
        "Accountant",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
      ],
    },
    {
      to: "/site/purchase-request",
      name: "Purchase-Request",
      icon: <BiSolidPurchaseTag />,
      role: [
        "Admin",
        "Company",
        "Supplier",
        "Accountant",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
      ],
    },
    {
      to: "/sites/return",
      name: "Return-Request",
      icon: <TbTruckReturn />,
      role: [
        "Admin",
        "Company",
        "Supplier",
        "Accountant",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
      ],
    },
    {
      to: "/sites/extra-work",
      name: "Extra-Works",
      icon: <MdBuild />,
      role: [
        "Admin",
        "Company",
        "Client",
        "Supplier",
        "Contractor",
        "Accountant",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
      ],
    },
    {
      to: "/sites/contractors",
      name: "Contractors",
      icon: <GrUserWorker />,
      role: [
        "Admin",
        "Company",
        "Accountant",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
      ],
    },
    {
      to: "/sites/checklists",
      name: "Check-List ",
      icon: <LuClipboardCheck />,
      role: [
        "Admin",
        "Company",
        "Contractor",
        "Accountant",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
      ],
    },
    {
      to: "/sites/labour-attendance",
      name: "Labour Attendance",
      icon: <FaUserCheck />,
      role: [
        "Admin",
        "Company",
        "Contractor",
        "Accountant",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Account Head",
      ],
    },
    /* Employee Management*/
    {
      to: "/hrms/employee/attendance",
      name: "Attendance Management",
      icon: <FaUserCheck />,
      role: ["Admin", "Company", "Ceo", "Account Head", "H.R", "Marketing"],
    },
    // {
    //   to: '/employee/salary',
    //   name: 'Salary',
    //   icon: '',
    //   role: ['Admin', 'Company', 'Ceo', 'Account Head', 'H.R'],
    // },
    {
      to: "/approval",
      name: "Approval",
      icon: <FcApproval />,
      role: [
        "Admin",
        "Company",
        "Company",
        "Client",
        "Supplier",
        "Contractor",
        "Accountant",
        "Ceo",
        "Site Incharge",
        "Quality Head",
        "Quality Engineer",
        "Account Head",
        "Store Incharge",
      ],
    },
    {
      to: "/work-details",
      name: "Work-Details",
      icon: <MdAssignment />,
      role: [
        "Admin",
        "Company",
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
        "Store Incharge",
      ],
    },
  ];

  // Desktop: Collapsible sidebar
  const renderMenus = (menus, role) =>
    menus.map((item, index) => {
      if (!item.role || item.role.includes(role)) {
        return (
          <NavLink
            key={index}
            to={item.to}
            onClick={onClose}
            className={`flex items-center space-x-4 p-2 rounded transition link
            ${
              location.pathname === item.to
                ? "bg-blue-100 text-blue-600 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            {isDesktop ? (
              <>{isExpanded && <span className="text-md">{item.name}</span>}</>
            ) : (
              <span className="text-md">{item.name}</span>
            )}
          </NavLink>
        );
      }
      return null;
    });

  if (isDesktop) {
    return (
      <aside
        className={`h-full bg-white shadow-lg border-r transition-all duration-200 z-50 overflow-x-hidden
        ${isExpanded ? "w-64" : "w-16"}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo */}
        <div className="flex items-center px-4 py-2 border-b">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          {isExpanded && (
            <span className="ml-2 text-lg font-semibold">BhuviManager</span>
          )}
        </div>

        {/* Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-60px)]">
          {isLoggedIn && renderMenus(Menus, user.department)}
        </nav>
      </aside>
    );
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform transition-transform duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-lg font-semibold">BhuviManager</span>
          </div>
          <button onClick={onClose}>
            <FiX size={22} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-60px)]">
          {isLoggedIn && renderMenus(Menus, user.department)}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
