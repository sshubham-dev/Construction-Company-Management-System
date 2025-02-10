import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import { useNavigate, NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { MdDelete, MdAdd } from "react-icons/md";
import LedgerModal from '../../components/CreateLedger';
import GroupModal from '../../components/CreateGroup';
import CostCenterPage from './CostCenter';
import CreateContra from '../../components/CreateContra';
import CreateReceipt_Payment from '../../components/CreateReceipt_Payment';
import CreateJournal from '../../components/CreateJournal';


const ERP = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLedgerModalOpen, setLedgerModalOpen] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isContraModalOpen, setContraModalOpen] = useState(false);
  const [isReceiptPaymentModalOpen, setReceiptPaymentModalOpen] = useState(false);
  const [isJournalModalOpen, setJournalModalOpen] = useState(false);
  // Handle adding a new item
  const handleAdd = (newItem) => {
    setData((prevData) => [...prevData, { id: Date.now(), ...newItem }]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <Header category="Page" title="ERP" />
      <section className="h-full w-full mb-16 flex justify-center">
        <div className='overflow-x-auto w-full max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2'>
          <div className="bg-slate-200 h-full p-12 grid justify-center col-span-1 items-center gap-6">
            <div className="flex flex-col gap-2 justify-center items-center">
              <h1 className='text-xl' >Accounting</h1>
              <div className="flex flex-col gap-2 justify-center items-center">
                <button
                  className=" "
                  onClick={() => {
                    // setIsModalOpen(true);
                    setLedgerModalOpen(true)
                  }}>
                  Accounting Ledger

                </button>
                <button
                  className=" "
                  onClick={() => setGroupModalOpen(true)}>
                  Accounting Group
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-center items-center">
              <h1 className='text-xl'>Inventory</h1>
              <div>
                <button
                  className=" "
                  onClick={() => setGroupModalOpen(true)}>
                  Stock Group
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-center items-center">
              <h1 className='text-xl'>Transactions / Voucher</h1>
              <div className="flex flex-col gap-2 justify-center items-center">
                {/* <NavLink to='/erp/journal'>Journal</NavLink> */}
                <button
                  onClick={() => setReceiptPaymentModalOpen(true)}>
                  Receipt / Payment
                </button>
                <button
                  onClick={() => setJournalModalOpen(true)}>
                  Journal
                </button>
                <button
                  onClick={() => setContraModalOpen(true)}>
                  Contra
                </button>
                {/* <NavLink to='/erp/purchase'>Purchase / Sales</NavLink> */}
                {/* <NavLink to='/erp/credit-note'>Credit Note</NavLink>
                <NavLink to='/erp/debit-note'>Debit Note</NavLink> */}
                {/* <NavLink to='/erp/material/:source'>Material In / Out</NavLink> */}
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-center items-center">
              <h1 className='text-xl'>Report</h1>
              <div className="flex flex-col gap-2 justify-center items-center">
                <NavLink to='/erp/summary'>Summary</NavLink>
                <NavLink to='/erp/balance-sheet'>Balance Sheet</NavLink>
                <NavLink to='/erp/p&l'>Profit & Loss A/c</NavLink>
                <NavLink to='/erp/stock/summary'>Stock Summary</NavLink>
                <NavLink to='/erp/ration-analysis'>Ratio Analysis</NavLink>
                <NavLink to='/erp/trial-balance'>Trial Balance</NavLink>
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-center items-center">
              <h1 className='text-xl'>Utilities</h1>
            </div>
          </div>
          <div className="bg-orange-200 h-full p-8 md:p-10 lg:p-12 col-span-1 flex flex-col gap-2">
            <h1 className="text-xl mb-2">List of Accounts</h1>
            <details>
              <summary className='text-lg'>Assets</summary>
              <div className="flex flex-col gap-1 items-start my-2 w-full ">
                <button className='flex flex-row justify-between items-center w-full'>
                  <p>Praveen Kumar Singh</p>
                  <p className='text-sm'>Current Assets</p>
                </button>
                <button>Bank Account</button>
                <button>Cash-in-Hand</button>
                <button>Deposits (Assets)</button>
                <button>Loans & Advances (Assets)</button>
                <button>Stock-in-Hand</button>
                <button>Sundry Debtors</button>
                <button>Fixed Assets</button>
                <button>Investments</button>
                <button>Misc. Expenses (Assets)</button>
              </div>
            </details>
            <details>
              <summary className='text-lg'>Liabilities</summary>
              <div className="flex flex-col gap-1 items-start my-2">
                <button>Branch / Divisions</button>
                <button>Capital Account</button>
                <button>Reserves & Surplus</button>
                <button>Capital Liabilities</button>
                <button>Duties & Taxes</button>
                <button>Provisions</button>
                <button>Sundry Creditors</button>
                <button>Loans (Liability)</button>
                <button>Bank OD A/c</button>
                <button>Secured Loans</button>
                <button>Unsecured Loans</button>
                <button>Suspense A/c</button>
                <button>Profit & Loss A/c</button>
              </div>
            </details>
            <details>
              <summary className='text-lg'>Expenses</summary>
              <div className="flex flex-col gap-1 items-start my-2">
                <button>Direct Expenses</button>
                <button>Indirect Expenses</button>
                <button>Purchase Accounts</button>
              </div>
            </details>
            <details>
              <summary className='text-lg'>Income</summary>
              <div className="flex flex-col gap-1 items-start my-2">
                <button>Direct Income</button>
                <button>Indirect Income</button>
                <button>Sales Accounts</button>
              </div>
            </details>
          </div>

          {/* <CostCenterPage/> */}
        </div>
        {/* Add/Edit Modal */}
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)} />
        )}
        {isJournalModalOpen && (
          <CreateJournal onClose={() => setJournalModalOpen(false)} isOpen={isJournalModalOpen}/>
        )}
        {isContraModalOpen && (
          <CreateContra isOpen={isContraModalOpen} onClose={() => setContraModalOpen(false)} />
        )}
        {isLedgerModalOpen && (
          <LedgerModal isOpen={isLedgerModalOpen} onClose={() => setLedgerModalOpen(false)} />
        )}
        {isGroupModalOpen && (
          <GroupModal isOpen={isGroupModalOpen} onClose={() => setGroupModalOpen(false)} />
        )}
        {isReceiptPaymentModalOpen && (
          <CreateReceipt_Payment isOpen={isReceiptPaymentModalOpen} onClose={() => setReceiptPaymentModalOpen(false)} />
        )}
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
    </div>
  )
}

export default ERP;




const Modal = ({ data, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: "", category: "", brand: "", quantity: "", price: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!onClose) return null
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg w-3/4 sm:w-2/4 md:w-1/3 lg:w-1/3">
        <h2 className="text-lg font-semibold mb-4">Add Product</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
        >
          <div className="mb-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="brand" className="block text-sm font-medium">
              Brand
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="quantity" className="block text-sm font-medium">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="price" className="block text-sm font-medium">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white p-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TallyGateway = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">

      <main className="mt-4">
        <section className="mb-4">
          <h2 className="text-lg font-semibold mb-2">MASTERS</h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-white p-3 rounded-lg shadow">Create</button>
            <button className="bg-white p-3 rounded-lg shadow">Chart of Accounts</button>
          </div>
        </section>

        <section className="mb-4">
          <h2 className="text-lg font-semibold mb-2">TRANSACTIONS</h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-white p-3 rounded-lg shadow">Vouchers</button>
            <button className="bg-white p-3 rounded-lg shadow">Day Book</button>
          </div>
        </section>

        <section className="mb-4">
          <h2 className="text-lg font-semibold mb-2">UTILITIES</h2>
          <button className="bg-white p-3 rounded-lg shadow w-full">Banking</button>
        </section>

        <section className="mb-4">
          <h2 className="text-lg font-semibold mb-2">REPORTS</h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-white p-3 rounded-lg shadow">Balance Sheet</button>
            <button className="bg-white p-3 rounded-lg shadow">Profit & Loss AC</button>
            <button className="bg-white p-3 rounded-lg shadow">Stock Summary</button>
            <button className="bg-white p-3 rounded-lg shadow">Ratio Analysis</button>
            <button className="bg-white p-3 rounded-lg shadow col-span-2">Display More Reports</button>
          </div>
        </section>

        <section className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Dashboard</h2>
          <button className="bg-white p-3 rounded-lg shadow w-full">Dashboard</button>
        </section>

        <section>
          <button className="bg-red-600 text-white p-3 rounded-lg shadow w-full">Quit</button>
        </section>
      </main>
    </div>
  );
};
