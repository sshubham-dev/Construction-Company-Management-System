import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
axios.defaults.withCredentials = true;

export const fetchEmployees = createAsyncThunk('employee/fetchAll', async () => {
    try {
        const response = await axios.get('/api/v1/employee');
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const createEmployee = createAsyncThunk('employee/create', async ({data}) => {
    try {
        const response = await axios.post('/api/v1/employee', data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const fetchEmployeeById = createAsyncThunk('employee/fetchById', async ({ id }) => {
    try {
        const response = await axios.get(`/api/v1/employee/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const updateEmployee = createAsyncThunk('employee/update', async ({ id, data }) => {
    try {
        const response = await axios.put(`/api/v1/employee/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
})
export const deleteEmployee = createAsyncThunk('employee/delete', async ({ id }) => {
    try {
        await axios.delete(`/api/v1/employee/${id}`);
        return id;
    } catch (error) {
        console.log(error)
    }
})


const employeeSlice = createSlice({
    name: "employee",
    initialState: {
        all: [],        // List of all items
        selected: {},   // One selected item
        status: null,   // For loading status
        error: null     // For error tracking
    },
    reducers: {},     // No manual reducers for now
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.all = action.payload;
                state.status = 'success';
            })
            .addCase(fetchEmployeeById.fulfilled, (state, action) => {
                state.selected = action.payload;
            })
            .addCase(createEmployee.fulfilled, (state, action) => {
                state.all.push(action.payload);
            })
            .addCase(updateEmployee.fulfilled, (state, action) => {
                const index = state.all.findIndex((employee) => employee._id === action.payload._id)
                if (index !== -1) {
                    state.all[index] = action.payload
                }
            })
            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.all = state.all.filter((employee) => employee._id !== action.payload)
            })
    }
})

export default employeeSlice.reducer;