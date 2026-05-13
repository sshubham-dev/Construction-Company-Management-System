import React from "react";

const SalaryDetails = ({ payroll }) => {
  return (
    <div className="max-w-5xl mx-auto bg-white mt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Salary Details
          </h1>

          <p className="text-gray-500 mt-1">
            Month: {payroll?.month}
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="bg-green-100 text-green-700 px-5 py-3 rounded-xl">
            <p className="text-sm">Net Salary</p>
            <h2 className="text-2xl font-bold">
              ₹ {payroll?.netSalary?.toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <InfoCard label="Employee Name" value={payroll?.employeeName} />
        <InfoCard label="Employee Code" value={payroll?.employeeCode} />
        <InfoCard label="Department" value={payroll?.department} />
        <InfoCard label="Working Days" value={payroll?.workingDays} />
        <InfoCard label="Days Worked" value={payroll?.daysWorked} />
        <InfoCard
          label="Traffic Score"
          value={payroll?.trafficScore}
        />
      </div>

      {/* Salary Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Additions */}
        <div className="border rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-green-700 mb-4">
            Earnings / Additions
          </h2>

          <SalaryRow
            label="Base Salary"
            amount={payroll?.baseSalary}
          />

          <SalaryRow
            label="Traffic Bonus"
            amount={payroll?.trafficBonus}
          />

          <SalaryRow
            label="Target Bonus"
            amount={payroll?.targetBonus}
          />

          <SalaryRow
            label="Other Additions"
            amount={payroll?.otherAdditions}
          />

          <div className="border-t mt-4 pt-4">
            <SalaryRow
              label="Total Additions"
              amount={payroll?.totalAdditions}
              bold
            />
          </div>
        </div>

        {/* Deductions */}
        <div className="border rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-red-700 mb-4">
            Deductions
          </h2>

          <SalaryRow
            label="Leave Deduction"
            amount={payroll?.leaveDeduction}
          />

          <SalaryRow
            label="ESIC Employee"
            amount={payroll?.esicEmployee}
          />

          <SalaryRow
            label="Other Deductions"
            amount={payroll?.otherDeductions}
          />

          <div className="border-t mt-4 pt-4">
            <SalaryRow
              label="Total Deductions"
              amount={payroll?.totalDeductions}
              bold
            />
          </div>
        </div>
      </div>

      {/* Employer Contribution */}
      <div className="mt-6 border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">
          Employer Contribution
        </h2>

        <SalaryRow
          label="ESIC Employer"
          amount={payroll?.esicEmployer}
        />
      </div>

      {/* Footer Summary */}
      <div className="mt-8 bg-gray-50 rounded-2xl p-5">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">
            Gross Salary
          </span>

          <span className="text-xl font-bold">
            ₹ {payroll?.grossSalary?.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center mt-4 border-t pt-4">
          <span className="text-xl font-bold text-green-700">
            Net Payable
          </span>

          <span className="text-3xl font-bold text-green-700">
            ₹ {payroll?.netSalary?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className="text-lg font-semibold text-gray-800 mt-1">
        {value || "-"}
      </h3>
    </div>
  );
};

const SalaryRow = ({ label, amount, bold }) => {
  return (
    <div className="flex justify-between items-center py-2">
      <span
        className={`${
          bold ? "font-semibold text-gray-800" : "text-gray-600"
        }`}
      >
        {label}
      </span>

      <span
        className={`${
          bold ? "font-bold text-gray-900" : "text-gray-700"
        }`}
      >
        ₹ {amount?.toLocaleString() || 0}
      </span>
    </div>
  );
};

export default SalaryDetails;