import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import type {
  Event,
  ApiResponse,
  CreateEventPayload,
  UpdateEventPayload,
} from '@/lib/types';
import { extractErrorMessage } from '@/lib/utils';

interface EventsState {
  items: Event[];
  current: Event | null;
  loading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  items: [],
  current: null,
  loading: false,
  error: null,
};

/* Public: published events only */
export const fetchPublicEvents = createAsyncThunk(
  'events/fetchPublic',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ApiResponse<Event[]>>('/events');
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to fetch events'));
    }
  },
);

/* Admin: all events */
export const fetchAllEvents = createAsyncThunk(
  'events/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ApiResponse<Event[]>>('/events/admin/all');
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to fetch events'));
    }
  },
);

export const fetchEventById = createAsyncThunk(
  'events/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ApiResponse<Event>>(`/events/${id}`);
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Event not found'));
    }
  },
);

export const createEvent = createAsyncThunk(
  'events/create',
  async (payload: CreateEventPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<Event>>('/events', payload);
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to create event'));
    }
  },
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, ...payload }: UpdateEventPayload & { id: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<ApiResponse<Event>>(`/events/${id}`, payload);
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to update event'));
    }
  },
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/events/${id}`);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to delete event'));
    }
  },
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* fetchPublic */
    builder.addCase(fetchPublicEvents.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchPublicEvents.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; });
    builder.addCase(fetchPublicEvents.rejected, (state, { payload }) => { state.loading = false; state.error = payload as string; });

    /* fetchAll */
    builder.addCase(fetchAllEvents.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchAllEvents.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; });
    builder.addCase(fetchAllEvents.rejected, (state, { payload }) => { state.loading = false; state.error = payload as string; });

    /* fetchById */
    builder.addCase(fetchEventById.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchEventById.fulfilled, (state, { payload }) => { state.loading = false; state.current = payload; });
    builder.addCase(fetchEventById.rejected, (state, { payload }) => { state.loading = false; state.error = payload as string; });

    /* create */
    builder.addCase(createEvent.fulfilled, (state, { payload }) => { state.items.unshift(payload); });

    /* update */
    builder.addCase(updateEvent.fulfilled, (state, { payload }) => {
      const idx = state.items.findIndex((e) => e._id === payload._id);
      if (idx !== -1) state.items[idx] = payload;
      if (state.current?._id === payload._id) state.current = payload;
    });

    /* delete */
    builder.addCase(deleteEvent.fulfilled, (state, { payload }) => {
      state.items = state.items.filter((e) => e._id !== payload);
      if (state.current?._id === payload) state.current = null;
    });
  },
});

export const { clearCurrent, clearError } = eventsSlice.actions;
export default eventsSlice.reducer;
