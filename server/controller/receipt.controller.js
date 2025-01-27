const receipt = await Receipt.findById(receiptId);
if (receipt.invoice.type === 'Invoice') {
  const invoice = await Invoice.findById(receipt.invoice.id);
  // Do something with the Invoice
} else if (receipt.invoice.type === 'Bill') {
  const bill = await Bill.findById(receipt.invoice.id);
  // Do something with the Bill
}
