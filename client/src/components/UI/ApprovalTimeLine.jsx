const ApprovalTimeLine = ({ item, module }) => {
  const approvalConfig = {
    projectSchedule: [
      { label: "Admin", key: "adminApprove" },
      { label: "Client", key: "clientApprove" },
    ],

    purchaseRequest: [
      { label: "In-Charge", key: "inchargeApprove" },
      { label: "Account Head", key: "accountheadApprove" },
      { label: "Admin", key: "adminApprove" },
      { label: "Store", key: "storeApprove" },
    ],

    purchaseOrder: [
      { label: "Account Head", key: "accountheadApprove" },
      { label: "Admin", key: "adminApprove" },
      { label: "Supplier", key: "supplierApprove" },
    ],

    workOrder: [
      { label: "In-Charge", key: "inchargeApprove" },
      { label: "Account Head", key: "accountheadApprove" },
      { label: "Contractor", key: "contractorApprove" },
      { label: "Admin", key: "adminApprove" },
    ],

    bill: [
      { label: "In-Charge", key: "inchargeApprove" },
      { label: "Contractor", key: "contractorApprove" },
      { label: "Account Head", key: "accountheadApprove" },
      { label: "Admin", key: "adminApprove" },
    ],

    return: [
      { label: "In-Charge", key: "inchargeApprove" },
      { label: "Store", key: "storeApprove" },
    ],

    paymentSchedule: [
      { label: "Admin", key: "adminApprove" },
      { label: "Client", key: "clientApprove" },
    ],

    qualitySchedule: [
      { label: "In-Charge", key: "inchargeApprove" },
      { label: "Quality", key: "qualityApprove" },
    ],

    clientExtraWork: [
      { label: "Admin", key: "adminApprove" },
      { label: "Client", key: "clientApprove" },
    ],
    contractorExtraWork: [
      { label: "Admin", key: "adminApprove" },
      { label: "Contractor", key: "contractorApprove" },
    ],
  };

  const steps = approvalConfig[module] || [];

  return (
    <div className="w-full flex justify-center mt-4 mb-8">
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide pt-2">
        {steps.map((step, idx) => {
          const status = item?.[step.key];
          const isCompleted = status === "Approved";
          const isRejected = status === "Rejected";
          const isActive =
            status === "Pending" &&
            steps.slice(0, idx).every((s) => item?.[s.key] === "Approved");

          let dotColor = "bg-gray-400";
          let icon = "⏳";

          if (isCompleted) {
            dotColor = "bg-green-600";
            icon = "✓";
          } else if (isActive) {
            dotColor = "bg-blue-600";
            icon = "•";
          } else if (isRejected) {
            dotColor = "bg-red-600";
            icon = "✗";
          }

          const dotAnimation = isActive ? "animate-pulse scale-105" : "";
          const lineColor = isCompleted
            ? "bg-green-600"
            : isRejected
            ? "bg-red-600"
            : "bg-gray-300";

          return (
            <div key={idx} className="flex items-center min-w-fit scrollbar-hide">
              <div className="flex flex-col items-center scrollbar-hide">
                <div
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full
                  flex items-center justify-center text-white text-sm
                  font-semibold transition-all duration-300 ${dotColor} ${dotAnimation}`}
                >
                  {icon}
                </div>
                <p className="text-[9px] sm:text-xs mt-1 sm:mt-2 font-medium text-center px-1 whitespace-nowrap">
                  {step.label}
                </p>
              </div>

              {idx !== steps.length - 1 && (
                <div
                  className={`h-[2px] sm:h-1 w-8 sm:w-20 mx-1 rounded-full
                  transition-all duration-500 ${lineColor}`}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalTimeLine;
