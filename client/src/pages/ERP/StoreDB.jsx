import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Store = () => {
  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Sales & Purchase (Monthly)' },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Order Summary (Monthly)' },
    },
  };

  // Data for charts
  const salesPurchaseData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      { label: 'Purchase', data: [40000, 30000, 50000, 20000, 40000, 30000, 50000, 20000, 40000], backgroundColor: '#4CAF50' },
      { label: 'Sales', data: [30000, 20000, 40000, 30000, 50000, 40000, 30000, 40000, 50000], backgroundColor: '#2196F3' },
    ],
  };

  const orderSummaryData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      { label: 'Ordered', data: [3000, 4000, 3500, 4500, 3000], borderColor: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.5)', fill: true },
      { label: 'Delivered', data: [2500, 3700, 3000, 4200, 2800], borderColor: '#03A9F4', backgroundColor: 'rgba(3, 169, 244, 0.5)', fill: true },
    ],
  };

  // Overview Cards Data
  const overviewCards = [
    { title: 'Sales', value: '₹ 832', icon: '📈' },
    { title: 'Revenue', value: '₹ 18,300', icon: '💰' },
    { title: 'Profit', value: '₹ 868', icon: '📊' },
    { title: 'Cost', value: '₹ 17,432', icon: '💸' },
  ];

  // Inventory Data
  const inventoryCards = [
    { title: 'Quantity in Hand', value: '868', icon: '📦' },
    { title: 'To be Received', value: '200', icon: '📥' },
    { title: 'Number of Suppliers', value: '31', icon: '👥' },
    { title: 'Number of Categories', value: '21', icon: '📋' },
  ];

  // Stock Data
  const topSellingStock = [
    { name: 'Surf Excel', sold: 30, remaining: 12, price: '₹ 100' },
    { name: 'Rin', sold: 21, remaining: 15, price: '₹ 207' },
    { name: 'Parle G', sold: 19, remaining: 17, price: '₹ 105' },
  ];

  const lowQuantityStock = [
    { name: 'Tata Salt', remaining: 10 },
    { name: 'Lays', remaining: 15 },
  ];

  return (
    <div>
      <Header category="Page" title="Store Management" />
      <section className="container mx-auto mt-4 mb-16">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {overviewCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-500">{card.title}</h3>
                <p className="text-lg font-bold text-gray-800">{card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          ))}
        </div>

        {/* Inventory Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {inventoryCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-500">{card.title}</h3>
                <p className="text-lg font-bold text-gray-800">{card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <Bar data={salesPurchaseData} options={barOptions} />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <Line data={orderSummaryData} options={lineOptions} />
          </div>
        </div>

        {/* Stock Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Selling Stock */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Top Selling Stock</h3>
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Sold Quantity</th>
                  <th className="py-2 px-3">Remaining Quantity</th>
                  <th className="py-2 px-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {topSellingStock.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-3">{item.name}</td>
                    <td className="py-2 px-3">{item.sold}</td>
                    <td className="py-2 px-3">{item.remaining}</td>
                    <td className="py-2 px-3">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Low Quantity Stock */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Low Quantity Stock</h3>
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Remaining Quantity</th>
                </tr>
              </thead>
              <tbody>
                {lowQuantityStock.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-3">{item.name}</td>
                    <td className="py-2 px-3">{item.remaining}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      <Toaster position="top-right" />
    </div>
  );
};

export default Store;



// const StoreDashboard = () => {
//   const { id } = useParams();

//   const [summary, setSummary] = useState({});
//   const [inventory, setInventory] = useState([]);
//   const [lowStock, setLowStock] = useState([]);
//   const [transactions, setTransactions] = useState([]);

//   useEffect(() => {
//     fetchAll();
//   }, [id]);

//   const fetchAll = async () => {
//     try {
//       const [s, i, l, t] = await Promise.all([
//         axios.get(`/api/v1/store/${id}/summary`),
//         axios.get(`/api/v1/store/${id}/inventory`),
//         axios.get(`/api/v1/store/${id}/low-stock`),
//         axios.get(`/api/v1/store/${id}/transactions`),
//       ]);

//       setSummary(s.data);
//       setInventory(i.data);
//       setLowStock(l.data);
//       setTransactions(t.data);
//     } catch {
//       toast.error("Failed to load dashboard");
//     }
//   };

//   return (
//     <div className="p-4 space-y-6">

//       {/* HEADER */}
//       <h2 className="text-xl font-semibold">Store Dashboard</h2>

//       {/* KPI */}
//       <div className="grid grid-cols-4 gap-4">
//         <Card title="Total Items" value={summary.totalItems} />
//         <Card title="Total Qty" value={summary.totalQuantity} />
//         <Card title="Stock Value" value={`₹ ${summary.totalValue}`} />
//         <Card title="Low Stock" value={summary.lowStockCount} />
//       </div>

//       {/* QUICK ACTIONS */}
//       <div className="flex gap-3">
//         <ActionBtn label="Transfer" />
//         <ActionBtn label="Issue (DN)" />
//         <ActionBtn label="Stock Audit" />
//         <ActionBtn label="Return" />
//       </div>

//       {/* LOW STOCK */}
//       <Section title="Low Stock Items">
//         <table className="w-full text-sm">
//           <thead>
//             <tr>
//               <th>Item</th>
//               <th>Qty</th>
//             </tr>
//           </thead>
//           <tbody>
//             {lowStock.map((i) => (
//               <tr key={i._id}>
//                 <td>{i.itemName}</td>
//                 <td className="text-red-600">{i.quantity}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </Section>

//       {/* INVENTORY */}
//       <Section title="Inventory Snapshot">
//         <table className="w-full text-sm">
//           <thead>
//             <tr>
//               <th>Item</th>
//               <th>Qty</th>
//               <th>Available</th>
//               <th>Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             {inventory.map((i, idx) => (
//               <tr key={idx}>
//                 <td>{i.itemName}</td>
//                 <td>{i.quantity}</td>
//                 <td>{i.availableQty}</td>
//                 <td>₹ {i.value}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </Section>

//       {/* TRANSACTIONS */}
//       <Section title="Recent Transactions">
//         <table className="w-full text-sm">
//           <thead>
//             <tr>
//               <th>Type</th>
//               <th>Qty</th>
//               <th>Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {transactions.map((t) => (
//               <tr key={t._id}>
//                 <td>{t.type}</td>
//                 <td>{t.qtyIn || t.qtyOut}</td>
//                 <td>{new Date(t.createdAt).toLocaleDateString()}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </Section>

//     </div>
//   );
// };

// export default StoreDashboard;

/* COMPONENTS */

const Card = ({ title, value }) => (
  <div className="border p-4 rounded bg-white">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-lg font-semibold">{value || 0}</p>
  </div>
);

const ActionBtn = ({ label }) => (
  <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
    {label}
  </button>
);

const Section = ({ title, children }) => (
  <div className="border rounded p-4 bg-white space-y-3">
    <p className="text-sm font-medium">{title}</p>
    {children}
  </div>
);