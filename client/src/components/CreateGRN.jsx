import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

const CreateGRN = ({ onClose, editId = null }) => {
  const isEdit = Boolean(editId);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [store, setStore] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [poList, setPoList] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);

  const [grn, setGrn] = useState(null);
  const [items, setItems] = useState([]);

  /* ============================
     LOAD LOGGED-IN USER STORE
  ============================ */
  useEffect(() => {
    // const fetchStore = async () => {
    //   const res = await axios.get("/api/v1/store");
    //   console.log(res.data)
    //   setStore(res.data[0]);
    // }
    // fetchStore();
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const [sup, store] = await Promise.all([
        axios.get("/api/v1/supplier"),
        axios.get("/api/v1/store"),
        // axios.get("/api/v1/site"),
      ]);

      setSuppliers(sup.data);
      setStore(store.data[0]);
      // setSites(site.data);
    } catch {
      toast.error("Failed to load master data");
    }
  };

  /* ============================
     LOAD EXISTING GRN (EDIT)
  ============================ */
  useEffect(() => {
    if (!editId) return;

    const loadGRN = async () => {
      const res = await axios.get(`/api/v1/grn/${editId}`);
      const data = res.data;

      setGrn(data);
      setStore(data.storeId);
      setSupplier({
        value: data.supplierId._id,
        label: data.supplierId.name,
      });
      setSelectedPO(data.purchaseOrderId);

      setItems(
        data.items.map((i) => ({
          stockId: i.stockId._id || i.stockId,
          stockName: i.stockId.name,
          description: i.description,
          orderedQty: i.orderedQty,
          receivedQty: i.receivedQty,
          acceptedQty: i.acceptedQty,
          rejectedQty: i.rejectedQty,
          rate: i.rate,
          amount: i.amount,
          remarks: i.remarks || "",
        })),
      );

      setStep(2);
    };

    loadGRN();
  }, [editId]);

  const isEditable = !grn || grn.status === "Draft";

  /* ============================
     FETCH OPEN PURCHASE ORDERS
  ============================ */
  const fetchPOs = async (supplierId) => {
    const res = await axios.get(
      `/api/v1/purchase-order/open?store=${store._id}&supplier=${supplierId}`,
    );
    console.log(res.data)
    setPoList(res.data);
  };

  /* ============================
     SELECT PO → LOAD ITEMS
  ============================ */
  const selectPO = (po) => {
    setSelectedPO(po);

    setItems(
      po.items.map((i) => ({
        stockId: i.stockId._id || i.stockId,
        stockName: i.stockName,
        description: i.description,
        orderedQty: i.orderedQty,
        receivedQty: i.pendingQty,
        acceptedQty: i.pendingQty,
        rejectedQty: 0,
        rate: i.rate,
        amount: i.pendingQty * i.rate,
        remarks: "",
      })),
    );

    setStep(2);
  };

  /* ============================
     UPDATE ITEM FIELD
  ============================ */
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === "acceptedQty" || field === "rejectedQty") {
      updated[index].receivedQty =
        Number(updated[index].acceptedQty || 0) +
        Number(updated[index].rejectedQty || 0);
    }

    updated[index].amount =
      Number(updated[index].acceptedQty || 0) *
      Number(updated[index].rate || 0);

    setItems(updated);
  };

  /* ============================
     CALCULATIONS
  ============================ */
  const grossAmount = items.reduce((sum, i) => sum + i.amount, 0);
  const gstAmount = grossAmount * 0.18;
  const netAmount = grossAmount + gstAmount;

  /* ============================
     SAVE / UPDATE GRN
  ============================ */
  const saveGRN = async () => {
    setLoading(true);

    const payload = {
      date: grn?.date || new Date(),
      storeId: store._id,
      supplierId: supplier.value,
      purchaseOrderId: selectedPO?._id,

      items: items.map((i) => ({
        stockId: i.stockId,
        description: i.description,
        orderedQty: i.orderedQty,
        receivedQty: i.receivedQty,
        acceptedQty: i.acceptedQty,
        rejectedQty: i.rejectedQty,
        rate: i.rate,
        amount: i.amount,
        remarks: i.remarks,
      })),

      grossAmount,
      gstAmount,
      netAmount,
      status: "Draft",
    };

    if (isEdit) {
      await axios.put(`/api/v1/grn/${editId}`, payload);
    } else {
      await axios.post("/api/v1/grn", payload);
    }

    setLoading(false);
    onClose();
  };

  /* ============================
     UI
  ============================ */
  return (
    <div className=" max-w-xl mx-auto space-y-4">
      {/* STEP 1 */}
      {step === 1 && (
        <>
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit GRN" : "Create GRN"}
          </h2>

          <input
            value={store?.name || ""}
            disabled
            className="border p-2 w-full bg-gray-100"
          />

          <Select
            placeholder="Select Supplier"
            isDisabled={isEdit}
            value={supplier}
            onChange={(v) => {
              setSupplier(v);
              fetchPOs(v.value);
            }}
            options={suppliers.map((s) => ({
              value: s._id,
              label: s.name,
            }))}
          />

          <Select
            placeholder="Select Purchase Order"
            isDisabled={isEdit}
            options={poList.map((po) => ({
              label: po.poDate,
              value: po,
            }))}
            onChange={(v) => selectPO(v.value)}
          />
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <h3 className="font-medium">Received Items</h3>

          {items.map((item, i) => (
            <div key={i} className="border p-3 rounded mb-2">
              <p className="font-medium">{item.stockName}</p>
              <p className="text-xs text-gray-500">
                Ordered: {item.orderedQty}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="number"
                  disabled={!isEditable}
                  value={item.acceptedQty}
                  onChange={(e) =>
                    updateItem(i, "acceptedQty", Number(e.target.value))
                  }
                  className="border p-1"
                  placeholder="Accepted"
                />

                <input
                  type="number"
                  disabled={!isEditable}
                  value={item.rejectedQty}
                  onChange={(e) =>
                    updateItem(i, "rejectedQty", Number(e.target.value))
                  }
                  className="border p-1"
                  placeholder="Rejected"
                />
              </div>

              <input
                disabled={!isEditable}
                value={item.remarks}
                onChange={(e) => updateItem(i, "remarks", e.target.value)}
                className="border p-1 w-full mt-2"
                placeholder="Remarks"
              />
            </div>
          ))}

          <div className="border p-3 rounded bg-gray-50">
            <p className="text-sm">Gross: ₹{grossAmount.toFixed(2)}</p>
            <p className="text-sm">GST: ₹{gstAmount.toFixed(2)}</p>
            <p className="font-medium">Net: ₹{netAmount.toFixed(2)}</p>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setStep(1)}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Back
            </button>

            <button
              disabled={loading || !isEditable}
              onClick={saveGRN}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              {loading ? "Saving..." : isEdit ? "Update GRN" : "Save GRN"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateGRN;
