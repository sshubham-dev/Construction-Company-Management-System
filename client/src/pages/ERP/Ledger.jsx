import { useState, useEffect } from "react";

const Ledger = () => {
  const [ledgers, setLedgers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [formData, setFormData] = useState({ name: "", under: "", alias: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const ledgerRes = await fetch(`${API_URL}/ledgers`);
    const groupRes = await fetch(`${API_URL}/groups`);
    const costCenterRes = await fetch(`${API_URL}/costCenters`);
    setLedgers(await ledgerRes.json());
    setGroups(await groupRes.json());
    setCostCenters(await costCenterRes.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/ledgers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({ name: "", under: "", alias: "" });
    fetchData();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ledger Management</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Under"
          value={formData.under}
          onChange={(e) => setFormData({ ...formData, under: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Alias"
          value={formData.alias}
          onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <button className="bg-blue-500 text-white px-4 py-2">Add Ledger</button>
      </form>
      
      <h2 className="text-xl font-semibold">Ledgers</h2>
      <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Under</th>
            <th className="border border-gray-300 px-4 py-2">Alias</th>
          </tr>
        </thead>
        <tbody>
          {ledgers.map((ledger) => (
            <tr key={ledger._id} className="border border-gray-300">
              <td className="border border-gray-300 px-4 py-2">{ledger.name}</td>
              <td className="border border-gray-300 px-4 py-2">{ledger.under}</td>
              <td className="border border-gray-300 px-4 py-2">{ledger.alias}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Ledger;