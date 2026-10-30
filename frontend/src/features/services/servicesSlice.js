import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchServices = createAsyncThunk('services/fetchAll', async (params = {}) => {
  const { data } = await api.get('/services', { params });
  return data.data;
});

export const fetchServiceBySlug = createAsyncThunk('services/fetchOne', async (slug) => {
  const { data } = await api.get(`/services/${slug}`);
  return data.data.service;
});

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    list: [],
    pagination: { total: 0, page: 1, pages: 1 },
    current: null,
    status: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.services;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchServiceBySlug.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export default servicesSlice.reducer;
