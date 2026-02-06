import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const DeliveryNoteScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dn, setDn] = useState(null);

  useEffect(() => {
    fetchDN();
  }, []);

  const fetchDN = async () => {
    const res = await axios.get(`/api/v1/delivery-note/${id}`);
    setDn(res.data);
  };

  if (!dn) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{dn.deliveryNoteNo}</h2>

        {dn.status === "Draft" && (
          <button
            onClick={() =>
              navigate(`/erp/inventory/delivery-note/edit/${dn._id}`)
            }
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Edit
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="border p-3 rounded bg-white text-sm space-y-1">
        <p><b>Store:</b> {dn.store?.name}</p>
        <p><b>Site:</b> {dn.site?.name}</p>
        <p><b>Status:</b> {dn.status}</p>
        <p><b>Issued On:</b> {new Date(dn.issueDate).toLocaleDateString()}</p>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {dn.items.map((item, idx) => (
          <div
            key={idx}
            className="border rounded p-3 bg-white"
          >
            <p className="font-medium">{item.item}</p>
            <p className="text-xs text-gray-500">
              Requested: {item.requestedQty} | Approved: {item.approvedQty}
            </p>

            <p className="text-sm mt-1">
              Issued: {item.issuedQty} {item.unit}
            </p>

            {dn.status !== "Draft" && (
              <>
                <p className="text-sm">
                  Received: {item.receivedQty || 0}
                </p>
                <p className="text-sm">
                  Accepted: {item.acceptedQty || 0}
                </p>
                {item.rejectedQty > 0 && (
                  <p className="text-xs text-red-600">
                    Rejected: {item.rejectedQty} ({item.rejectionReason})
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      {dn.status === "Issued" && (
        <button
          onClick={() =>
            navigate(`/erp/inventory/delivery-note/confirm/${dn._id}`)
          }
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Confirm Receipt
        </button>
      )}
    </div>
  );
};

export default DeliveryNoteScreen;
