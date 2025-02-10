// import React from 'react'
// import toast, { Toaster } from 'react-hot-toast';
// import Header from '../../components/Header';

// const Sales = () => {
//   return (
//     <div >
//     <Header category="Page" title="Sales Management" />
//     <section className='container mx-auto mt-4 mb-16'>
//         <div className='overflow-x-auto w-full max-w-screen-xl mx-auto'>
//       {/* Overall Inventory Section */}
//       <div className="grid grid-cols-4 gap-4 bg-white p-6 rounded-lg shadow-md mb-6">
//         <div className="text-center">
//           <h3 className="text-lg font-semibold text-blue-500">Categories</h3>
//           <p className="text-2xl font-bold">14</p>
//           <p className="text-sm text-gray-500">Last 7 days</p>
//         </div>
//         <div className="text-center">
//           <h3 className="text-lg font-semibold text-orange-500">Total Products</h3>
//           <p className="text-2xl font-bold">868</p>
//           <p className="text-sm text-gray-500">Last 7 days</p>
//         </div>
//         <div className="text-center">
//           <h3 className="text-lg font-semibold text-purple-500">Top Selling</h3>
//           <p className="text-2xl font-bold">5</p>
//           <p className="text-sm text-gray-500">Last 7 days</p>
//         </div>
//         <div className="text-center">
//           <h3 className="text-lg font-semibold text-red-500">Low Stocks</h3>
//           <p className="text-2xl font-bold">12</p>
//           <p className="text-sm text-gray-500">Ordered</p>
//         </div>
//       </div>

//       {/* Products Table */}
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Products</h2>
//           <div className="flex gap-2">
//             <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Product</button>
//             <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Filters</button>
//             <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Download all</button>
//           </div>
//         </div>

//         <table className="table-auto w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-gray-200 text-gray-700">
//               <th className="px-4 py-2">Products</th>
//               <th className="px-4 py-2">Buying Price</th>
//               <th className="px-4 py-2">Quantity</th>
//               <th className="px-4 py-2">Threshold Value</th>
//               <th className="px-4 py-2">Expiry Date</th>
//               <th className="px-4 py-2">Availability</th>
//             </tr>
//           </thead>
//           <tbody>
//             {[
//               { name: "Maggi", price: 430, quantity: "43 Packets", threshold: "12 Packets", expiry: "11/12/22", status: "In-stock", statusColor: "text-green-500" },
//               { name: "Bru", price: 257, quantity: "22 Packets", threshold: "12 Packets", expiry: "21/12/22", status: "Out of stock", statusColor: "text-red-500" },
//               { name: "Red Bull", price: 405, quantity: "36 Packets", threshold: "9 Packets", expiry: "5/12/22", status: "In-stock", statusColor: "text-green-500" },
//               { name: "Bourn Vita", price: 502, quantity: "14 Packets", threshold: "6 Packets", expiry: "8/12/22", status: "Out of stock", statusColor: "text-red-500" },
//               { name: "Horlicks", price: 530, quantity: "5 Packets", threshold: "5 Packets", expiry: "9/1/23", status: "In-stock", statusColor: "text-green-500" },
//               { name: "Harpic", price: 605, quantity: "10 Packets", threshold: "5 Packets", expiry: "9/1/23", status: "In-stock", statusColor: "text-green-500" },
//               { name: "Ariel", price: 408, quantity: "23 Packets", threshold: "7 Packets", expiry: "15/12/23", status: "Out of stock", statusColor: "text-red-500" },
//               { name: "Scotch Brite", price: 359, quantity: "43 Packets", threshold: "8 Packets", expiry: "6/6/23", status: "In-stock", statusColor: "text-green-500" },
//               { name: "Coca Cola", price: 205, quantity: "41 Packets", threshold: "10 Packets", expiry: "11/12/22", status: "Low stock", statusColor: "text-yellow-500" },
//             ].map((product, index) => (
//               <tr key={index} className="border-t">
//                 <td className="px-4 py-2">{product.name}</td>
//                 <td className="px-4 py-2">₹{product.price}</td>
//                 <td className="px-4 py-2">{product.quantity}</td>
//                 <td className="px-4 py-2">{product.threshold}</td>
//                 <td className="px-4 py-2">{product.expiry}</td>
//                 <td className={`px-4 py-2 ${product.statusColor}`}>{product.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="flex justify-between items-center mt-4">
//           <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Previous</button>
//           <p>Page 1 of 10</p>
//           <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Next</button>
//         </div>
//       </div>
//         </div>
//         <Toaster
//             position="top-right"
//             reverseOrder={false}
//         />
//     </section>
// </div>
//   )
// }

// export default Sales


import React from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);
// import Header from "./components/Header";
// import Filters from "./components/Filters";
// import SummaryCards from "./components/SummaryCards";
// import SalesTable from "./components/SalesTable";
// import Charts from "./components/Charts";

const Sales = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Filters />
      <SummaryCards />
      <SalesTable />
      <Charts />
    </div>
  );
};

// export default App;
const salesData = [
  {
    orderNo: "1001",
    site: "Site A",
    supplier: "Supplier X",
    orderDate: "2023-10-01",
    deliveryDate: "2023-10-10",
    totalAmount: "$5,000",
    status: "Delivered",
  },
  {
    orderNo: "1002",
    site: "Site B",
    supplier: "Supplier Y",
    orderDate: "2023-10-02",
    deliveryDate: "2023-10-12",
    totalAmount: "$3,200",
    status: "Pending",
  },
];

const SalesTable = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Order No</th>
            <th className="p-3 text-left">Site</th>
            <th className="p-3 text-left">Supplier</th>
            <th className="p-3 text-left">Order Date</th>
            <th className="p-3 text-left">Delivery Date</th>
            <th className="p-3 text-left">Total Amount</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((order, index) => (
            <tr key={index} className="border-t">
              <td className="p-3">{order.orderNo}</td>
              <td className="p-3">{order.site}</td>
              <td className="p-3">{order.supplier}</td>
              <td className="p-3">{order.orderDate}</td>
              <td className="p-3">{order.deliveryDate}</td>
              <td className="p-3">{order.totalAmount}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-sm ${order.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                >
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Sales;


const Charts = () => {
  const salesTrendData = {
    labels: ["Oct 1", "Oct 2", "Oct 3", "Oct 4", "Oct 5"],
    datasets: [
      {
        label: "Sales",
        data: [5000, 3200, 7800, 4500, 6000],
        borderColor: "rgba(79, 70, 229, 1)",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
      },
    ],
  };

  const statusDistributionData = {
    labels: ["Delivered", "Pending", "Shipped"],
    datasets: [
      {
        data: [120, 20, 10],
        backgroundColor: ["#10B981", "#FBBF24", "#3B82F6"],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-4 rounded-lg shadow col-span-1">
        <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
        <Line
          data={salesTrendData}
          width={100}
          height={50}
          options={{ maintainAspectRatio: true }}
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow col-span-1">
        <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
        <Pie
          data={statusDistributionData}
          width={100}
          height={50}
          options={{ maintainAspectRatio: true }}
        />
      </div>
    </div>
  );
};

// export default Charts;


const SummaryCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500">Total Orders</h3>
        <p className="text-2xl font-bold">150</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500">Total Revenue</h3>
        <p className="text-2xl font-bold">$250,000</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500">Pending Orders</h3>
        <p className="text-2xl font-bold">20</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500">Delivered Orders</h3>
        <p className="text-2xl font-bold">120</p>
      </div>
    </div>
  );
};

// export default SummaryCards;


const Filters = () => {
  return (
    <div className="mb-6 grid grid-flow-col gap-5">
      <input
        type="search"
        placeholder="Search Order No"
        className="p-2 border rounded-lg"
      />
      <input
        type="date"
        className="p-2 border rounded-lg"
      />
      <select className="p-2 border rounded-lg">
        <option>Select Site</option>
        <option>Site A</option>
        <option>Site B</option>
      </select>
      <select className="p-2 border rounded-lg">
        <option>Select Supplier</option>
        <option>Supplier X</option>
        <option>Supplier Y</option>
      </select>
      <select className="p-2 border rounded-lg">
        <option>Select Status</option>
        <option>Pending</option>
        <option>Delivered</option>
        <option>Shipped</option>
      </select>
    </div>
  );
};

// export default Filters;


const Header = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800">Sales Management Dashboard</h1>
      <p className="text-gray-600">Inventory and Sales Order Overview</p>
    </div>
  );
};

// export default Header;