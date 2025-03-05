import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import UserManagement from './pages/Dashboard/User.jsx';
import Sites from './pages/Site/Site.jsx';
import Clients from './pages/CRM/Clients.jsx';
import Profile from './components/Profile.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import WorkOrders from './pages/Site/WorkOrder.jsx';
import ProjectSchedules from './pages/Site/ProjectSchedules.jsx';
import PaymentSchedules from './pages/Site/PaymentSchedule.jsx';
import Bills from './pages/Site/Bill.jsx';
import CheckList from './pages/Site/CheckList.jsx';
import Contractors from './pages/Site/Contractors.jsx';
import Admin from './pages/Dashboard/Admin.jsx';
import Accountant from './pages/Dashboard/Accountant.jsx';
import Design_Head from './pages/Dashboard/Design_Head.jsx';
import SiteIncharge from './pages/Dashboard/SiteIncharge.jsx';
import SiteSupervisour from './pages/Dashboard/SiteSupervisour.jsx';
import Quality_Engineer from './pages/Dashboard/Quality_Engineer.jsx';
import Design_Engineer from './pages/Dashboard/Design_Engineer.jsx';
import Marketing from './pages/Dashboard/Marketing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Client from './pages/Dashboard/Client.jsx';
import SiteScreen from './screen/SiteScreen.jsx';
import ClientScreen from './screen/ClientScreen.jsx';
import WorkOrderScreen from './screen/WorkOrderScreen.jsx'
import BillScreen from './screen/BillScreen.jsx';
import Payment_SchedulScreen from './screen/Payment_SchedulScreen.jsx';
import Project_ScheduleScreen from './screen/Project_ScheduleScreen.jsx';
import ContractorScreen from './screen/ContractorScreen.jsx';
import WorkDetails from './pages/Dashboard/WorkDetails.jsx';
import ExtraWork from './pages/Site/ExtraWork.jsx';
import PurchaseOrders from './pages/ERP/PurchaseOrders.jsx';
import Suppliers from './pages/ERP/Suppliers.jsx';
import PurchaseOrderScreen from './screen/PurchaseOrderScreen.jsx';
import Employee from './pages/HR/Employee.jsx';
import ExtraWorkScreen from './screen/ExtraWorkScreen.jsx';
import { logout } from './features/auth/authSlice.js';
import QualitySchedules from './pages/Site/QualitySchedules.jsx';
import './index.css';
import UserProfile from './components/ProfileCard.jsx';
import SupplierScreen from './screen/SupplierScreen.jsx';
import QualityScheduleScreen from './screen/QualityScheduleScreen.jsx';
import Approval from './pages/Dashboard/Approval.jsx';
import ResetPasswd from './components/ResetPasswd.jsx';
import Attendance from './pages/Dashboard/Attendance.jsx';
import Account_Head from './pages/Dashboard/AccountHead.jsx';
import ERP from './pages/ERP/ERP.jsx';
import SiteKharchi from './pages/Dashboard/SiteKharchi.jsx';
import RecordInventory from './components/RecordInventory.jsx';
import CRM from './pages/CRM/CRM.jsx';
import InventoryScreen from './screen/InventoryScreen.jsx';
import Store from './pages/ERP/Store.jsx';
import Purchase from './pages/ERP/Purchase.jsx';
import Sales from './pages/ERP/Sales.jsx';
import Lead from './pages/CRM/Lead.jsx';
import Project from './pages/CRM/Project.jsx';
import Stock from './pages/ERP/Stock.jsx';
import Expenses from './pages/ERP/Expenses.jsx';
import BalanceSheet from './pages/ERP/BalanceSheet.jsx';
import SitesDashboard from './pages/Site/SitesDashboard.jsx';
import ReturnOrders from './pages/ERP/ReturnOrders.jsx';
import { TbInvoice } from 'react-icons/tb';
import Invoice from './pages/CRM/Invoice.jsx';
import AccountManagement from './pages/ERP/AccountManagement.jsx';
import Order from './pages/ERP/Order.jsx';
import PurchaseRequest from './pages/Site/PurchaseRequest.jsx';
import Inventory from './pages/ERP/Inventory.jsx';
import UserScreen from './screen/UserScreen.jsx';
import MorePage from './components/MorePage.jsx';
import Report from './pages/Site/Report.jsx';
import ReturnOrderScreen from './screen/ReturnOrderScreen.jsx';
import Receipt_Payment from './pages/ERP/Receipt_Payment.jsx';
import Contra from './pages/ERP/Contra.jsx';
import ERPReport from './pages/ERP/ERPReport.jsx';
import Journal from './pages/ERP/Journal.jsx';
import ReturnRequest from './pages/Site/Return.jsx';

const App = () => {

  const { isLoggedIn } = useSelector((state) => {
    return state.auth
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    const isPageReloaded = performance.navigation.type === 1;
    if (isPageReloaded) {
      dispatch(logout());
      navigate('/')
      console.log('Reloaded')
    } else {
      console.log("This page is not reloaded");
    }
  }, []);


  return (
    <>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/more' element={<MorePage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/resetpasswd' element={<ResetPasswd />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/account' element={<Profile />} />

        <Route path='/admin' element={<Admin />} />
        <Route path='/ceo' element={<Admin />} />
        <Route path='/client' element={<Client />} />
        <Route path='/design-head' element={<Design_Head />} />
        <Route path='/site-incharge' element={<SiteIncharge />} />
        <Route path='/site-supervisour' element={<SiteSupervisour />} />
        <Route path='/marketing' element={<Marketing />} />
        <Route path='/quality-engineer' element={<Quality_Engineer />} />
        <Route path='/design-engineer' element={<Design_Engineer />} />
        <Route path='/accountant' element={<Accountant />} />
        <Route path='/account-head' element={<Account_Head />} />

        <Route path='/attendance' element={<Attendance />} />

        <Route path='/hr/employee/dashboard' element={<Employee />} />

        <Route path='/user' element={<UserManagement />} />
        <Route path='/user/:id' element={<UserScreen />} />

        <Route path='/sites/contractors' element={<Contractors />} />
        <Route path='/contractor/:id' element={<ContractorScreen />} />

          <Route path='/site/report' element={<SitesDashboard />} />
          {/* <Route path='/site/report' element={<Report />} /> */}
          <Route path='/sites' element={<Sites />} />
          <Route path='/site/:id' element={<SiteScreen />} />

          <Route path='/sites/clients' element={<Clients />} />
          <Route path='/client/:id' element={<ClientScreen />} />

          <Route path='/sites/work-orders' element={<WorkOrders />} />
          <Route path='/work-order/:id' element={<WorkOrderScreen />} />


          <Route path='/sites/project-schedules' element={<ProjectSchedules />} />
          <Route path='/project-schedule/:id' element={<Project_ScheduleScreen />} />


          <Route path='/sites/quality-schedules' element={<QualitySchedules />} />
          <Route path='/quality-schedule/:id' element={<QualityScheduleScreen />} />


          <Route path='/sites/payment-schedules' element={<PaymentSchedules />} />
          <Route path='/payment-schedule/:id' element={<Payment_SchedulScreen />} />


          <Route path='/sites/bills' element={<Bills />} />
          <Route path='/bill/:id' element={<BillScreen />} />


          <Route path='/sites/extra-work' element={<ExtraWork />} />
          <Route path='/extra-work/:id' element={<ExtraWorkScreen />} />


          <Route path='/sites/checklists' element={<CheckList />} />


          <Route path='/sites/return' element={<ReturnRequest />} />

        <Route path='/suppliers' element={<Suppliers />} />
        <Route path='/supplier/:id' element={<SupplierScreen />} />

        <Route path='/site/purchase-request' element={<PurchaseRequest />} />
        <Route path='/erp/inventory/purchase-request' element={<PurchaseRequest />} />
        <Route path='/erp/purchase-order' element={<PurchaseOrders />} />
        <Route path='/purchase-order/:id' element={<PurchaseOrderScreen />} />
        <Route path='/purchase-request/:id' element={<PurchaseOrderScreen />} />


        <Route path='/return-order/:from' element={<ReturnOrders />} />
        <Route path='/return-order/:id' element={<ReturnOrderScreen />} />

        <Route path='/erp' element={<ERP />} />
        <Route path='/erp/account' element={<AccountManagement />} />
        <Route path='/erp/expenses' element={<Expenses />} />
        <Route path='/erp/balance-sheet' element={<BalanceSheet />} />
        <Route path='/erp/inventory' element={<Store />} />
        <Route path='/erp/report/:of' element={<ERPReport />} />
        <Route path='/erp/inventory/stock' element={<Stock />} />
        <Route path='/erp/inventory/sales' element={<Sales />} />
        <Route path='/erp/inventory/create-sales' element={<Sales />} />
        <Route path='/erp/inventory/purchase' element={<Purchase />} />
        <Route path='/erp/inventory/order' element={<Order />} />
        {/* <Route path='/erp/journal' element={<Journal />} /> */}
        <Route path='/erp/receipt_payment' element={<Receipt_Payment />} />
        <Route path='/erp/contra' element={<Contra />} />
        <Route path='/erp/stock/journal' element={<Order />} />
        <Route path='/erp/:note' element={<Order />} />
        <Route path='/erp/summary' element={<Order />} />
        <Route path='/erp/balance-sheet' element={<Order />} />
        <Route path='/erp/p&l' element={<Order />} />
        <Route path='/erp/stock/summary' element={<Order />} />
        <Route path='/erp/ration-analysis' element={<Order />} />
        <Route path='/erp/trial-balance' element={<Order />} />
        <Route path='/erp/inventory/return-order' element={<ReturnOrders />} />
        <Route path='/erp/inventory/return-request' element={<ReturnRequest />} />
        <Route path='/erp/inventory/suppliers' element={<Suppliers />} />
        <Route path='/erp/inventory/record-inventory' element={<RecordInventory />} />

        <Route path='/crm' element={<CRM />} />
        <Route path='/crm/lead' element={<Lead />} />
        <Route path='/crm/client' element={<Clients />} />
        <Route path='/crm/project' element={<Project />} />
        <Route path='/crm/Invoice' element={<Invoice />} />

        <Route path='/site-kharchi' element={<SiteKharchi />} />


        <Route path='/work-details' element={<WorkDetails />} />

        <Route path='/setting' element={<Profile />} />

        <Route path='/approval' element={<Approval />} />


      </Routes>
    </>
  )
}
export default App;


