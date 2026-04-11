import { FaMoneyBillWave, FaFileInvoiceDollar, FaChartLine, FaBoxOpen } from 'react-icons/fa';
import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { useDispatch, useSelector } from "react-redux";
import Chart from 'chart.js/auto'; // Automatically registers all necessary components
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function BalanceSheet() {
  const [showAssets, setShowAssets] = useState(true);
  const [showLiabilities, setShowLiabilities] = useState(true);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const assets = [
    { name: "Cash", amount: 5000, details: [], icon: <FaMoneyBillWave /> },
    { name: "Accounts Receivable", amount: 3000, details: [
        { name: "Client A", amount: 1200 },
        { name: "Client B", amount: 800 },
        { name: "Client C", amount: 1000 }
      ], icon: <FaFileInvoiceDollar /> },
    { name: "Inventory", amount: 7000, details: [
        { name: "Product X", amount: 4000 },
        { name: "Product Y", amount: 3000 }
      ], icon: <FaBoxOpen /> },
    { name: "Investments", amount: 15000, details: [
        { name: "Stocks", amount: 10000 },
        { name: "Bonds", amount: 5000 }
      ], icon: <FaChartLine /> }
  ];
  
  const liabilities = [
    { name: "Loans Payable", amount: 4000, details: [] },
    { name: "Accounts Payable", amount: 2000, details: [] },
    { name: "Accrued Expenses", amount: 1000, details: [] },
    { name: "Deferred Revenue", amount: 3000, details: [] }
  ];
  
  const equity = [
    { name: "Owner's Equity", amount: 8000, details: [] },
    { name: "Retained Earnings", amount: 5000, details: [] }
  ];

  const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
  const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);

  // Prepare data for the pie chart
  const chartData = {
    labels: ['Assets', 'Liabilities', "Owner's Equity"],
    datasets: [
      {
        data: [totalAssets, totalLiabilities, totalEquity],
        backgroundColor: COLORS,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 shadow-lg rounded-lg">
      <h2 className="text-4xl font-bold mb-6 text-center text-blue-600">Balance Sheet</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold border-b pb-2 text-blue-500 flex justify-between items-center">
            <span>Assets</span>
            <button onClick={() => setShowAssets(!showAssets)} className="text-blue-500">
              {showAssets ? 'Hide' : 'Show'}
            </button>
          </h3>
          {showAssets && assets.map((asset, index) => (
            <details key={index} className="p-2 border-b hover:bg-gray-100 transition duration-200">
              <summary className="flex justify-between font-semibold cursor-pointer list-none">
                <span className="flex items-center">
                  {asset.icon}
                  <span className="ml-2">{asset.name}</span>
                </span>
                <span>${asset.amount.toLocaleString()}</span>
              </summary>
              {asset.details.length > 0 && (
                <div className="ml-4 mt-2 text-sm text-gray-600">
                  {asset.details.map((detail, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{detail.name}</span>
                      <span>${detail.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </details>
          ))}
          <div className="flex justify-between font-bold p-2 border-t">
            <span>Total Assets</span>
            <span>${totalAssets.toLocaleString()}</span>
          </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold border-b pb-2 text-blue-500 flex justify-between items-center">
            <span>Liabilities & Equity</span>
            <button onClick={() => setShowLiabilities(!showLiabilities)} className="text-blue-500">
              {showLiabilities ? 'Hide' : 'Show'}
            </button>
          </h3>
          {showLiabilities && [...liabilities, ...equity].map((item, index) => (
            <details key={index} className="p-2 border-b hover:bg-gray-100 transition duration-200">
              <summary className="flex justify-between font-semibold cursor-pointer list-none">
                <span>{item.name}</span>
                <span>${item.amount.toLocaleString()}</span>
              </summary>
              {item.details.length > 0 && (
                <div className="ml-4 mt-2 text-sm text-gray-600">
                  {item.details.map((detail, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{detail.name}</span>
                      <span>${detail.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </details>
          ))}
          <div className="flex justify-between font-bold p-2 border-t">
            <span>Total Liabilities + Equity</span>
            <span>${(totalLiabilities + totalEquity).toLocaleString()}</span>
          </div>
        </div>


      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-blue-500 mb-4">Distribution Chart</h3>
        <Pie data={chartData} width={400} height={400} />
      </div>

      <footer className="mt-8 text-center text-gray-600">
        <p>Balance Sheet as of {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
}

