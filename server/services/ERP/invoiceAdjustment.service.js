const InvoiceAllocation = require("../../models/invoiceAllocation.models");
const Bill = require("../../models/bill.models");
const ExtraWork = require("../../models/extrawork.models");
const PaymentSchedule = require("../../models/paymentschedule.models");

/* ======================
   RESOLVER
====================== */
async function getInvoiceModel(invoiceId) {
  let invoice =
    await Bill.findById(invoiceId) ||
    await ExtraWork.findById(invoiceId) ||
    await PaymentSchedule.findById(invoiceId);

  return invoice;
}

async function applyInvoiceAdjustments(voucherId) {
  const allocations = await InvoiceAllocation.find({ voucherId });

  for (const alloc of allocations) {
    const invoice = await getInvoiceModel(alloc.invoiceId);

    if (!invoice) continue;

    invoice.paidAmount += alloc.amount;
    invoice.dueAmount -= alloc.amount;

    /* STATUS UPDATE */
    if (invoice.dueAmount <= 0) {
      invoice.status = "PAID";
      invoice.dueAmount = 0;
    } else if (invoice.paidAmount > 0) {
      invoice.status = "PARTIAL";
    }

    await invoice.save();
  }
}

async function reverseInvoiceAdjustments(voucherId) {
  const allocations = await InvoiceAllocation.find({ voucherId });

  for (const alloc of allocations) {
    const invoice = await getInvoiceModel(alloc.invoiceId);

    if (!invoice) continue;

    invoice.paidAmount -= alloc.amount;
    invoice.dueAmount += alloc.amount;

    /* STATUS UPDATE */
    if (invoice.paidAmount === 0) {
      invoice.status = "PENDING";
    } else if (invoice.dueAmount > 0) {
      invoice.status = "PARTIAL";
    }

    await invoice.save();
  }
}

module.exports = {
    applyInvoiceAdjustments,
    reverseInvoiceAdjustments,
}