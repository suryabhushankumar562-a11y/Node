import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const createBooking = createAsyncThunk('booking/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/bookings', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Booking failed');
  }
});

export const fetchMyBookings = createAsyncThunk('booking/fetchMine', async (params = {}) => {
  const { data } = await api.get('/bookings/my', { params });
  return data.data;
});

export const cancelBooking = createAsyncThunk('booking/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/bookings/${id}/cancel`, { reason });
    return data.data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Cancellation failed');
  }
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    draft: { serviceId: null, therapistId: null, date: null, startTime: null },
    myBookings: [],
    pagination: { total: 0, page: 1, pages: 1 },
    pendingBooking: null,
    status: 'idle',
  },
  reducers: {
    setDraft: (state, action) => {
      state.draft = { ...state.draft, ...action.payload };
    },
    clearDraft: (state) => {
      state.draft = { serviceId: null, therapistId: null, date: null, startTime: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.fulfilled, (state, action) => {
        state.pendingBooking = action.payload;
        toast.success('Booking created, proceed to payment');
      })
      .addCase(createBooking.rejected, (state, action) => {
        toast.error(action.payload);
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.myBookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const idx = state.myBookings.findIndex((b) => b._id === action.payload._id);
        if (idx > -1) state.myBookings[idx] = action.payload;
        toast.success('Booking cancelled');
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        toast.error(action.payload);
      });
  },
});

export const { setDraft, clearDraft } = bookingSlice.actions;
export default bookingSlice.reducer;
