import MainLayout from "../../layouts/MainLayout";

export default function RetrunDetail() {
  return (
    <MainLayout title="Purchase Order Detail">
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h1 className="font-semibold text-lg">Purchase Order #PO-2024-001</h1>
      </div>

      {/* Supplier Info */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <img
            src="/supplier.png"
            alt="supplier"
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-medium">BuildRight Supplies</h2>
            <p className="text-sm text-gray-500">Arjun Sharma • (555) 123-4567</p>
          </div>
        </div>
      </div>

      {/* Ordered Items */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h3 className="font-medium mb-2">Ordered Items</h3>
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left py-2">Item</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Unit</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b space-y-2">
              <td>Cement</td>
              <td className="text-center">50 bags</td>
              <td className="text-right">₹12.50</td>
              <td className="text-right">₹625.00</td>
            </tr>
            <tr className="border-b">
              <td>Rebar</td>
              <td className="text-center">100 pcs</td>
              <td className="text-right">₹8.75</td>
              <td className="text-right">₹875.00</td>
            </tr>
            <tr>
              <td>Lumber</td>
              <td className="text-center">200 ft</td>
              <td className="text-right">₹3.25</td>
              <td className="text-right">₹650.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Linked Purchase Requests */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h3 className="font-medium mb-2">Linked Purchase Requests</h3>
        <div className="flex justify-between text-sm">
          <span>PR-2024-005</span>
          <span className="font-medium">₹2,150.00</span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white shadow rounded-lg p-4 mb-20">
        <h3 className="font-medium mb-2">Details</h3>
        <div className="flex justify-between py-1 text-sm">
          <span className="text-gray-600">Delivery Date</span>
          <span>July 15, 2024</span>
        </div>
        <div className="flex justify-between py-1 text-sm">
          <span className="text-gray-600">Payment Terms</span>
          <span>Net 30</span>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed left-0 right-0 p-3 flex gap-2">
        <button className="flex-1 border rounded-lg py-2">Edit</button>
        <button className="flex-1 bg-blue-600 text-white rounded-lg py-2">
          Approve
        </button>
      </div>
    </div>
    </MainLayout>
  );
}
