// Function to get current FY
const getFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  if (today.getMonth() + 1 <= 3) {
    return `${year - 1}-${year.toString().slice(-2)}`;
  } else {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  }
};

// In Controller: Find last invoice of this FY, increment the count.


const stats = await Invoice.aggregate([
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$totalAmount" },
      unpaidCount: { $sum: { $cond: [{ $eq: ["$status", "Unpaid"] }, 1, 0] } },
      totalInvoices: { $sum: 1 }
    }
  }
]);