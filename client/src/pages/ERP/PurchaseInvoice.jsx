import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PurchaseCard from "./Components/purchaseInvoice/PurchaseCard";
import PurchaseTable from "./Components/purchaseInvoice/PurchaseTable";
import PurchaseFilters from "./Components/purchaseInvoice/PurchaseFilters";
import PurchaseSkeleton from "./Components/purchaseInvoice/PurchaseSkeleton";
import EmptyState from "./Components/purchaseInvoice/EmptyState";
import { useSelector } from "react-redux";

import { getPurchases } from "../../api/purchaseApi";

const PurchaseInvoice = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  const [purchases, setPurchases] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    costCenterId: "",
  });

  useEffect(() => {
    fetchPurchases();
  }, [pagination.page, filters]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get("/api/v1/purchase-invoice", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          companyId: user?.companyId,
          ...filters,
        },
      });
      console.log(data)

      setPurchases(data.data.purchases || []);

      setPagination((prev) => ({
        ...prev,
        total: data.total,
        pages: data.pages,
      }));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}

      <div className="sticky top-0 z-20 max-w-8xl ">
        <div className="mx-auto flex max-w-7xl items-center justify-between bg-white p-5 rounded-lg">
          <div>
            <h1 className="text-xl font-bold">Purchase Invoice</h1>

            <p className="text-sm text-gray-500">
              Manage all purchase invoices
            </p>
          </div>

          {/* Desktop */}

          <button
            onClick={() => navigate("/erp/purchase-form/create")}
            className="hidden items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 md:flex"
          >
            <Plus size={18} />
            New Purchase
          </button>
        </div>
      </div>

      {/* Filters */}

      <div className="mx-auto max-w-7xl p-4">
        <PurchaseFilters
          filters={filters}
          setFilters={setFilters}
          refresh={fetchPurchases}
        />
      </div>

      {/* Content */}

      <div className="mx-auto max-w-7xl px-4 pb-28">
        {loading ? (
          <PurchaseSkeleton />
        ) : purchases?.length === 0 ? (
          <EmptyState
            title="No Purchase Found"
            subtitle="Create your first purchase invoice."
            buttonText="Create Purchase"
            onClick={() => navigate("/erp/purchase-form/create")}
          />
        ) : (
          <>
            {/* Mobile */}

            <div className="space-y-4 md:hidden">
              {purchases.map((purchase) => (
                <PurchaseCard
                  key={purchase._id}
                  purchase={purchase}
                  refresh={fetchPurchases}
                />
              ))}
            </div>

            {/* Desktop */}

            <div className="hidden md:block">
              <PurchaseTable purchases={purchases} refresh={fetchPurchases} />
            </div>
          </>
        )}
      </div>

      {/* Pagination */}

      {!loading && pagination.pages > 1 && (
        <div className="border-t bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
            <button
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page - 1,
                }))
              }
              className="rounded border px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              disabled={pagination.page === pagination.pages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
              className="rounded border px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button */}

      <button
        onClick={() => navigate("/purchase/create")}
        className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:scale-105 md:hidden"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default PurchaseInvoice;
