import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import type {
  Reservation,
  ApiResponse,
  CreateReservationPayload,
  ReservationStatus,
} from '@/lib/types';
import { extractErrorMessage } from '@/lib/utils';

interface ReservationsState {
  items: Reservation[];
  loading: boolean;
  error: string | null;
}

const initialState: ReservationsState = {
  items: [],
  loading: false,
  error: null,
};

/* Participant: my reservations */
export const fetchMyReservations = createAsyncThunk(
  'reservations/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ApiResponse<Reservation[]>>('/reservations/my');
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to fetch reservations'));
    }
  },
);

/* Admin: reservations for an event */
export const fetchEventReservations = createAsyncThunk(
  'reservations/fetchByEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ApiResponse<Reservation[]>>(`/reservations/event/${eventId}`);
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to fetch reservations'));
    }
  },
);

/* Participant: create reservation */
export const createReservation = createAsyncThunk(
  'reservations/create',
  async (payload: CreateReservationPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<Reservation>>('/reservations', payload);
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to book'));
    }
  },
);

/* Participant: cancel reservation */
export const cancelReservation = createAsyncThunk(
  'reservations/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<ApiResponse<Reservation>>(`/reservations/${id}/cancel`);
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to cancel'));
    }
  },
);

/* Admin: update reservation status */
export const updateReservationStatus = createAsyncThunk(
  'reservations/updateStatus',
  async (
    { id, status }: { id: string; status: ReservationStatus },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch<ApiResponse<Reservation>>(
        `/reservations/${id}/status`,
        { status },
      );
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to update status'));
    }
  },
);

const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    /* fetchMy */
    builder.addCase(fetchMyReservations.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchMyReservations.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload; });
    builder.addCase(fetchMyReservations.rejected, (s, { payload }) => { s.loading = false; s.error = payload as string; });

    /* fetchByEvent */
    builder.addCase(fetchEventReservations.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchEventReservations.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload; });
    builder.addCase(fetchEventReservations.rejected, (s, { payload }) => { s.loading = false; s.error = payload as string; });

    /* create */
    builder.addCase(createReservation.fulfilled, (s, { payload }) => { s.items.unshift(payload); });
    builder.addCase(createReservation.rejected, (s, { payload }) => { s.error = payload as string; });

    /* cancel */
    builder.addCase(cancelReservation.fulfilled, (s, { payload }) => {
      const idx = s.items.findIndex((r) => r._id === payload._id);
      if (idx !== -1) s.items[idx] = payload;
    });

    /* updateStatus */
    builder.addCase(updateReservationStatus.fulfilled, (s, { payload }) => {
      const idx = s.items.findIndex((r) => r._id === payload._id);
      if (idx !== -1) s.items[idx] = payload;
    });
  },
});

export const { clearError } = reservationsSlice.actions;
export default reservationsSlice.reducer;
