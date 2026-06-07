import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./features/auth/authSlice.js";
import "./index.css";
import "jodit/es2021/jodit.min.css";

// Components
import Profile from "./components/Profile.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import WorkOrders from "./pages/Site/WorkOrder.jsx";
import ProjectSchedules from "./pages/Site/ProjectSchedules.jsx";
import PaymentSchedules from "./pages/Site/PaymentSchedule.jsx";
import Bills from "./pages/Site/Bill.jsx";
import CheckList from "./pages/Site/CheckList.jsx";
import Contractors from "./pages/Site/Contractors.jsx";
import CreatePayChallan from "./components/CreatePayChallan.jsx";
import ResetPasswd from "./components/ResetPasswd.jsx";
import UserProfile from "./components/ProfileCard.jsx";
import RecordInventory from "./components/RecordInventory.jsx";
import CreateJournal from "./components/CreateJournal.jsx";
import CreateQuotation from "./components/CreateQuotation.jsx";

// Dashboard Pages
import Admin from "./pages/Dashboard/Admin.jsx";
import Accountant from "./pages/Dashboard/Accountant.jsx";
import Design_Head from "./pages/Dashboard/Design_Head.jsx";
import SiteIncharge from "./pages/Dashboard/SiteIncharge.jsx";
import SiteSupervisour from "./pages/Dashboard/SiteSupervisour.jsx";
import Quality_Engineer from "./pages/Dashboard/Quality_Engineer.jsx";
import Design_Engineer from "./pages/Dashboard/Design_Engineer.jsx";
import Marketing from "./pages/Dashboard/Marketing.jsx";
import Approval from "./pages/Dashboard/Approval.jsx";
import Attendance from "./pages/Dashboard/Attendance.jsx";
import Account_Head from "./pages/Dashboard/AccountHead.jsx";
import Client from "./pages/Dashboard/Client.jsx";
import WorkDetails from "./pages/Dashboard/WorkDetails.jsx";
import UserManagement from "./pages/Dashboard/User.jsx";
import StoreIncharge from "./pages/Dashboard/StoreIncharge.jsx";
import CEO from "./pages/Dashboard/CEO.jsx";
import HR from "./pages/Dashboard/HR.jsx";
import StoreHelper from "./pages/Dashboard/StoreHelper.jsx";
import Notification from "./pages/Dashboard/Notification.jsx";

// Screens
import SiteScreen from "./screen/SiteScreen.jsx";
import ClientScreen from "./screen/ClientScreen.jsx";
import WorkOrderScreen from "./screen/WorkOrderScreen.jsx";
import BillScreen from "./screen/BillScreen.jsx";
import Payment_SchedulScreen from "./screen/Payment_SchedulScreen.jsx";
import Project_ScheduleScreen from "./screen/Project_ScheduleScreen.jsx";
import ContractorScreen from "./screen/ContractorScreen.jsx";
import PurchaseOrderScreen from "./screen/PurchaseOrderScreen.jsx";
import ExtraWorkScreen from "./screen/ExtraWorkScreen.jsx";
import MonthlyPerformanceScreen from "./screen/MonthlyPerformanceScreen.jsx";
import BusinessUnitScreen from "./screen/BusinessUnitScreen.jsx";
import StoreScreen from "./screen/StoreScreen.jsx";
import GRNScreen from "./screen/GRNScreen.jsx";
import DeliveryNoteScreen from "./screen/DeliveryNoteScreen.jsx";
import SalesInvoiceScreen from "./screen/SalesInvoiceScreen.jsx";
import PayChallanScreen from "./screen/PayChallanScreen.jsx";
import SupplierScreen from "./screen/SupplierScreen.jsx";
import QualityScheduleScreen from "./screen/QualityScheduleScreen.jsx";
import InventoryScreen from "./screen/InventoryScreen.jsx";
import UserScreen from "./screen/UserScreen.jsx";
import ReturnOrderScreen from "./screen/ReturnOrderScreen.jsx";
import ReturnScreen from "./screen/ReturnScreen.jsx";
import CheckListScreen from "./screen/CheckListScreen.jsx";
import PurchaseRequestScreen from "./screen/PurchaseRequestScreen.jsx";
import WOTemplateScreen from "./screen/WOTemplateScreen.jsx";
import LabourAttendanceScreen from "./screen/LabourAttendanceScreen.jsx";

// Sites
import ExtraWork from "./pages/Site/ExtraWork.jsx";
import QualitySchedules from "./pages/Site/QualitySchedules.jsx";
import Sites from "./pages/Site/Site.jsx";
import SitesDashboard from "./pages/Site/SitesDashboard.jsx";
import PurchaseRequest from "./pages/Site/PurchaseRequest.jsx";
import Report from "./pages/Site/Report.jsx";
import ReturnRequest from "./pages/Site/Return.jsx";

// CRM
import LeadDetail from "./pages/CRM/LeadDetail.jsx";
import Lead from "./pages/CRM/Lead.jsx";
import CRM from "./pages/CRM/CRM.jsx";
import Project from "./pages/CRM/Project.jsx";
import Invoice from "./pages/CRM/Invoice.jsx";
import Clients from "./pages/CRM/Clients.jsx";
import Quotations from "./pages/CRM/Quotation.jsx";

import Setting from "./pages/Setting.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { initPushNotifications } from "./helper/notificationService.js";

// Design
import ProjectReport from "./pages/Design/ProjectReport.jsx";

// HRMS
import AttendanceReport from "./pages/HRMS/AttendanceReport.jsx";
import Payroll from "./pages/HRMS/Payroll.jsx";
import TrafficLight from "./pages/HRMS/TrafficLight.jsx";
import TrafficLightSystem from "./pages/HRMS/TrafficLightSystem.jsx";
import Employee from "./pages/HRMS/Employee.jsx";
import MonthlyPerformance from "./pages/HRMS/MonthlyPerformance.jsx";

// CMS
import BlogPreviewer from "./pages/CMS/Blog/BlogPreviewer.jsx";
import FAQs from "./pages/CMS/FAQs.jsx";
import Projects from "./pages/CMS/Projects.jsx";
import ProjectDetail from "./pages/CMS/ProjectDetail.jsx";
import Blogs from "./pages/CMS/Blogs.jsx";
import BlogEdit from "./pages/CMS/Blog/BlogEdit.jsx";
import CreateBlog from "./pages/CMS/Blog/CreateBlog.jsx";

// ERP
import Voucher from "./pages/ERP/Voucher.jsx";
import Company from "./pages/ERP/Company.jsx";
import CostCenter from "./pages/ERP/CostCenter.jsx";
import LedgerList from "./pages/ERP/Ledger.jsx";
import BusinessUnit from "./pages/ERP/BusinessUnit.jsx";
import SalesInvoice from "./pages/ERP/SalesInvoice.jsx";
import Expenses from "./pages/ERP/Expenses.jsx";
import PaymentChallan from "./pages/ERP/PaymentChallan.jsx";
import ERPSettings from "./pages/ERP/ERPSettings.jsx";
import Suppliers from "./pages/ERP/Suppliers.jsx";
import Collections from "./pages/ERP/Collections.jsx";
import InvoiceForm from "./pages/ERP/Components/InvoiceForm.jsx";

// ERP/Inventory
import StockCategory from "./pages/ERP/StockCategory.jsx";
import StockGroup from "./pages/ERP/StockGroup.jsx";
import StockItem from "./pages/ERP/StockItem.jsx";
import Store from "./pages/ERP/Store.jsx";
import Stock from "./pages/ERP/Stock.jsx";
import Assets from "./pages/ERP/Assets.jsx";
import Inventory from "./pages/ERP/Inventory.jsx";
import PurchaseOrders from "./pages/ERP/PurchaseOrders.jsx";
import DeliveryNotes from "./pages/ERP/DeliveryNotes.jsx";
import GRN from "./pages/ERP/GRN.jsx";
import ReturnOrders from "./pages/ERP/ReturnOrders.jsx";
import StockAudit from "./pages/ERP/Stock/StockAudit.jsx";

// ERP/Reports
import AccountManagement from "./pages/ERP/Reports/AccountManagement.jsx"; //
import BalanceSheet from "./pages/ERP/Reports/BalanceSheet.jsx"; //
import CashFlow from "./pages/ERP/Reports/CashFlow.jsx"; //
import ERP from "./pages/ERP/Reports/ERP.jsx"; //
import ExpenseReports from "./pages/ERP/Reports/ExpenseReports.jsx"; //
import LedgerReport from "./pages/ERP/Reports/LedgerReport.jsx"; //
import Outstanding from "./pages/ERP/Reports/Outstanding.jsx"; //
import ProfitLoss from "./pages/ERP/Reports/ProfitLoss.jsx";
import Purchase from "./pages/ERP/Reports/Purchase.jsx"; //
import SiteProfit from "./pages/ERP/Reports/SiteProfit.jsx"; //
import Sales from "./pages/ERP/Reports/Sales.jsx";
import TrialBalance from "./pages/ERP/Reports/TrialBalance.jsx"; //

import Order from "./pages/ERP/Order.jsx";
import LedgerGroup from "./pages/ERP/LedgerGroup.jsx";
import MultiLevelReport from "./pages/ERP/Reports/MultiLevelReport.jsx";
import ProjectEditor from "./components/CreateProject.jsx";
import DNDetail from "./pages/ERP/DNDetail.jsx";
import RFQ from "./pages/ERP/RFQ.jsx";
import RFQDetail from "./pages/ERP/RFQDetail.jsx";
import RFQComparison from "./pages/ERP/RFQComparison.jsx";
import PublicQuotationPage from "./pages/ERP/PublicQuotationPage.jsx";

const App = () => {
  const { user, isLoggedIn } = useSelector((state) => {
    return state.auth;
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) {
      initPushNotifications(user._id);
    }
  }, [user?._id]); // Only runs when the user logs in or ID changes

  useEffect(() => {
    const isPageReloaded = performance.navigation.type === 1;
    if (isPageReloaded) {
      dispatch(logout());
      navigate("/");
      console.log("Reloaded");
    } else {
      console.log("This page is not reloaded");
    }
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Dashboard /> : <Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resetpasswd" element={<ResetPasswd />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/account" element={<Profile />} />
        <Route path="/notifications" element={<Notification />} />

        <Route path="/admin" element={<Admin />} />
        <Route path="/ceo" element={<CEO />} />
        <Route path="/client" element={<Client />} />
        <Route path="/design-head" element={<Design_Head />} />
        <Route path="/site-incharge" element={<SiteIncharge />} />
        <Route path="/site-supervisour" element={<SiteSupervisour />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/quality-engineer" element={<Quality_Engineer />} />
        <Route path="/design-engineer" element={<Design_Engineer />} />
        <Route path="/accountant" element={<Accountant />} />
        <Route path="/account-head" element={<Account_Head />} />
        <Route path="/store-helper" element={<StoreHelper />} />
        <Route path="/hr" element={<HR />} />
        <Route path="/store-incharge" element={<StoreIncharge />} />

        <Route path="/attendance" element={<Attendance />} />

        <Route path="/hrms/employee/dashboard" element={<Employee />} />
        <Route
          path="/hrms/employee/attendance"
          element={<AttendanceReport />}
        />
        <Route path="/hrms/payroll" element={<Payroll />} />
        <Route path="/hrms" element={<TrafficLight />} />
        <Route path="/hrms/traffic-light" element={<TrafficLight />} />
        <Route path="/hrms/traffic" element={<TrafficLightSystem />} />
        <Route
          path="/hrms/monthly-performance"
          element={<MonthlyPerformance />}
        />
        <Route
          path="/hrms/monthly-performance/:id"
          element={<MonthlyPerformanceScreen />}
        />

        <Route path="/user" element={<UserManagement />} />
        <Route path="/user/:id" element={<UserScreen />} />

        <Route path="/sites/contractors" element={<Contractors />} />
        <Route path="/contractor/:id" element={<ContractorScreen />} />

        <Route path="/site/report" element={<SitesDashboard />} />
        {/* <Route path='/site/report' element={<Report />} /> */}
        <Route path="/sites" element={<Sites />} />
        <Route path="/site/:id" element={<SiteScreen />} />

        <Route
          path="/sites/labour-attendance"
          element={<LabourAttendanceScreen />}
        />

        <Route path="/sites/clients" element={<Clients />} />
        <Route path="/client/:id" element={<ClientScreen />} />

        <Route path="/sites/work-orders" element={<WorkOrders />} />
        <Route path="/work-order/:id" element={<WorkOrderScreen />} />
        <Route path="/work-order/template/:id" element={<WOTemplateScreen />} />
        <Route
          path="/work-order/:id/approval/:approvalId"
          element={<WorkOrderScreen />}
        />

        <Route path="/sites/project-schedules" element={<ProjectSchedules />} />
        <Route
          path="/project-schedule/:id"
          element={<Project_ScheduleScreen />}
        />
        <Route
          path="/project-schedule/:id/approval/:approvalId"
          element={<Project_ScheduleScreen />}
        />

        <Route path="/sites/quality-schedules" element={<QualitySchedules />} />
        <Route
          path="/quality-schedule/:id"
          element={<QualityScheduleScreen />}
        />
        <Route
          path="/quality-schedule/:id/approval/:approvalId"
          element={<QualityScheduleScreen />}
        />

        <Route path="/sites/payment-schedules" element={<PaymentSchedules />} />
        <Route
          path="/payment-schedule/:id"
          element={<Payment_SchedulScreen />}
        />
        <Route
          path="/payment-schedule/:id/approval/:approvalId"
          element={<Payment_SchedulScreen />}
        />

        <Route path="/sites/bills" element={<Bills />} />
        <Route path="/bill/:id" element={<BillScreen />} />
        <Route path="/bill/:id/approval/:approvalId" element={<BillScreen />} />

        <Route path="/sites/extra-work" element={<ExtraWork />} />
        <Route path="/extra-work/:id" element={<ExtraWorkScreen />} />
        <Route
          path="/extra-work/:id/approval/:approvalId"
          element={<ExtraWorkScreen />}
        />

        <Route path="/sites/checklists" element={<CheckList />} />
        <Route path="/checklist/:id" element={<CheckListScreen />} />
        <Route
          path="/checklist/:id/approval/:approvalId"
          element={<CheckListScreen />}
        />

        <Route path="/sites/return" element={<ReturnRequest />} />
        <Route path="/sites/return/:id" element={<ReturnScreen />} />
        <Route
          path="/sites/return/:id/approval/:approvalId"
          element={<ReturnScreen />}
        />

        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/supplier/:id" element={<SupplierScreen />} />

        <Route path="/purchase-request/:mode" element={<PurchaseRequest />} />
        <Route
          path="/purchase-request/:mode/:id"
          element={<PurchaseRequestScreen />}
        />
        <Route
          path="/site/purchase-request/:id/approval/:approvalId"
          element={<PurchaseRequestScreen />}
        />

        {/* Purchase Orders */}
        <Route
          path="/erp/inventory/purchase-order"
          element={<PurchaseOrders />}
        />
        <Route
          path="/erp/inventory/purchase-order/:id"
          element={<PurchaseOrderScreen />}
        />
        <Route
          path="/erp/inventory/purchase-order/:id/approval/:approvalId"
          element={<PurchaseOrderScreen />}
        />

        <Route path="/return-order/:from" element={<ReturnOrders />} />
        <Route path="/return-order/:id" element={<ReturnOrderScreen />} />

        <Route path="/erp/company" element={<Company />} />
        <Route path="/erp-setting" element={<ERPSettings />} />
        <Route path="/erp/groups" element={<LedgerGroup />} />

        <Route path="/erp" element={<ERP />} />
        <Route path="/erp/account" element={<AccountManagement />} />
        <Route path="/erp/expenses" element={<ExpenseReports />} />
        <Route path="/erp/balance-sheet" element={<BalanceSheet />} />
        <Route path="/erp/cash-flow" element={<CashFlow />} />
        <Route path="/erp/ledger-report" element={<LedgerReport />} />
        <Route path="/erp/outstanding" element={<Outstanding />} />
        <Route path="/erp/p&l" element={<ProfitLoss />} />
        <Route path="/erp/site-profit" element={<SiteProfit />} />
        <Route path="/erp/trial-balance" element={<TrialBalance />} />
        <Route path="/erp/multi-level" element={<MultiLevelReport />} />

        <Route path="/erp/inventory" element={<Store />} />
        <Route path="/erp/inventory/grn" element={<GRN />} />
        <Route path="/erp/inventory/grn/:id" element={<GRNScreen />} />
        <Route path="/:mode/inventory/dn" element={<DeliveryNotes />} />
        <Route path="/:mode/inventory/dn/:id" element={<DNDetail />} />
        <Route path="/erp/inventory/store" element={<Store />} />
        <Route path="/erp/inventory/store/:id" element={<StoreScreen />} />
        <Route
          path="/erp/inventory/store/:storeId/stock"
          element={<StoreScreen />}
        />
        {/* <Route path="/erp/report/:of" element={<ERPReport />} /> */}
        <Route path="/erp/inventory/stock" element={<Stock />} />
        <Route path="/erp/inventory/assets" element={<Assets />} />
        <Route
          path="/erp/inventory/stock/category"
          element={<StockCategory />}
        />
        <Route path="/erp/inventory/stock/item" element={<StockItem />} />
        <Route path="/erp/inventory/stock/group" element={<StockGroup />} />
        <Route path="/erp/inventory/sales" element={<Sales />} />
        <Route path="/erp/inventory/sales-invoice" element={<SalesInvoice />} />
        <Route
          path="/erp/inventory/sales-invoice/:id"
          element={<SalesInvoiceScreen />}
        />
        <Route
          path="/erp/inventory/sales-request"
          element={<PurchaseRequest />}
        />
        <Route path="/erp/inventory/create-sales" element={<Sales />} />
        <Route path="/erp/procurement/rfq" element={<RFQ />} />
        <Route path="/erp/procurement/rfq/:id" element={<RFQDetail />} />
        <Route
          path="/erp/procurement/rfq/:id/comparison"
          element={<RFQComparison />}
        />
        <Route path="/vendor/rfq/:token" element={<PublicQuotationPage />} />
        <Route path="/erp/inventory/purchase" element={<Purchase />} />
        <Route path="/erp/inventory/order" element={<Order />} />
        <Route path="/erp/business_unit" element={<BusinessUnit />} />
        <Route path="/erp/business_unit/:id" element={<BusinessUnitScreen />} />
        <Route path="/erp/:voucher" element={<Voucher />} />
        <Route path="/erp/ledger" element={<LedgerList />} />
        <Route path="/erp/cost-center" element={<CostCenter />} />
        <Route path="/erp/invoice/create" element={<InvoiceForm />} />
        <Route path="/erp/invoice" element={<Invoice />} />
        <Route path="/erp/collections" element={<Collections />} />
        <Route
          path="/erp/payment-challan/create"
          element={<CreatePayChallan />}
        />
        <Route path="/erp/payment-challan" element={<PaymentChallan />} />
        <Route path="/erp/payment-challan/:id" element={<PayChallanScreen />} />

        <Route path="/erp/stock/journal" element={<Order />} />
        <Route path="/erp/inventory/stock/audit" element={<StockAudit />} />
        <Route path="/erp/:note" element={<Order />} />
        <Route path="/erp/summary" element={<Order />} />
        <Route path="/erp/stock/summary" element={<Order />} />
        <Route path="/erp/ration-analysis" element={<Order />} />
        <Route path="/erp/inventory/return-order" element={<ReturnOrders />} />
        <Route
          path="/erp/inventory/return-request"
          element={<ReturnRequest />}
        />
        <Route path="/erp/inventory/suppliers" element={<Suppliers />} />
        <Route
          path="/erp/inventory/record-inventory"
          element={<RecordInventory />}
        />

        <Route path="/crm" element={<CRM />} />
        <Route path="/crm/leads" element={<Lead />} />
        <Route path="/crm/lead/:id" element={<LeadDetail />} />
        <Route path="/crm/client" element={<Clients />} />
        <Route path="/crm/project" element={<Project />} />
        <Route path="/crm/Invoice" element={<Invoice />} />
        <Route path="/crm/Quotation" element={<Quotations />} />

        <Route path="/design/project" element={<ProjectReport />} />

        <Route path="/my_expenses" element={<Expenses />} />

        <Route path="/cms/blog/editor" element={<CreateBlog />} />
        <Route path="/cms/blogs" element={<Blogs />} />
        <Route path="/cms/blog/preview/:id" element={<BlogPreviewer />} />
        <Route path="/cms/blog/edit/:id" element={<BlogEdit />} />

        <Route path="/cms/faqs" element={<FAQs />} />

        <Route path="/cms/projects" element={<Projects />} />
        <Route path="/cms/project/create" element={<ProjectEditor />} />
        <Route path="/cms/project/edit/:id" element={<ProjectEditor />} />
        <Route path="/cms/project/:id" element={<ProjectDetail />} />

        <Route path="/work-details" element={<WorkDetails />} />

        <Route path="/setting" element={<Profile />} />

        <Route path="/approval" element={<Approval />} />
      </Routes>
    </>
  );
};
export default App;
