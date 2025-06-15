import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
axios.defaults.withCredentials = true;

export const fetchPayment = createAsyncThunk('payment/fetchAll', async () => {
    try {
        const response = await axios.get('/api/v1/payment');
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const fetchPaymentById = createAsyncThunk('payment/fetchById', async ({ id }) => {
    try {
        const response = await axios.get(`/api/v1/payment/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const createPayment = createAsyncThunk('payment/create', async ({ data }) => {
    try {
        const response = await axios.post('/api/v1/payment', data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const updatePayment = createAsyncThunk('payment/update', async ({ id, data }) => {
    try {
        const response = await axios.put(`/api/v1/payment/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const mapPayment = createAsyncThunk('payment/map', async ({ id, data }) => {
    try {
        const response = await axios.put(`/api/v1/payment/map/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const deletePayment = createAsyncThunk('payment/delete', async ({ id }) => {
    try {
        await axios.delete(`/api/v1/payment/${id}`);
        return id;
    } catch (error) {
        console.log(error)
    }
})

const Paymentslice = createSlice({
    name: 'payment',
    initialState: {
        all: [],        // List of all items
        selected: {},   // One selected item
        status: null,   // For loading status
        error: null     // For error tracking
    },
    reducers: {},     // No manual reducers for now
    extraReducers: (builder) => {
        builder
            .addCase(fetchPayment.fulfilled, (state, action) => {
                state.all = action.payload
                state.status = 'success';
            })
            .addCase(fetchPaymentById.fulfilled, (state, action) => {
                state.selected = action.payload
            })
            .addCase(createPayment.fulfilled, (state, action) => {
                state.all.push(action.payload)
            })
            .addCase(updatePayment.fulfilled, (state, action) => {
                const index = state.all.findIndex(payment => payment._id == action.payload._id)
                if (index !== -1) {
                    state.all[index] = action.payload;
                }
            })
            .addCase(mapPayment.fulfilled, (state, action) => {
                const index = state.all.findIndex(payment => payment._id == action.payload._id)
                if (index !== -1) {
                    state.all[index] = action.payload;
                }
            })
            .addCase(deletePayment.fulfilled, (state, action) => {
                state.all = state.all.filter(payment => payment._id !== action.payload)
            })
    }
})

export default Paymentslice.reducer;