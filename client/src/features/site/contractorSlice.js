import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios, { all } from "axios"
axios.defaults.withCredentials = true;

export const fetchContractors = createAsyncThunk('contractor/fetchAll', async () => {
    try {
        const response = await axios.get('/api/v1/contractor');
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const fetchContractorById = createAsyncThunk('contractor/fetchById', async ({ id }) => {
    try {
        const response = await axios.get(`/api/v1/contractor/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const createContractor = createAsyncThunk('contractor/create', async ({ data }) => {
    try {
        const response = await axios.post('/api/v1/contractor', data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const updateContractor = createAsyncThunk('contractor/update', async ({ id, data }) => {
    try {
        const response = await axios.put(`/api/v1/contractor/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const deleteContractor = createAsyncThunk('contractor/delete', async ({ id }) => {
    try {
        await axios.delete(`/api/v1/contractor/${id}`);
        return id;
    } catch (error) {
        console.log(error)
    }
})

const contractorSlice = createSlice({
    name: 'contractor',
    initialState: {
        all: [],        // List of all items
        selected: {},   // One selected item
        status: null,   // For loading status
        error: null     // For error tracking
    },
    reducers: {},     // No manual reducers for now
    extraReducers: (builder) => {
        builder
            .addCase(fetchContractors.fulfilled, (state, action) => {
                state.all = action.payload;
                state.status = 'success';
            })
            .addCase(fetchContractorById.fulfilled, (state, action) => {
                state.selected = action.payload
            })
            .addCase(createContractor.fulfilled, (state, action) => {
                state.all.push(action.payload)
            })
            .addCase(updateContractor.fulfilled, (state, action) => {
                const index = state.all.findIndex(contractor => contractor._id === action.payload._id)
                if (index !== -1) {
                    state.all[index] = action.payload;
                }
            })
            .addCase(deleteContractor.fulfilled, (state, action) => {
                state.all = state.all.filter(contractor => contractor._id !== action.payload)
            })
    }
})

export default contractorSlice.reducer;