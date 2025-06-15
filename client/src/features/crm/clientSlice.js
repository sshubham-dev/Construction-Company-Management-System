import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
axios.defaults.withCredentials = true;

export const fetchClients = createAsyncThunk('client/fetchAll', async () => {
    try {
        const response = await axios.get('/api/v1/client');
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const fetchClientById = createAsyncThunk('client/fetchById', async ({ id }) => {
    try {
        const response = await axios.get(`/api/v1/client/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const createClient = createAsyncThunk('client/create', async ({ data }) => {
    try {
        const response = await axios.post('/api/v1/client', data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const updateClient = createAsyncThunk('client/update', async ({ id, data }) => {
    try {
        const response = await axios.put(`/api/v1/client/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const deleteClient = createAsyncThunk('client/delete', async ({ id }) => {
    try {
        await axios.delete(`/api/v1/client/${id}`);
        return id;
    } catch (error) {
        console.log(error)
    }
})

const clientSlice = createSlice({
    name: 'client',
    initialState: {
        all: [],        // List of all items
        selected: {},   // One selected item
        status: null,   // For loading status
        error: null     // For error tracking
    },
    reducers: {},     // No manual reducers for now
    extraReducers: (builder) => {
        builder
            .addCase(fetchClients.fulfilled, (state, action) => {
                state.all = action.payload
            })
            .addCase(fetchClientById.fulfilled, (state, action) => {
                state.selected = action.payload
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.all.push(action.payload)
            })
            .addCase(updateClient.fulfilled, (state, action) => {
                const index = state.all.findIndex(client => client._id === action.payload._id)
                if (index !== -1) {
                    state.all[index] = action.payload
                }
            })
            .addCase(deleteClient.fulfilled, (state, action) => {
                state.all = state.all.filter(client => client._id !== action.payload)
            })
    }
})

export default clientSlice.reducer;