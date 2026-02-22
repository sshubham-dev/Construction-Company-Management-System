import { useState } from "react";
import Modal from "../Modal";
import CreatePurchaseRequest from "../CreatePurchaseRequest";
import CreateBill from "../CreateBill";
import CreateExtraWork from "../CreateExtraWork";
import CreateRetrun from "../CreateReturn";
import CreateContractor from "../CreateContractor";
import CreateWorkOrder from "../CreateWorkOrder";
import CreateProjectSchedule from "../CreateProjectSchedule";
import CreateQualitySchedule from "../CreateQualitySchedule";
import CreateChecklist from "../CreateChecklist";
import HouseKeeping from "../HouseKeeping";
import CreateEmployee from "../CreateEmployee";
import CreatePaymentSchedule from "../CreatePaymentSchedule";
import CreateSupplier from "../CreateSupplier";
import CreateClient from "../CreateClient";
import CreateLead from "../CreateLead";
import CreatePurchaseOrder from "../CreatePurchaseOrder";
import CreateLabourAttendance from "../CreateLabourAttendance";
import CreateGRN from "../CreateGRN";
import CreateDeliveryNote from "../CreateDeliveryNote";
import CollectionEntry from "../../pages/Design/CollectionEntry";

export default function Actions({ role }) {
  const [activeAction, setActiveAction] = useState(null);
  const menus = [
    {
      role: "HR",
      actions: [
        {
          icon: "💰",
          label: "Create Payslip",
          badge: "before 5th",
          modal: "CreatePayslip",
        },
        { icon: "➕", label: "Add New Employee", modal: "AddEmployee" },
        { icon: "➕", label: "Add Resume", modal: "AddResume" },
        {
          icon: "🏠",
          label: "Office Housekeeping",
          badge: "before Sat",
          modal: "",
        },
        {
          icon: "🏠",
          label: "Office Expenses",
          badge: "before 30th",
          modal: "",
        },
        {
          icon: "🏠",
          label: "Attendance Submission",
          badge: "before 30th",
          modal: "",
        },
        { icon: "₹", label: "Record Payment", modal: "CollectionEntry" },
      ],
    },
    {
      role: "Marketing",
      actions: [
        { icon: "📄", label: "Add New Lead", modal: "" },
        {
          icon: "⭐",
          label: "Content Creation Meeting",
          badge: "before 4th",
          modal: "",
        },
        {
          icon: "⭐",
          label: "Content Checking Meeting",
          badge: "before 25th",
          modal: "",
        },
        {
          icon: "⭐",
          label: "5 Google Reviews",
          badge: "before Sat",
          modal: "",
        },
        { icon: "📞", label: "Client Follow Up Calls", badge: "before Sat" },
        {
          icon: "📞",
          label: "Weekly Profile Update of Every Platform",
          badge: "before Sat",
        },
        { icon: "📞", label: "3 Posts Per Week", badge: "before Fri" },
        { icon: "📞", label: "1 Blog Post Weekly", badge: "before Fri" },
        { icon: "📞", label: "2 Ads Content Per Month", badge: "before 25th" },
        { icon: "₹", label: "Record Payment", modal: "CollectionEntry" },
      ],
    },
    {
      role: "Quality Engineer",
      actions: [
        { icon: "📄", label: "Create Checklist", modal: "CheckList" },
        { icon: "📄", label: "Update Work Procedure To Client" },
        {
          icon: "📞",
          label: "Quality & Safety Training ",
          badge: "before Wed",
        },
        { icon: "📄", label: "Material Selection With Client" },
        {
          icon: "📞",
          label: "3 Marketing Video",
          badge: "before 25th",
        },
        {
          icon: "📞",
          label: "1 Google Reviews",
          badge: "weekly",
        },
        {
          icon: "📞",
          label: "Quality Review With Incharge",
        },
        { icon: "₹", label: "Record Payment", modal: "CollectionEntry" },
      ],
    },
    {
      role: "Design Engineer",
      actions: [
        { icon: "📝", label: "Enter New Client", modal: "Client" },
        { icon: "📷", label: "Social Media Posts", badge: "before 20th" },
        { icon: "📞", label: "Reminder Call to Client", badge: "before Sat" },
        { icon: "🚶", label: "Monthly Site Visit", badge: "before 30th" },
        { icon: "🤝", label: "Weekly Meeting with Incharge" },
        { icon: "⭐", label: "2 Monthly Google Reviews", badge: "before 25th" },
        { icon: "₹", label: "Record Payment", modal: "CollectionEntry" },
      ],
    },
    {
      role: "Design Head",
      actions: [
        { icon: "📝", label: "Enter New Client", modal: "Client" },
        { icon: "📷", label: "Social Media Posts", badge: "before 20th" },
        { icon: "📞", label: "Reminder Call to Client", badge: "before Sat" },
        { icon: "🚶", label: "Site Visit", badge: "before 30th" },
        { icon: "₹", label: "Record Payment", modal: "CollectionEntry" },
      ],
    },
    {
      role: "Site Incharge",
      actions: [
        {
          icon: "📅",
          label: "Create Project Schedule",
          modal: "ProjectSchedule",
        },
        { icon: "📋", label: "Create Work Order", modal: "WorkOrder" },
        { icon: "👷‍♂️", label: "Create Contractor", modal: "Contractor" },
        { icon: "📋", label: "Quality Schedule Submit" },
        { icon: "📋", label: "Material Requirement" },
        { icon: "📋", label: "Bill Submit" },
        { icon: "📋", label: "Material Return" },
        { icon: "📋", label: "HouseKeeping" },
        { icon: "📋", label: "Site Review with Incharge" },
        { icon: "📋", label: "Extra Work Submit" },
        { icon: "₹", label: "Record Payment", modal: "CollectionEntry" },
      ],
    },
    {
      role: "Site Supervisor",
      actions: [
        {
          icon: "📑",
          label: "Create Material Request",
          badge: "Before Mon",
          modal: "MaterialRequest",
        },
        {
          icon: "👥",
          label: "Mark Labour Attendance",
          badge: "Daily",
          modal: "Attendance",
        },
        { icon: "📦", label: "Material Received Report" },
        {
          icon: "📝",
          label: "Create Contractor Bill",
          badge: "Before Tue",
          modal: "Bill",
        },
        {
          icon: "➕",
          label: "Extra Work",
          badge: "Before 30th",
          modal: "ExtraWork",
        },
        {
          icon: "🔄",
          label: "Material Return Request",
          badge: "Before 30th",
          modal: "Return",
        },
        {
          icon: "✅",
          label: "Quality Check Request",
          badge: "Before Mon",
          modal: "QualitySchedule",
        },
        {
          icon: "🏠",
          label: "Housekeeping",
          badge: "Before Sat",
          modal: "HouseKeeping",
        },
        { icon: "📋", label: "Site Review with Incharge", badge: "Before Sat" },
      ],
    },
    {
      role: "Store Incharge",
      actions: [
        { icon: "📝", label: "Cleaning" },
        { icon: "📷", label: "Stock Summary" },
        { icon: "📞", label: "Create Purchase Order", modal: "PurchaseOrder" },
        {
          icon: "🚶",
          label: "Generate GRN (Goods Receipt Note)",
          modal: "GRN",
        },
        { icon: "🚶", label: "Generate DN (Delivery Note)", modal: "DN" },
        // { icon: "🤝", label: "Generate Bill" },
        { icon: "🤝", label: "Scrap Sell" },
        {
          icon: "⭐",
          label: "Material Request From Site",
          badge: "2",
        },
        {
          icon: "🏠",
          label: "Store Housekeeping",
          badge: "Before Sat",
          modal: "HouseKeeping",
        },
        { icon: "₹", label: "Record Payment", modal: "CollectionEntry" },
      ],
    },
    {
      role: "Store Incharge",
      actions: [
        { icon: "📷", label: "Stock Summary" },
        { icon: "📞", label: "Create Purchase Order", modal: "PurchaseOrder" },
        { icon: "🚶", label: "Material Incoming/Outgoing Entry" },
        { icon: "🤝", label: "Material Purchase/Sales" },
      ],
    },
    {
      role: "Account Head",
      actions: [
        {
          icon: "📅",
          label: "Create Payment Schedule",
          modal: "PaymentSchedule",
        },
        { icon: "📷", label: "Material Order" },
        { icon: "📷", label: "Monthly Report to Client" },
        { icon: "📷", label: "GST Filling" },
        { icon: "📷", label: "Review with Incharge" },
        { icon: "📷", label: "Account's Audit" },
        { icon: "₹", label: "Record Payment", modal: "CollectionEntry" },
      ],
    },
  ];

  const modalComponents = {
    MaterialRequest: {
      title: "Material Request",
      component: (
        <CreatePurchaseRequest onClose={() => setActiveAction(null)} />
      ),
    },
    Bill: {
      title: "Contractor Bill",
      component: <CreateBill onClose={() => setActiveAction(null)} />,
    },
    ExtraWork: {
      title: "Extra Work",
      component: <CreateExtraWork onClose={() => setActiveAction(null)} />,
    },
    Return: {
      title: "Material Return",
      component: <CreateRetrun onClose={() => setActiveAction(null)} />,
    },
    Contractor: {
      title: "Add Contractor",
      component: <CreateContractor onClose={() => setActiveAction(null)} />,
    },
    WorkOrder: {
      title: "Create Work Order",
      component: <CreateWorkOrder onClose={() => setActiveAction(null)} />,
    },
    ProjectSchedule: {
      title: "Project Schedule",
      component: (
        <CreateProjectSchedule onClose={() => setActiveAction(null)} />
      ),
    },
    QualitySchedule: {
      title: "Quality Check",
      component: (
        <CreateQualitySchedule onClose={() => setActiveAction(null)} />
      ),
    },
    CheckList: {
      title: "Checklist",
      component: <CreateChecklist onClose={() => setActiveAction(null)} />,
    },
    HouseKeeping: {
      title: "Housekeeping Checklist",
      component: <HouseKeeping onClose={() => setActiveAction(null)} />,
    },
    Attendance: {
      title: "Add Labour Attendance",
      component: (
        <CreateLabourAttendance onClose={() => setActiveAction(null)} />
      ),
    },
    AddEmployee: {
      title: "Add New Employee",
      component: <CreateEmployee onClose={() => setActiveAction(null)} />,
    },
    CreatePayslip: {
      title: "Create Payslip",
      component: <div>Create Payslip Component</div>,
    },
    PaymentSchedule: {
      title: "Payment Schedule",
      component: (
        <CreatePaymentSchedule onClose={() => setActiveAction(null)} />
      ),
    },
    Supplier: {
      title: "Add Supplier",
      component: <CreateSupplier onClose={() => setActiveAction(null)} />,
    },
    Client: {
      title: "Add Client",
      component: <CreateClient onClose={() => setActiveAction(null)} />,
    },
    Lead: {
      title: "Add Lead",
      component: <CreateLead onClose={() => setActiveAction(null)} />,
    },
    PurchaseOrder: {
      title: "Create Purchase Order",
      component: <CreatePurchaseOrder onClose={() => setActiveAction(null)} />,
    },
    GRN: {
      title: "Generate GRN (Goods Receipt Note)",
      component: <CreateGRN onClose={() => setActiveAction(null)} />,
    },
    DN: {
      title: "Generate DN (Delivery Note)",
      component: <CreateDeliveryNote onClose={() => setActiveAction(null)} />,
    },
    CollectionEntry: {
      title: "Record Payment",
      component: <CollectionEntry onClose={() => setActiveAction(null)} />,
    },
  };

  // filter menu for role
  const menu = menus.find((m) => m.role === role);

  if (!menu) return null;

  const closeModal = () => setActiveAction(null);

  const handleActionClick = (action) => {
    if (action.modal) setActiveAction(action.modal);
  };

  return (
    <div className="space-y-2">
      {menu.actions.map((action, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          onClick={() => handleActionClick(action)}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{action.icon}</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">
              {action.label}
            </span>
          </div>
          {action.badge && (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100">
              {action.badge}
            </span>
          )}
        </div>
      ))}
      {activeAction && modalComponents[activeAction] && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          head={modalComponents[activeAction].title}
        >
          {modalComponents[activeAction].component}
        </Modal>
      )}
    </div>
  );
}
