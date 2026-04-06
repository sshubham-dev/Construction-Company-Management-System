import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import CreateBusinessUnit from "../components/CreateBusinessUnit";
axios.defaults.withCredentials = true;

const BusinessUnitScreen = () => {
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editModal, setEditModalOpen] = useState(false);
const {id} = useParams()
const navigate = useNavigate();

  const onBack = () => {
    navigate(-1);
  };
  useEffect(() => {
    console.log(id);
    fetchUnit(id);
  }, [id]);

  const fetchUnit = async (id) => {
    try {
      const res = await axios.get(`/api/v1/business-unit/${id}`);
      console.log(res.data)
      setUnit(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    const onEdit = (id) => {
    setEditingId(id);
    setEditModalOpen(true);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!unit) return <div className="p-4">Not found</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">{unit.name}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(unit._id)}
            className="bg-green-600 text-white px-3 py-1 rounded w-full sm:w-auto"
          >
            Edit
          </button>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-3 py-1 rounded w-full sm:w-auto"
          >
            Back
          </button>
        </div>
      </div>

      {/* BASIC INFO */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Info label="Code" value={unit.code} />
          <Info label="Type" value={unit.type} />
          <Info label="Phone" value={unit.phone || "-"} />
          <Info label="Email" value={unit.email || "-"} />
          {/* <Info label="GST" value={unit.gstNo || "-"} /> */}
          {/* <Info label="PAN" value={unit.panNo || "-"} /> */}
          <Info label="Manager" value={unit.manager?.name || "-"} />
          <Info
            label="Status"
            value={unit.isActive ? "Active" : "Inactive"}
          />
        </div>
      </Section>

      {/* ADDRESS */}
      <Section title="Address">
        <p className="text-sm">
          {[
            unit.address?.city,
            unit.address?.district,
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
      </Section>

      {/* LEDGER */}
      <Section title="Accounting">
        <p className="text-sm break-all">
          {/* Ledger ID: {unit?.ledgerId || "-"} */}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          All financial entries for this branch flow through this ledger
        </p>
      </Section>

      {/* BANK ACCOUNTS */}
      <Section title="Bank Accounts">
        {unit.bankAccounts?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[600px] border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Bank</th>
                  <th className="border p-2 text-left">Account No</th>
                  <th className="border p-2 text-left">IFSC</th>
                  <th className="border p-2 text-left">Branch</th>
                </tr>
              </thead>
              <tbody>
                {unit.bankAccounts.map((b, i) => (
                  <tr key={i}>
                    <td className="border p-2">{b.name}</td>
                    <td className="border p-2">{b.number}</td>
                    <td className="border p-2">{b.ifsc}</td>
                    <td className="border p-2">{b.branch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No bank accounts added
          </p>
        )}
      </Section>
            <Modal isOpen={editModal} onClose={() => setEditModalOpen(false)}>
              {/* Edit Business Unit Form Component */}
              <CreateBusinessUnit
                onClose={() => setEditModalOpen(false)}
                editId={editingId}
              />
            </Modal>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="font-medium mb-2">{title}</h3>
    <div className="border rounded p-3 bg-white">{children}</div>
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default BusinessUnitScreen;
