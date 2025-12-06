import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";

const transactions = [
  { id: 1, type: "Material Purchase", invoice: "INV-2023-001", amount: -415000 },
  { id: 2, type: "Payment Received", invoice: "PAY-2023-001", amount: 415000 },
  { id: 3, type: "Material Purchase", invoice: "INV-2023-002", amount: -207500 },
  { id: 4, type: "Payment Received", invoice: "PAY-2023-002", amount: 207500 },
  { id: 5, type: "Material Purchase", invoice: "INV-2023-003", amount: -99800 },
  { id: 6, type: "Payment Received", invoice: "PAY-2023-003", amount: 99800 },
];

const monthlySummary = [
  { name: "Jan", debit: 200000, credit: 150000 },
  { name: "Feb", debit: 250000, credit: 200000 },
  { name: "Mar", debit: 180000, credit: 220000 },
  { name: "Apr", debit: 300000, credit: 280000 },
  { name: "May", debit: 250000, credit: 260000 },
  { name: "Jun", debit: 100000, credit: 150000 },
];

const LedgerDetail = () => {
  return (
    <MainLayout title='Ledger Details'>
    <div className="space-y-5 pb-6">

      {/* Ledger Info */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-4 shadow-sm">
        <div>
          <p className="text-gray-500 text-sm">Ledger</p>
          <h3 className="font-semibold">Material Costs</h3>
          <p className="text-xs text-gray-400">Ledger ID: 12345</p>
        </div>
        <img
          src="https://via.placeholder.com/60"
          alt="Ledger"
          className="rounded-lg w-16 h-16 object-cover"
        />
      </div>

      {/* Transaction History */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Transaction History</h3>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm">
              <div>
                <p className="font-medium text-sm">{tx.type}</p>
                <p className="text-xs text-gray-500">{tx.invoice}</p>
              </div>
              <p className={`font-semibold ${tx.amount < 0 ? "text-red-500" : "text-green-600"}`}>
                {tx.amount < 0 ? `₹${Math.abs(tx.amount).toLocaleString()}` : `+₹${tx.amount.toLocaleString()}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Summary */}
      <div>
        <h3 className="font-semibold mb-3">Monthly Summary</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlySummary}>
            <XAxis dataKey="name" />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="debit" fill="#f87171" name="Debit" />
            <Bar dataKey="credit" fill="#34d399" name="Credit" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    </MainLayout>
  );
};

export default LedgerDetail;
