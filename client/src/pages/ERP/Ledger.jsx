import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateLedger from "../../components/CreateLedger";
import Modal from "../../components/Modal";

const LedgerList = () => {
  const [ledgers, setLedgers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        const res = await axios.get("/api/v1/ledger");
        setLedgers(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Error fetching ledgers", err);
      }
    };
    fetchLedgers();
  }, []);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);
    const filtered = ledgers.filter((l) =>
      l.name.toLowerCase().includes(keyword)
    );
    setFiltered(filtered);
  };

  const badgeColor = (nature) => {
    return (
      {
        Assets: "bg-green-100 text-green-700",
        Liability: "bg-red-100 text-red-700",
        Income: "bg-blue-100 text-blue-700",
        Expenses: "bg-yellow-100 text-yellow-700",
      }[nature] || "bg-gray-100 text-gray-700"
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Ledger Overview</h1>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by ledger name..."
          className="border px-3 py-2 rounded w-72"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((ledger) => (
          <div
            key={ledger._id}
            onClick={() => setSelectedLedger(ledger)}
            className="bg-white shadow hover:shadow-lg p-4 rounded cursor-pointer border"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{ledger.name}</h2>
              <span
                className={`text-xs px-2 py-1 rounded ${badgeColor(
                  ledger?.under
                )}`}
              >
                {ledger?.under}
              </span>
            </div>

            <div className="text-sm space-y-1">
              <p>Alias: {ledger.alias || "-"}</p>
              <p className="text-green-700">Receivable: ₹{ledger.receivable}</p>
              <p className="text-red-700">Payable: ₹{ledger.payable}</p>
              <p>Opening: ₹{ledger.openingBalance}</p>
              <p>Current: ₹{ledger.currentBalance}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ledger Detail Modal */}
      {selectedLedger && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
            <button
              onClick={() => setSelectedLedger(null)}
              className="absolute top-2 right-2 text-xl text-gray-500 hover:text-black"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedLedger.name}</h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Alias:</strong> {selectedLedger.alias || "N/A"}
              </p>
              <p>
                <strong>Group:</strong> {selectedLedger.under}
              </p>
              <p>
                <strong>Current Balance:</strong> ₹
                {selectedLedger.currentBalance}
              </p>
              <p>
                <strong>Payable:</strong> ₹{selectedLedger.payable}
              </p>
              <p>
                <strong>Receivable:</strong> ₹{selectedLedger.receivable}
              </p>
              <p>
                <strong>Paid:</strong> ₹{selectedLedger.paid}
              </p>
              <p>
                <strong>Received:</strong> ₹{selectedLedger.received}
              </p>
              <p>
                <strong>PAN:</strong>{" "}
                {selectedLedger.taxRegistrationDetails?.panNo || "-"}
              </p>
              <p>
                <strong>GST:</strong>{" "}
                {selectedLedger.taxRegistrationDetails?.gstNo || "-"}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {selectedLedger.mailingDetails?.address || "-"}
              </p>
              <p>
                <strong>Bank:</strong>{" "}
                {selectedLedger.bankingDetails?.bankName || "-"}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Floating Button (Mobile) */}
      <div className="fixed bottom-[70px] right-6 sm:hidden z-[45]">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full shadow-lg text-2xl"
        >
          +
        </button>
      </div>

      {/* Add Expense Button (Desktop) */}
      <div className="hidden right-6 fixed bottom-[70px] sm:flex justify-end mt-6 z-[45]">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Add Ledger
        </button>
      </div>
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        head="Create Ledger"
      >
        <CreateLedger onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
};

export default LedgerList;
