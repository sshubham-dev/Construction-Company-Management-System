import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchNotifications = createAsyncThunk(
    'notifications/fetch',
    async (userId) => {
        const response = await axios.get(`/api/v1/notification/${userId}`);
        return response.data;
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        seenNotifications: [],
        unseenNotifications: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.seenNotifications = action.payload.seenNotifications || [];
                state.unseenNotifications = action.payload.unseenNotifications || [];
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default notificationSlice.reducer;
