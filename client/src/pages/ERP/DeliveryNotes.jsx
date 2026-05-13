import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import CreateDeliveryNote from "../../components/CreateDeliveryNote";
import ConfirmDeliveryNote from "../../components/ConfirmDeliveryNote";
import { useSelector } from "react-redux";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import toast from "react-hot-toast";

const DeliveryNote = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchDN();
  }, []);

  const fetchDN = async () => {
    try {
      const res = await axios.get("/api/v1/delivery-note");
      setData(res.data || []);
    } catch {
      toast.error("Failed to load DN");
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((d) => {
    return (
      d.dnNumber?.toLowerCase().includes(search.toLowerCase()) &&
      (status ? d.status === status : true)
    );
  });

  const statusColor = (s) => {
    switch (s) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700";
      case "ISSUED":
        return "bg-blue-100 text-blue-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-3 space-y-4 pb-24">

      {/* FILTER */}
      <div className="flex gap-2">
        <input
          placeholder="Search DN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <select
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="ISSUED">Issued</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* LIST */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        filtered.map((d) => (
          <div
            key={d._id}
            onClick={() => navigate(`/erp/dn/${d._id}`)}
            className="border rounded-lg p-3 bg-white shadow-sm space-y-2 cursor-pointer"
          >
            <div className="flex justify-between">
              <span className="font-medium">{d.dnNumber}</span>

              <span className={`text-xs px-2 py-1 rounded ${statusColor(d.status)}`}>
                {d.status}
              </span>
            </div>

            <div className="text-sm text-gray-600">
              {d.store?.name} → {d.site?.name}
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>{moment(d.date).format("DD MMM")}</span>
              <span>{d.items?.length} items</span>
            </div>
          </div>
        ))
      )}

      {/* FLOAT BTN */}
      <button
        onClick={() => navigate("/erp/dn/create")}
        className="fixed bottom-5 right-5 bg-green-600 text-white w-14 h-14 rounded-full text-xl shadow-lg"
      >
        +
      </button>
    </div>
  );
};

export default DeliveryNote;
