import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchTherapists = createAsyncThunk('therapists/fetchAll', async (params = {}) => {
  const { data } = await api.get('/therapists', { params });
  return data.data;
});

export const fetchTherapistById = createAsyncThunk('therapists/fetchOne', async (id) => {
  const { data } = await api.get(`/therapists/${id}`);
  return data.data.therapist;
});

const therapistsSlice = createSlice({
  name: 'therapists',
  initialState: { list: [], current: null, pagination: { total: 0, page: 1, pages: 1 }, status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTherapists.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTherapists.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.therapists;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTherapistById.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export default therapistsSlice.reducer;
