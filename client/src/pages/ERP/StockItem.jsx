import React, { useState, useMemo, useEffect } from "react";
import Header from "../../components/Header";
import { FaFilter } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import { MdDeleteForever } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import CreateStockItem from "./Components/CreateStockItem";

const StockItem = () => {
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({
    groupId: "",
    categoryId: "",
    stockStatus: "",
  });

  const [drawer, setDrawer] = useState(false);
  const [editId, setEditId] = useState(null);

  /* =========================
     FETCH DATA
  ========================== */
  const fetchData = async () => {
    try {
      const [itemRes, groupRes, catRes] = await Promise.all([
        axios.get("/api/v1/stock-item"),
        axios.get("/api/v1/stock-group"),
        axios.get("/api/v1/stock-category"),
      ]);
      console.log(itemRes.data.data);

      setItems(Array.isArray(itemRes.data.data) ? itemRes.data.data : []);
      setGroups(groupRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch {
      // toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =========================
     STOCK CALCULATION
  ========================== */
  const getTotalStock = (item) => {
    return item.stocks?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;
  };

  const getStockStatus = (qty) => {
    if (qty === 0) return "OUT";
    if (qty < 10) return "LOW";
    return "OK";
  };

  /* =========================
     FILTER
  ========================== */
  const filtered = useMemo(() => {
    return Array.isArray(items)
      ? items.filter((i) => {
          const qty = getTotalStock(i);

          return (
            i.name.toLowerCase().includes(search.toLowerCase()) &&
            (filter.groupId ? i.groupId?._id === filter.groupId : true) &&
            (filter.categoryId
              ? i.categoryId?._id === filter.categoryId
              : true) &&
            (filter.stockStatus
              ? getStockStatus(qty) === filter.stockStatus
              : true)
          );
        })
      : [];
  }, [items, search, filter]);

  /* =========================
     DELETE
  ========================== */
  const handleDelete = async (id) => {
    if (!confirm("Delete item?")) return;

    await axios.delete(`/api/v1/stock-item/${id}`);
    fetchData();
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Stock Items</h2>

        <button
          onClick={() => {
            setEditId(null);
            setDrawer(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create Item
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">
        <input
          placeholder="Search item..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          onChange={(e) =>
            setFilter((p) => ({ ...p, groupId: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) =>
            setFilter((p) => ({ ...p, categoryId: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) =>
            setFilter((p) => ({ ...p, stockStatus: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">Stock Status</option>
          <option value="OK">In Stock</option>
          <option value="LOW">Low</option>
          <option value="OUT">Out</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="border rounded bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Item</th>
              <th className="p-2">Group</th>
              <th className="p-2">Category</th>
              <th className="p-2">Unit</th>
              <th className="p-2">Purchase</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              filtered.map((i) => {
                const qty = getTotalStock(i);
                const status = getStockStatus(qty);

                return (
                  <tr key={i._id} className="border-t">
                    <td className="p-2">{i.name}</td>
                    <td className="p-2">{i.groupId?.name}</td>
                    <td className="p-2">{i.categoryId?.name}</td>
                    <td className="p-2">{i.unit}</td>
                    <td className="p-2">₹ {i.defaultPurchaseRate}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          status === "OK"
                            ? "bg-green-100 text-green-700"
                            : status === "LOW"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="p-2 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditId(i._id);
                          setDrawer(true);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(i._id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* DRAWER */}
      {drawer && (
        <Modal
          onClose={() => {
            setDrawer(false);
            fetchData();
          }}
          isOpen={drawer}
        >
          <CreateStockItem
            editId={editId}
            onClose={() => {
              setDrawer(false);
              fetchData();
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default StockItem;
