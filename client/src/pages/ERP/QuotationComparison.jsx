import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useNavigate, data } from "react-router-dom";

const data = {
    rfq: { _id: "1", rfqNo: "RFQ-001" },
    items: [
      {
        itemId: "i1",
        name: "Cement",
        quantity: 100,
        unit: "Bag",
        lastPurchaseRate: 320,
      },
    ],
    suppliers: [
      {
        supplierId: "s1",
        name: "ABC Traders",
        quotationId: "q1",
        items: [{ itemId: "i1", rate: 315, variance: -5 }],
      },
      {
        supplierId: "s2",
        name: "XYZ Supply",
        quotationId: "q2",
        items: [{ itemId: "i1", rate: 330, variance: 10 }],
      },
    ],
  },


const QuotationComparison = () => {
  const { id } = useParams(); // rfqId
  const navigate = useNavigate();

  const [data, setData] = useState(data);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/v1/rfq/${id}/comparison`);
      setData(res.data);
    } catch {
      toast.error("Failed to load comparison");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HELPERS
  ========================== */

  const getRate = (supplier, itemId) => {
    return supplier.items.find((i) => i.itemId === itemId);
  };

  // Best rate per item
  const bestRates = useMemo(() => {
    if (!data) return {};
    const map = {};
    data.items.forEach((item) => {
      let min = Infinity;
      data.suppliers.forEach((s) => {
        const r = getRate(s, item.itemId);
        if (r && r.rate < min) min = r.rate;
      });
      map[item.itemId] = min;
    });
    return map;
  }, [data]);

  /* =========================
     SELECT SUPPLIER
  ========================== */

  const handleSelect = (supplierId) => {
    setSelectedSupplier(supplierId);
  };

  /* =========================
     GENERATE PO
  ========================== */

  const generatePO = async () => {
    if (!selectedSupplier) {
      return toast.error("Select supplier first");
    }

    try {
      const supplier = data.suppliers.find(
        (s) => s.supplierId === selectedSupplier,
      );

      await axios.post("/api/v1/purchase-order/from-quotation", {
        rfqId: data.rfq._id,
        quotationId: supplier.quotationId,
      });

      toast.success("PO created");
      navigate("/erp/purchase-orders");
    } catch {
      toast.error("PO creation failed");
    }
  };

  /* =========================
     UI
  ========================== */

  if (loading) return <div className="p-4">Loading...</div>;
  if (!data) return null;

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          RFQ Comparison - {data.rfq.rfqNo}
        </h2>

        <button
          onClick={generatePO}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Generate PO
        </button>
      </div>

      {/* TABLE */}
      <div className="border rounded bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          {/* HEADER */}
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Item</th>

              {data.suppliers.map((s) => (
                <th key={s.supplierId} className="p-2 text-center">
                  <div className="space-y-1">
                    <div>{s.name}</div>

                    <button
                      onClick={() => handleSelect(s.supplierId)}
                      className={`text-xs px-2 py-1 rounded ${
                        selectedSupplier === s.supplierId
                          ? "bg-green-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {selectedSupplier === s.supplierId
                        ? "Selected"
                        : "Select"}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {data.items.map((item) => (
              <tr key={item.itemId} className="border-t">
                {/* ITEM INFO */}
                <td className="p-2">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.quantity} {item.unit}
                  </div>
                  {item.lastPurchaseRate && (
                    <div className="text-xs text-gray-400">
                      Last: ₹{item.lastPurchaseRate}
                    </div>
                  )}
                </td>

                {/* SUPPLIER RATES */}
                {data.suppliers.map((s) => {
                  const rateObj = getRate(s, item.itemId);

                  if (!rateObj) return <td key={s.supplierId}></td>;

                  const isBest = rateObj.rate === bestRates[item.itemId];

                  return (
                    <td
                      key={s.supplierId}
                      className={`p-2 text-center ${
                        isBest ? "bg-green-50" : ""
                      }`}
                    >
                      <div className="font-medium">₹ {rateObj.rate}</div>

                      {/* VARIANCE */}
                      {item.lastPurchaseRate && (
                        <div
                          className={`text-xs ${
                            rateObj.variance > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {rateObj.variance > 0 ? "+" : ""}
                          {rateObj.variance}
                        </div>
                      )}

                      {/* BEST TAG */}
                      {isBest && (
                        <div className="text-[10px] text-green-700">Best</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE FALLBACK */}
      <div className="md:hidden space-y-3">
        {data.suppliers.map((s) => (
          <div key={s.supplierId} className="border p-3 rounded bg-white">
            <div className="flex justify-between">
              <span>{s.name}</span>
              <button
                onClick={() => handleSelect(s.supplierId)}
                className="text-blue-600 text-sm"
              >
                Select
              </button>
            </div>

            {data.items.map((item) => {
              const rateObj = getRate(s, item.itemId);
              if (!rateObj) return null;

              return (
                <div
                  key={item.itemId}
                  className="flex justify-between text-sm mt-1"
                >
                  <span>{item.name}</span>
                  <span>₹ {rateObj.rate}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuotationComparison;
