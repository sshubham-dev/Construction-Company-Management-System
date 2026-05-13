import { useEffect, useState } from "react";
import axios from "axios";

const PublicQuotationPage = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [rfq, setRfq] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadRFQ();
  }, []);

  const loadRFQ = async () => {
    const res = await axios.get(`/api/v1/rfq/public/${token}`);
    setRfq(res.data);

    setItems(
      res.data.items.map((i) => ({
        itemId: i.itemId._id,
        name: i.itemId.name,
        quantity: i.quantity,
        rate: "",
      }))
    );
  };

  const handleChange = (index, value) => {
    const updated = [...items];
    updated[index].rate = value;
    setItems(updated);
  };

  const submitQuote = async () => {
    await axios.post("/api/v1/rfq/quotation", {
      accessToken: token,
      items,
    });

    alert("Quotation submitted");
  };

  if (!rfq) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">

      <h2 className="text-lg font-semibold">
        Submit Quotation
      </h2>

      {items.map((i, idx) => (
        <div key={idx} className="border p-3 rounded space-y-2">
          <div className="text-sm">{i.name}</div>
          <div className="text-xs text-gray-500">
            Qty: {i.quantity}
          </div>

          <input
            type="number"
            placeholder="Rate"
            value={i.rate}
            onChange={(e) =>
              handleChange(idx, e.target.value)
            }
            className="border p-2 w-full rounded"
          />
        </div>
      ))}

      <button
        onClick={submitQuote}
        className="bg-green-600 text-white w-full py-2 rounded"
      >
        Submit Quotation
      </button>
    </div>
  );
};

export default PublicQuotationPage;