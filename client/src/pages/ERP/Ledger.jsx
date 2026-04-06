import { useEffect, useState } from "react";
import axios from "axios";
import CreateLedger from "../../components/CreateLedger";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";

const LedgerList = () => {
  const [ledgers, setLedgers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [editLedger, setEditLedger] = useState(null);
  const [showForm, setShowForm] = useState(false);
    const { user } = useSelector((state) => state.auth);

  const fetchLedgers = async () => {
    const res = await axios.get("/api/v1/ledger",{ params: { companyId: user.companyId } });
    console.log(res.data)
    setLedgers(res.data);
    setFiltered(res.data);
  };

  useEffect(() => {
    fetchLedgers();
  }, []);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);
    setFiltered(ledgers.filter((l) => l.name.toLowerCase().includes(keyword)));
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Ledger Overview</h1>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search ledger..."
          className="border px-3 py-2 rounded w-72"
        />
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((ledger) => (
          <div
            key={ledger._id}
            className="bg-white border rounded p-4 shadow hover:shadow-md"
          >
            <div className="flex justify-between items-center mb-2">
              <h2
                className="text-lg font-semibold cursor-pointer"
                onClick={() => setSelectedLedger(ledger)}
              >
                {ledger.name}
              </h2>

              <button
                onClick={() => {
                  setEditLedger(ledger);
                  setShowForm(true);
                }}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>
            </div>

            <div className="text-sm space-y-1">
              <p>Group: {ledger.groupId?.name}</p>
              <p>Opening: ₹{ledger.openingBalance}</p>
              <p className="font-medium">Current: ₹{ledger.currentBalance}</p>

              <div className="pt-2 text-xs">
                <p className="text-green-700">
                  Receivable: ₹{ledger.summary?.receivable || 0}
                </p>
                <p className="text-red-700">
                  Payable: ₹{ledger.summary?.payable || 0}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MODAL */}
      {selectedLedger && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg mx-6 w-full max-w-xl p-6 relative">
            <button
              onClick={() => setSelectedLedger(null)}
              className="absolute top-2 right-3 text-xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {selectedLedger.name}
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Alias:</strong> {selectedLedger.alias || "-"}
              </p>
              <p>
                <strong>Group:</strong> {selectedLedger.groupId?.name || "-"}
              </p>
              <p>
                <strong>Company:</strong> {selectedLedger.companyId?.name || "-"}
              </p>
              <p>
                <strong>Opening Balance:</strong> ₹
                {selectedLedger.openingBalance}
              </p>
              <p>
                <strong>Current Balance:</strong> ₹
                {selectedLedger.currentBalance}
              </p>

              <p>
                <strong>Receivable:</strong> ₹
                {selectedLedger.summary?.receivable || 0}
              </p>
              <p>
                <strong>Payable:</strong> ₹
                {selectedLedger.summary?.payable || 0}
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

      {/* FLOATING ADD */}
      <div className="fixed bottom-[70px] right-6 z-40">
        <button
          onClick={() => {
            setEditLedger(null);
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-full shadow text-xl"
        >
          +
        </button>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditLedger(null);
        }}
        head={editLedger ? "Edit Ledger" : "Create Ledger"}
      >
        <CreateLedger
          editData={editLedger}
          onClose={() => {
            setShowForm(false);
            setEditLedger(null);
            fetchLedgers();
          }}
        />
      </Modal>
    </div>
  );
};

export default LedgerList;
