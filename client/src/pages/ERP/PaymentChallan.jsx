import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PaymentChallan = () => {
  const [challans, setChallans] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const fetchChallans = async () => {
    const res = await axios.get("/api/v1/payment-challans");
    setChallans(res.data.challans);
    console.log(res.data.challans);
  };

  useEffect(() => {
    fetchChallans();
  }, [status]);

  const filtered = challans.filter((c) => {
    return (
      c.challanNo.toLowerCase().includes(search.toLowerCase()) ||
      c.items.some((i) =>
        i.partyName.toLowerCase().includes(search.toLowerCase()),
      )
    );
  });

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Payment Challans</h2>

        <Link
          to="/erp/payment-challan/create"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create Challan
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search challan / party"
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_APPROVAL">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-auto">
        <table className="w-full border">
          <thead className="bg-gray-100 text-left">
            <tr className="bg-gray-100">
              <th className="p-2">Challan No</th>
              <th className="p-2">Date</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-2">{c.challanNo}</td>
                <td className="p-2">{c.createdAt}</td>
                <td className="p-2">₹{c.totalApprovedAmount}</td>
                <td className="p-2">{c.status}</td>
                <td className="flex gap-3 p-2">
                  <Link
                    to={`/erp/payment-challan/${c._id}`}
                    className="text-blue-600"
                  >
                    View
                  </Link>
                  <button className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map((c) => (
          <div key={c._id} className="border p-3 rounded shadow">
            <div className="flex justify-between">
              <span className="font-semibold">{c.challanNo}</span>
              <span className="text-sm">{c.status}</span>
            </div>

            <div className="text-sm text-gray-600">
              {new Date(c.createdAt).toLocaleDateString()}
            </div>

            <div className="mt-2 font-medium">₹{c.totalApprovedAmount}</div>
            <Link
              to={`/erp/payment-challan/${c._id}`}
              className="mt-2 text-blue-600"
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentChallan;
