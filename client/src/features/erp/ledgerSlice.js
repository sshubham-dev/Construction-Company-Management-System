import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
axios.defaults.withCredentials = true;

export const fetchLedgers = createAsyncThunk('ledger/fetchAll', async () => {
    try {
        const response = await axios.get('/api/v1/ledger');
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const fetchLedgerById = createAsyncThunk('ledger/fetchById', async ({ id }) => {
    try {
        const response = await axios.get(`/api/v1/ledger/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const createLedger = createAsyncThunk('ledger/create', async ({ data }) => {
    try {
        const response = await axios.post('/api/v1/ledger', data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const updateLedger = createAsyncThunk('ledger/update', async ({ id, data }) => {
    try {
        const response = await axios.put(`/api/v1/ledger/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const mapLedger = createAsyncThunk('ledger/map', async ({ id, data }) => {
    try {
        const response = await axios.put(`/api/v1/ledger/map/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const deleteLedger = createAsyncThunk('ledger/delete', async ({ id }) => {
    try {
        await axios.delete(`/api/v1/ledger/${id}`);
        return id;
    } catch (error) {
        console.log(error)
    }
})

const ledgerSlice = createSlice({
    name: 'ledger',
    initialState: {
        all: [],        // List of all items
        selected: {},   // One selected item
        status: null,   // For loading status
        error: null     // For error tracking
    },
    reducers: {},     // No manual reducers for now
    extraReducers: (builder) => {
        builder
            .addCase(fetchLedgers.fulfilled, (state, action) => {
                state.all = action.payload
                state.status = 'success';
            })
            .addCase(fetchLedgerById.fulfilled, (state, action) => {
                state.selected = action.payload
            })
            .addCase(createLedger.fulfilled, (state, action) => {
                state.all.push(action.payload)
            })
            .addCase(updateLedger.fulfilled, (state, action) => {
                const index = state.all.findIndex(ledger => ledger._id == action.payload._id)
                if (index !== -1) {
                    state.all[index] = action.payload;
                }
            })
            .addCase(mapLedger.fulfilled, (state, action) => {
                const index = state.all.findIndex(ledger => ledger._id == action.payload._id)
                if (index !== -1) {
                    state.all[index] = action.payload;
                }
            })
            .addCase(deleteLedger.fulfilled, (state, action) => {
                state.all = state.all.filter(ledger => ledger._id !== action.payload)
            })
    }
})

export default ledgerSlice.reducer;