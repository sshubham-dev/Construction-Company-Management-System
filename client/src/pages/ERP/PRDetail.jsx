import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import moment from "moment";

const PRDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pr, setPr] = useState(null);
  const [dns, setDns] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD
  ========================== */
  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [prRes, dnRes] = await Promise.all([
        axios.get(`/api/v1/purchase-request/${id}`),
        axios.get(`/api/v1/delivery-note?purchaseRequestId=${id}`)
      ]);

      setPr(prRes.data);
      setDns(dnRes.data || []);
    } catch {
      toast.error("Failed to load PR");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HELPERS
  ========================== */

  const getItemDNs = (itemId) =>
    dns.filter((d) => d.items?.some((i) => i.itemId === itemId));

  const issuedByItem = useMemo(() => {
    const map = {};
    dns.forEach((d) => {
      d.items?.forEach((i) => {
        map[i.itemId] = (map[i.itemId] || 0) + (i.quantity || 0);
      });
    });
    return map;
  }, [dns]);

  const balance = (item) =>
    Math.max(0, (item.requestedQty || 0) - (issuedByItem[item.itemId] || 0));

  const statusColor = (s) => {
    switch (s) {
      case "DRAFT": return "bg-gray-100 text-gray-700";
      case "REQUESTED": return "bg-blue-100 text-blue-700";
      case "APPROVED": return "bg-green-100 text-green-700";
      case "PARTIAL": return "bg-yellow-100 text-yellow-700";
      case "DELIVERED": return "bg-purple-100 text-purple-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  /* =========================
     ACTIONS
  ========================== */

  const createRFQ = async () => {
    try {
      const res = await axios.post("/api/v1/rfq", {
        purchaseRequestId: pr._id,
        suppliers: [] // open selection flow or pre-fill if you have UI
      });
      toast.success("RFQ created");
      navigate(`/erp/rfq/${res.data.data?._id || ""}`);
    } catch {
      toast.error("Failed to create RFQ");
    }
  };

  /* =========================
     RENDER
  ========================== */

  if (loading) return <div className="p-4">Loading...</div>;
  if (!pr) return null;

  return (
    <div className="p-3 space-y-4 pb-24 max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{pr.prNumber}</h2>
          <span className={`text-xs px-2 py-1 rounded ${statusColor(pr.status)}`}>
            {pr.status}
          </span>
        </div>

        <div className="text-sm text-gray-600">
          {pr.site?.name} → {pr.store?.name}
        </div>

        <div className="text-xs text-gray-500">
          {moment(pr.reqDate).format("DD MMM YYYY")}
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex gap-2 flex-wrap">
        {pr.status === "APPROVED" && (
          <button
            onClick={createRFQ}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
          >
            Create RFQ
          </button>
        )}

        <button
          onClick={() => navigate(`/erp/dn/create?prId=${pr._id}`)}
          className="bg-green-600 text-white px-3 py-2 rounded text-sm"
        >
          Issue (DN)
        </button>
      </div>

      {/* ITEMS */}
      <Section title="Items">
        <div className="space-y-3">
          {pr.items?.map((item) => {
            const issued = issuedByItem[item.itemId] || 0;
            const bal = balance(item);

            return (
              <div key={item._id || item.itemId} className="border rounded p-3 bg-white">

                <div className="flex justify-between">
                  <span className="font-medium">{item.itemId?.name}</span>
                  <span className="text-xs text-gray-500">{item.unit}</span>
                </div>

                <div className="flex justify-between text-sm mt-1">
                  <span>Req: {item.requestedQty}</span>
                  <span>Issued: {issued}</span>
                  <span>Bal: {bal}</span>
                </div>

                {/* PROGRESS */}
                <div className="h-2 bg-gray-200 rounded mt-2">
                  <div
                    className="h-2 bg-green-500 rounded"
                    style={{
                      width: `${Math.min(
                        100,
                        (issued / (item.requestedQty || 1)) * 100
                      )}%`
                    }}
                  />
                </div>

                {/* DN LIST */}
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  {getItemDNs(item.itemId).map((dn) => (
                    <div key={dn._id}>
                      DN: {dn.dnNumber || dn._id} ({moment(dn.date).format("DD MMM")})
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      </Section>

      {/* DELIVERY STATUS */}
      <Section title="Delivery Status">
        <div className="text-sm">
          {pr.deliveryStatus}
        </div>
      </Section>

      {/* LIFECYCLE TIMELINE */}
      <Section title="Lifecycle">
        <div className="space-y-2 text-sm text-gray-600">
          <div>Created → {moment(pr.createdAt).format("DD MMM")}</div>
          {pr.status !== "DRAFT" && <div>Requested</div>}
          {pr.status === "APPROVED" && <div>Approved</div>}
          {pr.status === "PARTIAL" && <div>Partially Delivered</div>}
          {pr.status === "DELIVERED" && <div>Delivered</div>}
        </div>
      </Section>

    </div>
  );
};

export default PRDetail;

/* ========================= */

const Section = ({ title, children }) => (
  <div className="border rounded p-3 bg-white space-y-2">
    <p className="text-sm font-medium">{title}</p>
    {children}
  </div>
);