import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchDashboardStats = createAsyncThunk('admin/dashboard', async () => {
  const { data } = await api.get('/admin/dashboard');
  return data.data;
});

export const fetchRevenueReport = createAsyncThunk('admin/revenueReport', async (period = 'daily') => {
  const { data } = await api.get('/admin/reports/revenue', { params: { period } });
  return data.data.report;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: { stats: null, revenueReport: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.revenueReport = action.payload;
      });
  },
});

export default adminSlice.reducer;
