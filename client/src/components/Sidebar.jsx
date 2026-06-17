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
      to: "/my_expenses",
      name: "Record Expenses",
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

    {
      to: "/erp/collections",
      name: "Record Client Payment",
      icon: <FaWallet />,
      role: [
        "Company",
        "Ceo",
        "Account Head",
        "Accountant",
        "Design Head",
        "Design Engineer",
        "Site Incharge",
        "Quality Head",
        "Quality Engineer",
      ],
    },

    /* ERP */
    /* Accounts Management*/
    {
      name: "Accounts Management",
      // icon: <TbReportAnalytics />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp",
      name: "ERP",
      icon: <MdAccountBalance />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/account-summary",
      name: "Accounts Summary",
      icon: <MdAccountBalance />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/expenses",
      name: "Expenses Report",
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
    {
      to: "/erp/balance-sheet",
      name: "Balance Sheet",
      icon: <FaBalanceScale />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/p&l",
      name: "Profit & Loss",
      icon: <FaBalanceScale />,
      role: ["Admin", "Company", "Ceo", "Account Head"],
    },
    {
      to: "/erp/cash-flow",
      name: "Cash Flow",
      icon: <FaBalanceScale />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/ledger-report",
      name: "Ledger Report",
      icon: <FaBalanceScale />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/outstanding",
      name: "Outstanding",
      icon: <FaBalanceScale />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/trial-balance",
      name: "TrialBalance",
      icon: <FaBalanceScale />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },

    // Analysis
    {
      name: "Accounts Management",
      // icon: <TbReportAnalytics />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    // {
    //   to: "/erp/site-analysis",
    //   name: "Site Analysis",
    //   icon: <FaBalanceScale />,
    //   role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    // },
    {
      to: "/erp/cost-analysis",
      name: "Cost Analysis",
      icon: <FaBalanceScale />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/bu-analysis",
      name: "Business Unit Analysis",
      icon: <FaBalanceScale />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },

    // ERP Setups
    {
      name: "Accounting Setups",
      // icon: <TbReportAnalytics />,
      role: ["Admin", "Company", "Account Head", "Accountant"],
    },
    {
      to: "/erp/company",
      name: "Company Management",
      icon: <MdAccountBalance />,
      role: ["Admin", "Company", "Account Head", "Accountant"],
    },
    {
      to: "/erp/business_unit",
      name: "Business Unit",
      icon: <IoIosJournal />,
      role: ["Admin", "Company", "Account Head", "Accountant"],
    },
    {
      to: "/erp/groups",
      name: "Groups",
      icon: <IoIosJournal />,
      role: ["Admin", "Company", "Account Head", "Accountant"],
    },
    {
      to: "/erp/ledger",
      name: "Ledgers",
      icon: <TbReportAnalytics />,
      role: ["Admin", "Company", "Account Head", "Accountant"],
    },
    {
      to: "/erp/cost-center",
      name: "Cost Center",
      icon: <PiNoteFill />,
      role: ["Admin", "Company", "Account Head", "Accountant"],
    },
    {
      to: "/erp-setting",
      name: "Setting",
      icon: <TbReportAnalytics />,
      role: ["Admin", "Company", "Account Head", "Accountant"],
    },

    // Vouchers
    {
      name: "Accounting Vouchers",
      // icon: <TbReportAnalytics />,
      role: ["Admin", "Company", "Account Head", "Accountant"],
    },
    {
      to: "/erp/payment",
      name: "Payment",
      icon: <FaReceipt />,
      role: ["Admin", "Company", "Account Head", "Accountant"],
    },
    {
      to: "/erp/receipt",
      name: "Receipt",
      icon: <FaReceipt />,
      role: ["Admin", "Company", "Accountant", "Account Head"],
    },
    {
      to: "/erp/contra",
      name: "Contra",
      icon: <FaMoneyBillTransfer />,
      role: ["Admin", "Company", "Accountant", "Account Head"],
    },
    {
      to: "/erp/journal",
      name: "Journal",
      icon: <IoIosJournal />,
      role: ["Admin", "Company", "Accountant", "Account Head"],
    },

    {
      name: "Helper",
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/payment-challan",
      name: "Payment Challans",
      icon: <IoIosJournal />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/invoice",
      name: "Invoice",
      icon: <TbInvoice />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },
    {
      to: "/erp/invoice/create",
      name: "Create Invoice",
      icon: <IoIosJournal />,
      role: ["Admin", "Company", "Ceo", "Account Head", "Accountant"],
    },

    /* Inventory Management*/
    {
      name: "Inventory",
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Account Head",
        "Accountant",
        "Store Incharge",
      ],
    },
    {
      to: "/erp/inventory",
      name: "Stores",
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

    // Stock / Assets Management
    // {
    //   to: "/erp/inventory/stock",
    //   name: "Stock",
    //   icon: <MdInventory />,
    //   role: [
    //     "Admin",
    //     "Company",
    //     "Ceo",
    //     "Accountant",
    //     "Account Head",
    //     "Store Helper",
    //     "Store Incharge",
    //   ],
    // },
    {
      to: "/erp/inventory/stock/group",
      name: "Stock Group",
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
    {
      to: "/erp/inventory/stock/category",
      name: "Stock Category",
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
    {
      to: "/erp/inventory/stock/item",
      name: "Stock Item",
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
    {
      to: "/erp/inventory/assets",
      name: "Assets",
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

    {
      to: "/erp/inventory/stock/audit",
      name: "Stock Audit",
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

    // Sales / Purchase Request
    {
      to: "/purchase-request/ERP",
      name: "Material Request",
      icon: <BiSolidPurchaseTag />,
      role: [
        "Admin",
        "Company",
        "Supplier",
        "Accountant",
        "Account Head",
        "Store Helper",
        "Store Incharge",
      ],
    },
    {
      to: "/erp/procurement/rfq",
      name: "RFQ",
      icon: <BiSolidPurchaseTag />,
      role: [
        "Admin",
        "Company",
        "Supplier",
        "Accountant",
        "Account Head",
        "Store Helper",
        "Store Incharge",
      ],
    },
    {
      to: "/erp/inventory/purchase-order",
      name: "Purchase Order",
      icon: <BiSolidPurchaseTag />,
      role: [
        "Admin",
        "Company",
        "Supplier",
        "Accountant",
        "Account Head",
        "Store Helper",
        "Store Incharge",
      ],
    },

    // GRN / Delivery Note
    {
      to: "/erp/inventory/grn",
      name: "GRN",
      icon: (
        <FaTruckArrowRight style={{ transform: "rotate(360deg) scaleX(1)" }} />
      ),
      role: [
        "Admin",
        "Company",
        "Accountant",
        "Account Head",
        "Store Incharge",
      ],
    },
    {
      to: "/erp/inventory/dn",
      name: "Delivery Note",
      icon: (
        <FaTruckArrowRight style={{ transform: "rotate(360deg) scaleX(-1)" }} />
      ),
      role: [
        "Admin",
        "Company",
        "Accountant",
        "Account Head",
        "Store Incharge",
      ],
    },

    // Sales / Purchase Invoice
    {
      to: "/erp/inventory/sales-invoice",
      name: "Sales Invoice",
      icon: (
        <FaTruckArrowRight style={{ transform: "rotate(360deg) scaleX(-1)" }} />
      ),
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
      to: "/erp/inventory/purchase-invoice",
      name: "Purchase Invoice",
      icon: <FaTruckMedical />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Accountant",
        "Account Head",
        "Store Incharge",
      ],
    },

    // Sales / Purchase Return
    {
      to: "/erp/inventory/sales-return",
      name: "Sales Return",
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
      to: "/erp/inventory/purchase-return",
      name: "Purchase Return",
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

    /* Customer Management*/
    {
      name: "CRM",
      role: [
        "Company",
        "Ceo",
        "Design Head",
        "Design Engineer",
        "Account Head",
        "Marketing",
      ],
    },
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
        "Accountant",
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
        "Accountant",
      ],
    },
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
      name: "CMS",
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Marketing",
        "Account Head",
        "Design Engineer",
        "Quality Engineer",
      ],
    },
    {
      to: "/cms/blogs",
      name: "Blogs",
      icon: <ImBlog />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Marketing",
        "Account Head",
        "Design Engineer",
        "Quality Engineer",
      ],
    },
    {
      to: "/cms/faqs",
      name: "FAQs",
      icon: <ImBlog />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Marketing",
        "Account Head",
        "Design Engineer",
        "Quality Engineer",
      ],
    },
    {
      to: "/cms/projects",
      name: "Projects",
      icon: <ImBlog />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Marketing",
        "Account Head",
        "Design Engineer",
        "Quality Engineer",
      ],
    },

    /* Site Management*/
    {
      name: "Sites",
      // icon: <FaPersonShelter />,
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Account Head",
        "Site Incharge",
        "Site Supervisor",
      ],
    },
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
      to: "/purchase-request/SITE",
      name: "Material Request",
      icon: <BiSolidPurchaseTag />,
      role: [
        "Admin",
        "Company",
        "Supplier",
        "Accountant",
        "Ceo",
        "Site Incharge",
        "Site Supervisor",
        "Account Head",
      ],
    },
    {
      to: "/site/inventory/dn",
      name: "Delivery Note",
      icon: (
        <FaTruckArrowRight style={{ transform: "rotate(360deg) scaleX(1)" }} />
      ),
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Accountant",
        "Account Head",
        "Site Incharge",
        "Site Supervisor",
      ],
    },
    {
      to: "/sites/return",
      name: "Material Return",
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
      name: "HRMS",
      role: ["Admin", "Company", "Ceo", "Account Head", "H.R", "Accountant"],
    },
    {
      to: "/hrms/employee/attendance",
      name: "Attendance Management",
      icon: <FaUserCheck />,
      role: ["Admin", "Company", "Ceo", "Account Head", "H.R", "Accountant"],
    },
    {
      to: "/hrms/payroll",
      name: "Payroll",
      icon: "",
      role: ["Admin", "Company", "Ceo", "Account Head", "H.R", "Accountant"],
    },
    {
      to: "/hrms/monthly-performance",
      name: "Monthly Performance",
      icon: "",
      role: ["Admin", "Company", "Ceo", "Account Head", "H.R", "Accountant"],
    },
    // {
    //   to: '/employee/salary',
    //   name: 'Salary',
    //   icon: '',
    //   role: ['Admin', 'Company', 'Ceo', 'Account Head', 'H.R'],
    // },
    {
      name: "General Settings",
      role: [
        "Admin",
        "Company",
        "Ceo",
        "Account Head",
        "H.R",
        "Marketing",
        "Accountant",
      ],
    },
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
