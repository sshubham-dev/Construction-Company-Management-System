import { useMemo } from "react";
import { Plus, FileText, IndianRupee, Clock, TrendingUp } from "lucide-react";

// Mock data (replace with API)
const invoices = [];

const currency = (n) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

const Invoice =()=> {
  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
    const paidRevenue = invoices
      .filter((i) => i.status === "paid")
      .reduce((s, i) => s + i.total, 0);
    const pending = totalRevenue - paidRevenue;

    return {
      totalInvoices,
      totalRevenue,
      paidRevenue,
      pending,
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500 text-sm">
              Overview of your invoicing activity
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700">
            <Plus size={18} /> New Invoice
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Total Invoices</p>
              <h2 className="text-2xl font-bold">{stats.totalInvoices}</h2>
            </div>
            <FileText size={32} className="opacity-30" />
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl shadow flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Total Revenue</p>
              <h2 className="text-2xl font-bold">₹{currency(stats.totalRevenue)}</h2>
            </div>
            <IndianRupee size={32} className="opacity-30" />
          </div>

          <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-5 rounded-xl shadow flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Pending Amount</p>
              <h2 className="text-2xl font-bold">₹{currency(stats.pending)}</h2>
            </div>
            <Clock size={32} className="opacity-30" />
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-5 rounded-xl shadow flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Paid Revenue</p>
              <h2 className="text-2xl font-bold">₹{currency(stats.paidRevenue)}</h2>
            </div>
            <TrendingUp size={32} className="opacity-30" />
          </div>

        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Invoices</h2>
            <select className="border rounded px-3 py-2 text-sm">
              <option>All Status</option>
              <option>Paid</option>
              <option>Unpaid</option>
              <option>Partial</option>
            </select>
          </div>

          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500">
              <FileText size={40} className="opacity-30 mb-3" />
              <p>No invoices yet. Create your first invoice!</p>
              <button className="mt-4 px-4 py-2 border rounded hover:bg-gray-100">
                Create Invoice
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Invoice</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b">
                    <td className="py-2">{inv.number}</td>
                    <td>{inv.date}</td>
                    <td>{inv.client?.name}</td>
                    <td>₹{currency(inv.total)}</td>
                    <td>{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Invoice