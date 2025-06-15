import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
axios.defaults.withCredentials = true;

export const fetchSites = createAsyncThunk('site/fetchAll', async () => {
    try {
        const response = await axios.get('/api/v1/site');
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const fetchSiteById = createAsyncThunk('site/fetchById', async ({ id }) => {
    try {
        const response = await axios.get(`/api/v1/site/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const fetchSiteByUser = createAsyncThunk('site/fetchByUser', async ({ id }) => {
    try {
        const response = await axios.get(`/api/v1/site/user/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const createSite = createAsyncThunk('site/create', async ({ data }) => {
    try {
        const response = await axios.post('/api/v1/site', data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const updateSite = createAsyncThunk('site/update', async ({ id, data }) => {
    try {
        const response = await axios.put(`/api/v1/site/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const deleteSite = createAsyncThunk('site/delete', async ({ id }) => {
    try {
        await axios.delete(`/api/v1/site/${id}`);
        return id;
    } catch (error) {
        console.log(error)
    }
})

const siteSlice = createSlice({
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
            .addCase(fetchSites.fulfilled, (state, action) => {
                state.all = action.payload;
                state.status = 'success';
            })
            .addCase(fetchSiteById.fulfilled, (state, action) => {
                state.selected = action.payload
            })
            .addCase(fetchSiteByUser.fulfilled, (state, action) => {
                state.all = action.payload
            })
            .addCase(createSite.fulfilled, (state, action) => {
                state.all.push(action.payload)
            })
            .addCase(updateSite.fulfilled, (state, action) => {
                const index = state.all.findIndex(site => site._id === action.payload._id)
                if (index !== -1) {
                    state.all[index] = action.payload
                }
            })
            .addCase(deleteSite.fulfilled, (state, action) => {
                state.all = state.all.filter(site => site._id !== action.payload)
            })
    }
})

export default siteSlice.reducer;