import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PayChallanScreen = () => {
  const [challan, setChallan] = useState(null);
  const { id } = useParams();

  console.log(id);
  useEffect(() => {
    console.log(id);
    const fetchData = async () => {
      const res = await axios.get(`/api/v1/payment-challans/${id}`);
      setChallan(res.data.challan);
    };
    fetchData();
  }, [id]);

  if (!challan) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">{challan.challanNo}</h2>

      <div className="mb-4">
        <p>Status: {challan.status}</p>
        <p>Total: ₹{challan.totalApprovedAmount}</p>
      </div>

      {/* Items */}
      <div className="border rounded">
        {challan.items.map((item) => (
          <div key={item._id} className="border-b p-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{item.partyName}</p>
                <p className="text-sm">{item.purpose}</p>
              </div>

              <div className="text-right">
                <p>₹{item.approvedAmount}</p>
                <p className="text-sm">{item.status}</p>
              </div>
            </div>

            {/* Pay button */}
            {item.status !== "PAID" && (
              <button className="mt-2 text-green-600">Mark Paid</button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <button className="bg-green-600 text-white px-3 py-2 rounded">
          Approve
        </button>
        <button className="bg-red-600 text-white px-3 py-2 rounded">
          Reject
        </button>
      </div>
    </div>
  );
};

export default PayChallanScreen;
