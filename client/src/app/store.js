import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice.js'
import notificationReducer from '../features/notification/notificationSlice';
import employeeReducer from '../features/hr/employeeSlice.js'
import clientReducer from '../features/crm/clientSlice.js'
import siteReducer from '../features/site/siteSlice.js'
import contractorReducer from '../features/site/contractorSlice.js'
import supplierReducer from '../features/erp/supplierSlice.js'
import ledgerReducer from '../features/erp/ledgerSlice.js'
import receiptReducer from '../features/erp/receiptSlice.js'
import paymentReducer from '../features/erp/paymentSlice.js'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notifications: notificationReducer,
        employee: employeeReducer,
        site: siteReducer,
        client: clientReducer,
        contractor: contractorReducer,
        supplier: supplierReducer,
        ledger: ledgerReducer,
        receipt: receiptReducer,
        payment: paymentReducer,
    }
})
