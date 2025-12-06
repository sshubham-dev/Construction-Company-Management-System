// export default function ProjectReport() {
//   const client = {
//     name: "Mr. Rajesh Kumar",
//     project: "Residential House Design",
//     reports: [
//       { label: "Option DWG", start: "05 Sep 2025", complete: "10 Sep 2025" },
//       { label: "Working DWG", start: "12 Sep 2025", complete: "" },
//       { label: "3D View", start: "15 Sep 2025", complete: "" },
//       { label: "Sanction Drawing", start: "", complete: "" },
//       { label: "Service DWG", start: "", complete: "" },
//     ],
//     payments: [
//       { date: "06 Sep 2025", amount: 25000, status: "Received" },
//       { date: "12 Sep 2025", amount: 15000, status: "Pending" },
//     ],
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-bold text-gray-800">
//           Project Report – {client.name}
//         </h1>
//         <p className="text-gray-500">{client.project}</p>
//       </div>

//       {/* Work Progress Section */}
//       <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
//         <h2 className="text-lg font-semibold text-gray-700">Work Progress</h2>
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {client.reports.map((task, index) => (
//             <div
//               key={index}
//               className="p-3 rounded-xl border bg-gray-50 hover:bg-gray-100 transition"
//             >
//               <div className="flex justify-between items-center">
//                 <span className="font-medium">{task.label}</span>
//                 {task.complete ? (
//                   <CheckCircle className="text-green-500" size={18} />
//                 ) : (
//                   <Clock className="text-yellow-500" size={18} />
//                 )}
//               </div>
//               <div className="text-xs text-gray-600 mt-1">
//                 Start:{" "}
//                 {task.start ? task.start : <span className="text-gray-400">—</span>}
//               </div>
//               <div className="text-xs text-gray-600">
//                 Complete:{" "}
//                 {task.complete ? task.complete : <span className="text-gray-400">—</span>}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Payment Section */}
//       <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
//         <h2 className="text-lg font-semibold text-gray-700">Payments</h2>
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse text-sm">
//             <thead>
//               <tr className="bg-gray-100 text-gray-700 text-left">
//                 <th className="px-3 py-2">Date</th>
//                 <th className="px-3 py-2">Amount</th>
//                 <th className="px-3 py-2">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {client.payments.map((p, i) => (
//                 <tr key={i} className="border-b hover:bg-gray-50 transition">
//                   <td className="px-3 py-2">{p.date}</td>
//                   <td className="px-3 py-2 flex items-center gap-1">
//                     <IndianRupee size={14} />
//                     {p.amount}
//                   </td>
//                   <td className="px-3 py-2">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         p.status === "Received"
//                           ? "bg-green-100 text-green-700"
//                           : "bg-yellow-100 text-yellow-700"
//                       }`}
//                     >
//                       {p.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

import moment from "moment";

export default function ProjectReport() {
  const report = {
    clientName: "Mr. Sharma",
    projectId: "PRJ-1023",
    workItems: [
      {
        name: "Option DWG",
        startDate: "2025-09-01",
        completeDate: "2025-09-05",
        corrections: [
          {
            correctionNo: 1,
            startDate: "2025-09-06",
            completeDate: "2025-09-07",
            remarks: "Client requested window size change",
          },
          {
            correctionNo: 2,
            startDate: "2025-09-08",
            completeDate: "2025-09-09",
          },
        ],
      },
      {
        name: "Working DWG",
        startDate: "2025-09-10",
        completeDate: "2025-09-15",
        corrections: [],
      },
    ],
    payments: [
      { amount: 50000, date: "2025-09-05", status: "Received", mode: "UPI" },
      { amount: 30000, date: "2025-09-15", status: "Pending", mode: "Bank" },
    ],
    totalAmount: 100000,
    balance: 20000,
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold text-gray-800">{report.clientName}</h2>
        <p className="text-gray-500">Project ID: {report.projectId}</p>
        <div className="mt-3 grid grid-cols-3 text-sm font-medium text-gray-700">
          <span>Total: ₹{report.totalAmount}</span>
          <span>
            Received: ₹
            {report.payments
              .filter((p) => p.status === "Received")
              .reduce((sum, p) => sum + p.amount, 0)}
          </span>
          <span className="text-red-600">Balance: ₹{report.balance}</span>
        </div>
      </div>

      {/* Work Progress */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-gray-800">Work Progress</h3>
        <div className="space-y-4">
          {report.workItems.map((item, idx) => (
            <div key={idx} className="border-l-4 pl-3 border-blue-400">
              <div className="flex justify-between">
                <h4 className="font-medium">{item.name}</h4>
                <span className="text-xs text-green-600">
                  Completed: {moment(item.completeDate).format("DD MMM YYYY")}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Started: {moment(item.startDate).format("DD MMM YYYY")}
              </p>

              {item.corrections.length > 0 && (
                <div className="mt-2 ml-4 text-sm">
                  <p className="font-medium text-yellow-600">Corrections:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    {item.corrections.map((c, i) => (
                      <li key={i}>
                        Correction {c.correctionNo}:{" "}
                        {moment(c.startDate).format("DD MMM")} →{" "}
                        {moment(c.completeDate).format("DD MMM")}{" "}
                        <span className="text-gray-500 italic">
                          {c.remarks}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payments */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-gray-800">Payments</h3>
        <div className="space-y-3">
          {report.payments.map((p, i) => (
            <div
              key={i}
              className={`flex justify-between items-center p-3 rounded-md border ${
                p.status === "Received"
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div>
                <p className="font-medium">
                  ₹{p.amount} – {p.mode}
                </p>
                <p className="text-xs text-gray-500">
                  {moment(p.date).format("DD MMM YYYY")}
                </p>
              </div>
              <span
                className={`text-sm px-2 py-1 rounded ${
                  p.status === "Received"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

