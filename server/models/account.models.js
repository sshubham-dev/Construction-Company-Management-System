const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    accountNo:{
        type: Number,
        required: true,
        unique: true,
    },
    mode:{
        type: String,
        enum: ['cash', 'cheque', 'account'] 
    },
    isGST:{
        type: Boolean
    },
    GSTNo:{
        Type: String
    },
    status:{
        type: String,
        enum: ['active', 'cleared', 'pending']
    },
    transaction:{
        Dr: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
        }],
        Cr: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
        }],
        balance:{
            type: Number
        }
    },
},{timestamps:true});

// accountSchema.pre('save', function (next) {
//     const PaymentDetails = this.paymentDetails;
//     console.log('PaymentDetails:', PaymentDetails)

//     PaymentDetails.map((detail) => {
//         const amount = parseFloat(detail.amount) || 0;
//         const paidAmount = parseFloat(detail.paid) || 0;
//         console.log('amount:', amount)
//         console.log('paid:', paidAmount)
//         const payment = amount - paidAmount;

//         // Check if payment is a valid number
//         if (!isNaN(payment) && isFinite(payment)) {
//             // Set dueAmount to a positive value or 0
//             detail.due = Math.max(0, payment.toFixed(2));
//         } else {
//             detail.due = null;
//         }
//         console.log('due:', detail.due)
//     })

//     function total(amount, value) {
//         return amount + value
//     };
//     const TotalAmount = PaymentDetails.map((detail) => {
//         return detail.amount;
//     });
//     console.log('TotalAmount:', TotalAmount)
//     this.totalValue = TotalAmount.reduce(total)
//     // console.log('totalValue:', this.totalValue)

//     const amount = parseFloat(this.totalValue) || 0;
//     const paidAmount = parseFloat(this.amountPaid) || 0;
//     console.log('Totalamount:', amount)
//     console.log('Totalpaid:', paidAmount)
//     const payment = amount - paidAmount;

//     // Check if payment is a valid number
//     if (!isNaN(payment) && isFinite(payment)) {
//         // Set dueAmount to a positive value or 0
//         this.remaningAmount = Math.max(0, payment.toFixed(2));
//     } else {
//         this.remaningAmount = null;
//     }

//     next();
// });

const Accounts = mongoose.model("Account", accountSchema);
module.exports = Accounts;