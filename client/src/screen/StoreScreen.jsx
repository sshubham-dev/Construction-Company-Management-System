import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const StoreScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStore();
  }, [id]);

  const fetchStore = async () => {
    try {
      const res = await axios.get(`/api/v1/store/${id}`);
      setStore(res.data);
    } catch (err) {
      console.error("Fetch store error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading store...</div>;
  }

  if (!store) {
    return <div className="p-4 text-sm text-red-500">Store not found</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{store.name}</h2>
          <p className="text-xs text-gray-500">
            {store.businessUnitId?.name || "No Business Unit"}
          </p>
          <p className="text-[11px] text-gray-400">
            Code: {store.code || "-"}
          </p>
        </div>

        <button
          onClick={() => navigate(`/erp/inventory/store/${store._id}/edit`)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
        >
          Edit
        </button>
      </div>

      {/* BASIC INFO */}
      <Section title="Basic Information">
        <Info label="GST Rate" value={`${store.gstRate}%`} />
        <Info
          label="Stock Valuation"
          value={store.stockValuationMethod}
        />
        <Info
          label="Status"
          value={store.isActive ? "Active" : "Inactive"}
        />
      </Section>

      {/* CAPABILITIES */}
      <Section title="Store Capabilities">
        <div className="flex flex-wrap gap-2 text-xs">
          {store.managesConsumables && (
            <Badge label="Consumables" />
          )}
          {store.managesAssets && <Badge label="Assets" />}
          {store.allowInternalSalesToSites && (
            <Badge label="Site Issue" />
          )}
          {store.allowDirectSalesToClients && (
            <Badge label="Client Sales" />
          )}
          {store.allowOfficeItemIssue && (
            <Badge label="Office Issue" />
          )}
        </div>
      </Section>

      {/* ADDRESS */}
      <Section title="Address">
        <p className="text-sm">
          {[
            store.address?.line1,
            store.address?.line2,
            store.address?.city,
            store.address?.district,
            store.address?.state,
            store.address?.pincode,
          ]
            .filter(Boolean)
            .join(", ") || "-"}
        </p>
      </Section>

      {/* ACCOUNTING */}
      <Section title="Accounting">
        <Info
          label="Ledger"
          value={store.ledgerId?.name || store.ledgerId?._id || "-"}
        />
        <p className="text-xs text-gray-500 mt-1">
          All financial transactions of this store flow through this ledger
        </p>
      </Section>
    </div>
  );
};

export default StoreScreen;

/* ========================
   SMALL REUSABLE PARTS
======================== */

const Section = ({ title, children }) => (
  <div className="border rounded bg-white p-3">
    <p className="text-sm font-medium mb-2">{title}</p>
    {children}
  </div>
);

const Info = ({ label, value }) => (
  <div className="text-sm">
    <span className="text-gray-500">{label}:</span>{" "}
    <span className="font-medium">{value}</span>
  </div>
);

const Badge = ({ label }) => (
  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
    {label}
  </span>
);
