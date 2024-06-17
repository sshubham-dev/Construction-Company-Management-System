const express = require('express');
const PaymentSchedule = express.Router();
const {
    getPaymentSchedule,
    getPaymentSchedules,
    createPaymentSchedule,
    updatePaymentSchedule,
    deletePaymentSchedule,
    deletePaymentDetails,
    updatePaymentDetails,
    getPaymentDetails,
    paymentScheduleBySite,
    // clientPaymentSchedule,
    // contractorPaymentSchedule,
} = require('../controller/paymentschedule.controller');

PaymentSchedule.route('/')
    .get(getPaymentSchedules)
    .post(createPaymentSchedule)

PaymentSchedule.route('/:id')
    .put(updatePaymentSchedule)
    .delete(deletePaymentSchedule)
    .get(getPaymentSchedule)
// PaymentSchedule.get('/:id/ClientPaymentSchedule', clientPaymentSchedule);
// PaymentSchedule.get('/:id/ContractorPaymentSchedule', contractorPaymentSchedule);
PaymentSchedule.get('/site/:id', paymentScheduleBySite);
PaymentSchedule.get('/:id/paymentDetails', getPaymentDetails);
PaymentSchedule.put('/:id/paymentDetails/:index', updatePaymentDetails);
PaymentSchedule.delete('/:id/paymentDetails/:index', deletePaymentDetails);



module.exports = PaymentSchedule;