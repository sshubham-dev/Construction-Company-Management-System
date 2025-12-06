import React from "react";
import MainLayout from "../../layouts/MainLayout";

const journalGeneralInfo = {
  date: "2025-08-21",
  status: "Approved",
  description: "Payment for site material purchase and advance settlement."
};

const journalEntries = [
  { id: 1, account: "Purchase - Cement", type: "Debit", amount: 50000 },
  { id: 2, account: "Cash", type: "Credit", amount: 30000 },
  { id: 3, account: "Bank", type: "Credit", amount: 20000 },
];

const attachments = [
  { id: 1, name: "Invoice-001.pdf", url: "#", type: "pdf" },
  { id: 2, name: "PaymentReceipt.jpg", url: "#", type: "image" },
];

const JournalEntryDetails = () => {
  const debitTotal = journalEntries
    .filter(e => e.type === "Debit")
    .reduce((sum, e) => sum + e.amount, 0);

  const creditTotal = journalEntries
    .filter(e => e.type === "Credit")
    .reduce((sum, e) => sum + e.amount, 0);

  const isBalanced = debitTotal === creditTotal;

  return (
    <MainLayout title="Journal Entry Details">
      <div className="space-y-6 pb-24"> {/* space for sticky footer */}
        
        {/* General Info */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-3">General Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">{journalGeneralInfo.date}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold 
                ${journalGeneralInfo.status === "Approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {journalGeneralInfo.status}
              </span>
            </div>
            <div className="sm:col-span-3">
              <p className="text-gray-500">Description</p>
              <p className="font-medium">{journalGeneralInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Entries */}
        <div>
          <h3 className="font-semibold mb-3">Entries</h3>
          <div className="space-y-3">
            {journalEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center p-3 rounded-lg shadow-sm bg-gray-50"
              >
                <div>
                  <p className="font-medium text-sm">{entry.account}</p>
                  <p className="text-xs text-gray-500">{entry.type}</p>
                </div>
                <p className={`font-semibold ${entry.type === "Debit" ? "text-red-500" : "text-green-600"}`}>
                  {entry.type === "Debit" ? `₹${entry.amount.toLocaleString()}` : `+₹${entry.amount.toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <h3 className="font-semibold mb-3">Attachments</h3>
          <div className="flex flex-wrap gap-3">
            {attachments.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 text-sm"
              >
                {file.type === "pdf" ? (
                  <span className="text-red-500">📄</span>
                ) : (
                  <span className="text-blue-500">🖼️</span>
                )}
                {file.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Footer Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-6 py-3 flex justify-between items-center z-50">
        <div className="text-sm">
          <span className="text-red-500 font-semibold mr-4">Debit: ₹{debitTotal.toLocaleString()}</span>
          <span className="text-green-600 font-semibold">Credit: ₹{creditTotal.toLocaleString()}</span>
        </div>
        <div className={`text-sm font-bold px-3 py-1 rounded-lg ${
          isBalanced ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {isBalanced ? "✅ Balanced" : "⚠️ Not Balanced"}
        </div>
      </div>
    </MainLayout>
  );
};

export default JournalEntryDetails;
