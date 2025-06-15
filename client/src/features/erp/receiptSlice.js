import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
axios.defaults.withCredentials = true;

export const fetchReceipt = createAsyncThunk('receipt/fetchAll', async () => {
    try {
        const response = await axios.get('/api/v1/receipt');
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const fetchReceiptById = createAsyncThunk('receipt/fetchById', async ({ id }) => {
    try {
        const response = await axios.get(`/api/v1/receipt/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const createReceipt = createAsyncThunk('receipt/create', async ({ data }) => {
    try {
        const response = await axios.post('/api/v1/receipt', data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const updateReceipt = createAsyncThunk('receipt/update', async ({ id, data }) => {
    try {
        const response = await axios.put(`/api/v1/receipt/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const mapReceipt = createAsyncThunk('receipt/map', async ({ id, data }) => {
    try {
        const response = await axios.put(`/api/v1/receipt/map/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const deleteReceipt = createAsyncThunk('receipt/delete', async ({ id }) => {
    try {
        await axios.delete(`/api/v1/receipt/${id}`);
        return id;
    } catch (error) {
        console.log(error)
    }
})

const Receiptslice = createSlice({
    name: 'receipt',
    initialState: {
        all: [],        // List of all items
        selected: {},   // One selected item
        status: null,   // For loading status
        error: null     // For error tracking
    },
    reducers: {},     // No manual reducers for now
    extraReducers: (builder) => {
        builder
            .addCase(fetchReceipt.fulfilled, (state, action) => {
                state.all = action.payload
                state.status = 'success';
            })
            .addCase(fetchReceiptById.fulfilled, (state, action) => {
                state.selected = action.payload
            })
            .addCase(createReceipt.fulfilled, (state, action) => {
                state.all.push(action.payload)
            })
            .addCase(updateReceipt.fulfilled, (state, action) => {
                const index = state.all.findIndex(receipt => receipt._id == action.payload._id)
                if (index !== -1) {
                    state.all[index] = action.payload;
                }
            })
            .addCase(mapReceipt.fulfilled, (state, action) => {
                const index = state.all.findIndex(receipt => receipt._id == action.payload._id)
                if (index !== -1) {
                    state.all[index] = action.payload;
                }
            })
            .addCase(deleteReceipt.fulfilled, (state, action) => {
                state.all = state.all.filter(receipt => receipt._id !== action.payload)
            })
    }
})

export default Receiptslice.reducer;