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
    savePaymentSchedule,
    getDraftPaymentSchedules,
    // clientPaymentSchedule,
    // contractorPaymentSchedule,
} = require('../controller/paymentschedule.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

PaymentSchedule.route('/')
    .get(getPaymentSchedules)
    .post(userAuth, createPaymentSchedule)
PaymentSchedule.get('/draft', userAuth, getDraftPaymentSchedules);

PaymentSchedule.get('/site/:id', paymentScheduleBySite);
PaymentSchedule.put('/save/:id', userAuth, savePaymentSchedule);

PaymentSchedule.route('/:id')
    .put(updatePaymentSchedule)
    .delete(deletePaymentSchedule)
    .get(getPaymentSchedule)
// PaymentSchedule.get('/:id/ClientPaymentSchedule', clientPaymentSchedule);
// PaymentSchedule.get('/:id/ContractorPaymentSchedule', contractorPaymentSchedule);
PaymentSchedule.get('/:id/paymentDetails', getPaymentDetails);
PaymentSchedule.put('/:id/paymentDetails/:index', updatePaymentDetails);
PaymentSchedule.delete('/:id/paymentDetails/:index', deletePaymentDetails);



module.exports = PaymentSchedule;