import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-hot-toast";

const CreateRFQ = ({ prId, onClose }) => {
  const [pr, setPr] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prRes, supRes] = await Promise.all([
        axios.get(`/api/v1/purchase-request/${prId}`),
        axios.get(`/api/v1/ledger?supplier=true`),
      ]);

      setPr(prRes.data);
      setSuppliers(
        supRes.data.map((s) => ({
          value: s._id,
          label: s.name,
        }))
      );
    } catch {
      toast.error("Failed to load data");
    }
  };

  const handleCreate = async () => {
    if (!selectedSuppliers.length)
      return toast.error("Select suppliers");

    await axios.post("/api/v1/rfq", {
      purchaseRequestId: prId,
      suppliers: selectedSuppliers.map((s) => s.value),
    });

    toast.success("RFQ created");
    onClose();
  };

  if (!pr) return <div>Loading...</div>;

  return (
    <div className="space-y-4">

      <h2 className="font-semibold">Create RFQ</h2>

      {/* PR ITEMS */}
      <div className="border p-3 rounded bg-white text-sm">
        {pr.items.map((i) => (
          <div key={i._id} className="flex justify-between">
            <span>{i.itemId.name}</span>
            <span>{i.requestedQty} {i.unit}</span>
          </div>
        ))}
      </div>

      {/* SUPPLIERS */}
      <Select
        isMulti
        options={suppliers}
        onChange={setSelectedSuppliers}
        placeholder="Select Suppliers"
      />

      <button
        onClick={handleCreate}
        className="bg-blue-600 text-white w-full py-2 rounded"
      >
        Create RFQ
      </button>
    </div>
  );
};

export default CreateRFQ;