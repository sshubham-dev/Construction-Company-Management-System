import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";

const DNDetail = () => {
  const { id } = useParams();

  const [dn, setDn] = useState(null);

  useEffect(() => {
    fetchDN();
  }, []);

  const fetchDN = async () => {
    try {
      const { data } = await axios.get(`/api/v1/delivery-note/${id}`);
      setDn(data);
    } catch {
      toast.error("Failed to load DN");
    }
  };

  const reverseDN = async () => {
    if (!window.confirm("Reverse this DN?")) return;

    try {
      await axios.post(`/api/v1/delivery-note/${id}/reverse`);
      toast.success("DN reversed");
      fetchDN();
    } catch {
      toast.error("Reverse failed");
    }
  };

  if (!dn) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-3 space-y-4 pb-24">

      {/* HEADER */}
      <div>
        <div className="flex justify-between">
          <h2 className="font-semibold">{dn.dnNumber}</h2>
          <span className="text-xs bg-blue-100 px-2 py-1 rounded">
            {dn.status}
          </span>
        </div>

        <div className="text-sm text-gray-600">
          {dn.store?.name} → {dn.site?.name}
        </div>

        <div className="text-xs text-gray-500">
          {moment(dn.date).format("DD MMM YYYY")}
        </div>
      </div>

      {/* ITEMS */}
      <div className="space-y-3">
        {dn.items.map((i, idx) => (
          <div key={idx} className="border p-3 rounded bg-white">

            <div className="flex justify-between">
              <span className="font-medium">
                {i.itemId?.name}
              </span>
              <span className="text-xs">{i.unit}</span>
            </div>

            <div className="flex justify-between text-sm mt-1">
              <span>Issued: {i.quantity}</span>
            </div>

          </div>
        ))}
      </div>

      {/* STOCK MOVEMENT */}
      <Section title="Stock Movement">
        <div className="text-sm text-gray-600">
          Deducted from store inventory
        </div>
      </Section>

      {/* AUDIT */}
      <Section title="Audit Trail">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Created By: {dn.createdBy?.name}</div>
          <div>Created At: {moment(dn.createdAt).format("DD MMM HH:mm")}</div>
        </div>
      </Section>

      {/* ACTIONS */}
      {dn.status === "ISSUED" && (
        <button
          onClick={reverseDN}
          className="fixed bottom-4 left-4 right-4 bg-red-600 text-white py-3 rounded-lg"
        >
          Reverse DN
        </button>
      )}
    </div>
  );
};

export default DNDetail;

const Section = ({ title, children }) => (
  <div className="border rounded p-3 bg-white space-y-2">
    <p className="text-sm font-medium">{title}</p>
    {children}
  </div>
);