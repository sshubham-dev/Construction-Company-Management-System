import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = [
  { name: 'Jan', revenue: 4000, expenses: 2400, receivable: 1000, payable: 500, loans: 200 },
  { name: 'Feb', revenue: 3000, expenses: 1398, receivable: 1200, payable: 600, loans: 250 },
  { name: 'Mar', revenue: 2000, expenses: 9800, receivable: 1100, payable: 550, loans: 220 },
  { name: 'Apr', revenue: 2780, expenses: 3908, receivable: 1300, payable: 650, loans: 270 },
  { name: 'May', revenue: 1890, expenses: 4800, receivable: 1400, payable: 700, loans: 300 },
  { name: 'Jun', revenue: 2390, expenses: 3800, receivable: 1500, payable: 750, loans: 320 },
  { name: 'Jul', revenue: 3490, expenses: 4300, receivable: 1600, payable: 800, loans: 350 },
  { name: 'Aug', revenue: 4390, expenses: 4300, receivable: 1700, payable: 850, loans: 380 },
  { name: 'Sep', revenue: 5390, expenses: 4300, receivable: 1800, payable: 900, loans: 400 },
  { name: 'Oct', revenue: 6390, expenses: 4300, receivable: 1900, payable: 950, loans: 420 },
  { name: 'Nov', revenue: 7390, expenses: 4300, receivable: 2000, payable: 1000, loans: 450 },
  { name: 'Dec', revenue: 8390, expenses: 4300, receivable: 2100, payable: 1050, loans: 480 },
];

const AccountManagement = () => {
  const revenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const expenses = data.reduce((acc, curr) => acc + curr.expenses, 0);
  const receivable = data.reduce((acc, curr) => acc + curr.receivable, 0);
  const payable = data.reduce((acc, curr) => acc + curr.payable, 0);
  const loans = data.reduce((acc, curr) => acc + curr.loans, 0);
  const profit = revenue - expenses;

  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      { label: 'Revenue', data: data.map((item) => item.revenue), backgroundColor: '#8884d8' },
      { label: 'Expenses', data: data.map((item) => item.expenses), backgroundColor: '#82ca9d' },
      { label: 'Receivable', data: data.map((item) => item.receivable), backgroundColor: '#ffc658' },
      { label: 'Payable', data: data.map((item) => item.payable), backgroundColor: '#ff8c00' },
      { label: 'Loans', data: data.map((item) => item.loans), backgroundColor: '#ff006e' },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Months',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Values',
        },
      },
    },
  };

  return (
    <div className="p-4 flex gap-4 flex-col">
      <div className="bg-white shadow-lg p-4 rounded-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">Revenue and Expense Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-100 p-4 rounded">
            <h3 className="text-lg font-bold">Total Revenue</h3>
            <p className="text-2xl font-bold">${revenue.toLocaleString()}</p>
          </div>
          <div className="bg-red-100 p-4 rounded">
            <h3 className="text-lg font-bold">Total Expenses</h3>
            <p className="text-2xl font-bold">${expenses.toLocaleString()}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded">
            <h3 className="text-lg font-bold">Accounts Receivable</h3>
            <p className="text-2xl font-bold">${receivable.toLocaleString()}</p>
          </div>
          <div className="bg-orange-100 p-4 rounded">
            <h3 className="text-lg font-bold">Accounts Payable</h3>
            <p className="text-2xl font-bold">${payable.toLocaleString()}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded">
            <h3 className="text-lg font-bold">Loans</h3>
            <p className="text-2xl font-bold">${loans.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg p-4 rounded-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">Profit and Loss Statement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-100 p-4 rounded">
            <h3 className="text-lg font-bold">Profit</h3>
            <p className="text-2xl font-bold">${profit.toLocaleString()}</p>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <h3 className="text-lg font-bold">Gross Profit</h3>
            <p className="text-2xl font-bold">${(revenue - expenses).toLocaleString()}</p>
          </div>
          <div className="bg-red-100 p-4 rounded">
            <h3 className="text-lg font-bold">Net Profit</h3>
            <p className="text-2xl font-bold">${profit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg p-4 rounded-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">Financial Ratios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-100 p-4 rounded">
            <h3 className="text-lg font-bold">Gross Profit Margin</h3>
            <p className="text-2xl font-bold">{((revenue - expenses) / revenue * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-red-100 p-4 rounded">
            <h3 className="text-lg font-bold">Net Profit Margin</h3>
            <p className="text-2xl font-bold">{((profit / revenue) * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-blue-100 p-4 rounded">
            <h3 className="text-lg font-bold">Current Ratio</h3>
            <p className="text-2xl font-bold">{(receivable / payable).toFixed(2)}</p>
          </div>
          <div className="bg-orange-100 p-4 rounded">
            <h3 className="text-lg font-bold">Debt-to-Equity Ratio</h3>
            <p className="text-2xl font-bold">{(loans / (revenue - expenses)).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg p-4 rounded-lg mb-4">
        <h2 className="text-2xl font-bold mb-4">Revenue and Expenses Over Time</h2>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AccountManagement;