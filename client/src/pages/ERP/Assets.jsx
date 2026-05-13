import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Filter,
  Wrench,
  RotateCcw,
  Pencil,
  Eye,
} from "lucide-react";
import Modal from "../../components/Modal";
import CreateAssets from "./Components/CreateAssets";

axios.defaults.withCredentials = true;

const Assets = () => {
  const [assets, setAssets] = useState([]);

  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [storeFilter, setStoreFilter] = useState("");

  const [itemFilter, setItemFilter] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [editId, setEditId] = useState(null);

  /* =========================
     LOAD DATA
  ========================== */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [itemsRes, storesRes, assetsRes] = await Promise.all([
          axios.get("/api/v1/stock-item"),
          axios.get("/api/v1/store"),
          axios.get("/api/v1/assets"),
      ]);
      console.log(itemsRes)

      setAssets(assetsRes.data.data || []);

      setStores(storesRes.data || []);

      const assetItems = (itemsRes.data.data || []).filter(
        (i) => i.itemType === "ASSET",
      );

      setItems(
        assetItems.map((i) => ({
          value: i._id,
          label: i.name,
        })),
      );

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    setCreateModal(true);
    setEditId(id);
  };

  const handleView = (data) => {};
  const handleIssue = (id) => {};
  const handleDelete = (data) => {};

  /* =========================
     FILTERED DATA
  ========================== */

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        asset.name?.toLowerCase().includes(searchText) ||
        asset.assetCode?.toLowerCase().includes(searchText) ||
        asset.serialNo?.toLowerCase().includes(searchText) ||
        asset.itemId?.name?.toLowerCase().includes(searchText);

      const matchesStatus = statusFilter ? asset.status === statusFilter : true;

      const matchesStore = storeFilter
        ? asset.storeId?._id === storeFilter
        : true;

      const matchesItem = itemFilter ? asset.itemId?._id === itemFilter : true;

      return matchesSearch && matchesStatus && matchesStore && matchesItem;
    });
  }, [assets, search, statusFilter, storeFilter, itemFilter]);

  /* =========================
     KPIs
  ========================== */

  const stats = useMemo(() => {
    return {
      total: assets.length,

      available: assets.filter((a) => a.status === "AVAILABLE").length,

      issued: assets.filter((a) => a.status === "ISSUED").length,

      maintenance: assets.filter((a) => a.status === "MAINTENANCE").length,

      scrap: assets.filter((a) => a.status === "SCRAP").length,
    };
  }, [assets]);

  /* =========================
     UI
  ========================== */

  return (
    <div className="p-4 space-y-5">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Asset Management</h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage issued, available and maintenance assets
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center"
        >
          <Plus size={18} />
          New Asset
        </button>
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI title="Total" value={stats.total} />

        <KPI title="Available" value={stats.available} />

        <KPI title="Issued" value={stats.issued} />

        <KPI title="Maintenance" value={stats.maintenance} />

        <KPI title="Scrap" value={stats.scrap} />
      </div>

      {/* FILTERS */}

      <div className="bg-white border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Filter size={16} />

          <p className="font-medium text-sm">Filters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* SEARCH */}

          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Status</option>

            <option value="AVAILABLE">Available</option>

            <option value="ISSUED">Issued</option>

            <option value="MAINTENANCE">Maintenance</option>

            <option value="SCRAP">Scrap</option>
          </select>

          {/* STORE */}

          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Stores</option>

            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* ITEM */}

          <select
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Items</option>

            {items.map((i) => (
              <option key={i._id} value={i._id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white border rounded-xl overflow-hidden">
        {/* DESKTOP */}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <TH>Asset Code</TH>
                <TH>Name</TH>
                <TH>Item</TH>
                <TH>Store</TH>
                <TH>Status</TH>
                <TH>Serial No</TH>
                <TH>Condition</TH>
                <TH>Assigned</TH>
                <TH>Actions</TH>
              </tr>
            </thead>

            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset._id} className="border-b hover:bg-gray-50">
                  <TD>{asset.assetCode}</TD>

                  <TD>{asset.name}</TD>

                  <TD>{asset.itemId?.name}</TD>

                  <TD>{asset.storeId?.name}</TD>

                  <TD>
                    <StatusBadge status={asset.status} />
                  </TD>

                  <TD>{asset.serialNo || "-"}</TD>

                  <TD>{asset.condition || "-"}</TD>

                  <TD>{asset.assignedTo?.name || "-"}</TD>

                  <TD>
                    <div className="flex items-center gap-2">
                      <ActionButton
                        handle={() => handleView(asset)}
                        icon={<Eye size={15} />}
                      />

                      <ActionButton
                        handle={() => handleEdit(asset._id)}
                        icon={<Pencil size={15} />}
                      />

                      <ActionButton icon={<RotateCcw size={15} />} />

                      <ActionButton icon={<Wrench size={15} />} />
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE */}

        <div className="md:hidden divide-y">
          {filteredAssets.map((asset) => (
            <div key={asset._id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{asset.name}</p>

                  <p className="text-xs text-gray-500">{asset.assetCode}</p>
                </div>

                <StatusBadge status={asset.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <MiniField label="Store" value={asset.storeId?.name} />

                <MiniField label="Item" value={asset.itemId?.name} />

                <MiniField label="Serial" value={asset.serialNo || "-"} />

                <MiniField label="Condition" value={asset.condition || "-"} />
              </div>

              <div className="flex gap-2 pt-1">
                <MobileBtn handle={() => handleView(asset)} text="View" />
                <MobileBtn handle={() => handleEdit(asset._id)} text="Edit" />
                <MobileBtn handle={() => handleIssue(asset._id)} text="Issue" />
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY */}

        {!loading && filteredAssets.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-500">
            No assets found
          </div>
        )}
      </div>

      <Modal onClose={() => setCreateModal(false)} isOpen={createModal}>
        <CreateAssets onClose={() => setCreateModal(false)} editId={editId} />
      </Modal>
    </div>
  );
};

export default Assets;

/* =========================
   HELPERS
========================= */

const KPI = ({ title, value }) => (
  <div className="bg-white border rounded-xl p-4">
    <p className="text-xs text-gray-500">{title}</p>

    <h2 className="text-xl font-bold mt-1">{value}</h2>
  </div>
);

const TH = ({ children }) => (
  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
    {children}
  </th>
);

const TD = ({ children }) => <td className="px-4 py-3">{children}</td>;

const StatusBadge = ({ status }) => {
  const styles = {
    AVAILABLE: "bg-green-100 text-green-700",

    ISSUED: "bg-blue-100 text-blue-700",

    MAINTENANCE: "bg-yellow-100 text-yellow-700",

    SCRAP: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const ActionButton = ({ icon, handle }) => (
  <button onClick={handle} className="border rounded-lg p-2 hover:bg-gray-100">
    {icon}
  </button>
);

const MobileBtn = ({ text }) => (
  <button className="border rounded-lg px-3 py-1 text-xs">{text}</button>
);

const MiniField = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>

    <p className="font-medium">{value}</p>
  </div>
);
