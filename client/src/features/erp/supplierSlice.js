import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
axios.defaults.withCredentials = true;

export const fetchSuppliers = createAsyncThunk('supplier/fetchAll', async () => {
    try {
        const response = await axios.get('/api/v1/supplier');
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const fetchSupplierById = createAsyncThunk('supplier/fetchById', async ({ id }) => {
    try {
        const response = await axios.get(`/api/v1/supplier/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const createSupplier = createAsyncThunk('supplier/create', async ({ data }) => {
    try {
        const response = await axios.post('/api/v1/supplier', data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const updateSupplier = createAsyncThunk('supplier/update', async ({ id, data }) => {
    try {
        const response = await axios.put(`/api/v1/supplier/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const deleteSupplier = createAsyncThunk('supplier/delete', async ({ id }) => {
    try {
        await axios.delete(`/api/v1/supplier/${id}`);
        return id;
    } catch (error) {
        console.log(error)
    }
})

const supplierSlice = createSlice({
    name: 'site',
    initialState: {
        all: [],        // List of all items
        selected: {},   // One selected item
        status: null,   // For loading status
        error: null     // For error tracking
    },
    reducers: {},     // No manual reducers for now
    extraReducers: (builder) => {
        builder
            .addCase(fetchSuppliers.fulfilled, (state, action) => {
                state.all = action.payload
            })
            .addCase(fetchSupplierById.fulfilled, (state, action) => {
                state.selected = action.payload
            })
            .addCase(createSupplier.fulfilled, (state, action) => {
                state.all.push(action.payload)

            })
            .addCase(updateSupplier.fulfilled, (state, action) => {
                const index = state.all.findIndex(supplier => supplier._id === action.payload._id)
                if (index !== -1) {
                    state.all[index] = action.payload
                }
            })
            .addCase(deleteSupplier.fulfilled, (state, action) => {
                state.all = state.all.filter(supplier => supplier._id !== action.payload)

            })
    }
})

export default supplierSlice.reducer;