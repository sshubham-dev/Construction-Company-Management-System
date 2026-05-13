import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Stock = () => {
  const [summary, setSummary] = useState({});
  const [valueTrend, setValueTrend] = useState([]);
  const [movement, setMovement] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [storeDist, setStoreDist] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [s, v, m, l, t, d] = await Promise.all([
        axios.get("/api/v1/stock/summary"),
        axios.get("/api/v1/stock/value-trend"),
        axios.get("/api/v1/stock/movement-trend"),
        axios.get("/api/v1/stock/low-stock"),
        axios.get("/api/v1/stock/top-consumed"),
        axios.get("/api/v1/stock/store-distribution"),
      ]);

      setSummary(s.data);
      setValueTrend(v.data);
      setMovement(m.data);
      setLowStock(l.data);
      setTopItems(t.data);
      setStoreDist(d.data);
    } catch {
      toast.error("Dashboard load failed");
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        <Card title="Items" value={summary.totalItems} />
        <Card title="Quantity" value={summary.totalQty} />
        <Card title="Stock Value" value={`₹ ${summary.totalValue}`} />
        <Card title="Low Stock" value={summary.lowStockCount} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-4">
        {/* VALUE TREND */}
        <Section title="Stock Value Trend">
          <SimpleChart data={valueTrend} dataKey="value" />
        </Section>

        {/* MOVEMENT */}
        <Section title="Stock Movement">
          <SimpleDualChart data={movement} />
        </Section>
      </div>

      {/* ALERTS */}
      <Section title="Low Stock Alerts">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.map((i) => (
              <tr key={i._id}>
                <td>{i.name}</td>
                <td className="text-red-600">{i.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* TOP ITEMS */}
      <Section title="Top Consumed Items">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Item</th>
              <th>Consumed</th>
            </tr>
          </thead>
          <tbody>
            {topItems.map((i) => (
              <tr key={i._id}>
                <td>{i.name}</td>
                <td>{i.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* STORE DISTRIBUTION */}
      <Section title="Stock by Store">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Store</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {storeDist.map((s) => (
              <tr key={s._id}>
                <td>{s.storeName}</td>
                <td>₹ {s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
};

export default Stock;

/* COMPONENTS */

const Card = ({ title, value }) => (
  <div className="border p-4 rounded bg-white">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-lg font-semibold">{value || 0}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="border rounded p-4 bg-white space-y-3">
    <p className="text-sm font-medium">{title}</p>
    {children}
  </div>
);

/* SIMPLE CHARTS */

const SimpleChart = ({ data, dataKey }) => (
  <div className="h-40 flex items-end gap-2">
    {data.map((d, i) => (
      <div
        key={i}
        className="bg-blue-500 w-6"
        style={{ height: `${d[dataKey] / 10000}px` }}
      />
    ))}
  </div>
);

const SimpleDualChart = ({ data }) => (
  <div className="h-40 flex items-end gap-2">
    {data.map((d, i) => (
      <div key={i} className="flex flex-col gap-1">
        <div className="bg-green-500 w-4" style={{ height: `${d.in}px` }} />
        <div className="bg-red-500 w-4" style={{ height: `${d.out}px` }} />
      </div>
    ))}
  </div>
);
