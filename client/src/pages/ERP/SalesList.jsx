import React, { useState, useEffect } from 'react';

const SalesList = () => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      const response = await fetch('/api/sales');
      const data = await response.json();
      setSales(data);
    };

    fetchSales();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Sales Vouchers</h2>
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Voucher Number</th>
            <th className="px-4 py-2 border">Customer Name</th>
            <th className="px-4 py-2 border">Date</th>
            <th className="px-4 py-2 border">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(sale => (
            <tr key={sale._id}>
              <td className="px-4 py-2 border">{sale.voucherNumber}</td>
              <td className="px-4 py-2 border">{sale.customerName}</td>
              <td className="px-4 py-2 border">{new Date(sale.date).toLocaleDateString()}</td>
              <td className="px-4 py-2 border">{sale.grandTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesList;
