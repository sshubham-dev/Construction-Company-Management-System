import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import PurchaseHeader from "./Components/purchaseInvoice/PurchaseHeader";
import PurchaseItems from "./Components/purchaseInvoice/PurchaseItems";
import PurchaseCharges from "./Components/purchaseInvoice/PurchaseCharges";
import PurchaseSummary from "./Components/purchaseInvoice/PurchaseSummary";
import PurchaseFooter from "./Components/purchaseInvoice/PurchaseFooter";

import { getPurchase } from "../../api/purchaseApi";

const PurchaseView = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(null);

  useEffect(() => {
    loadPurchase();
  }, []);

  const loadPurchase = async () => {
    try {
      setLoading(true);

      const { data } = await getPurchase(id);

      setForm(data.purchase);
    } catch (err) {
      toast.error("Unable to load purchase");
      navigate("/purchase");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <PurchaseHeader form={form} setForm={setForm} readonly />

      <PurchaseItems form={form} setForm={setForm} readonly />

      <PurchaseCharges form={form} setForm={setForm} readonly />

      <PurchaseSummary summary={form.summary} />

      <PurchaseFooter
        readonly
        status={form.status}
        onCancel={() => navigate(-1)}
        onPrint={() => window.print()}
        onVoucherCancel={() => navigate(`/purchase/${id}/cancel`)}
      />
    </div>
  );
};

export default PurchaseView;
