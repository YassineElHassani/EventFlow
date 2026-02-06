import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import type {
  User,
  ApiResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from '@/lib/types';
import { extractErrorMessage } from '@/lib/utils';

interface UsersState {
  items: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ApiResponse<User[]>>('/users');
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to fetch users'));
    }
  },
);

export const createUser = createAsyncThunk(
  'users/create',
  async (payload: CreateUserPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<User>>('/users', payload);
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to create user'));
    }
  },
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, ...payload }: UpdateUserPayload & { id: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<ApiResponse<User>>(`/users/${id}`, payload);
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to update user'));
    }
  },
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to delete user'));
    }
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchUsers.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload; });
    builder.addCase(fetchUsers.rejected, (s, { payload }) => { s.loading = false; s.error = payload as string; });

    builder.addCase(createUser.fulfilled, (s, { payload }) => { s.items.unshift(payload); });
    builder.addCase(createUser.rejected, (s, { payload }) => { s.error = payload as string; });

    builder.addCase(updateUser.fulfilled, (s, { payload }) => {
      const idx = s.items.findIndex((u) => u._id === payload._id);
      if (idx !== -1) s.items[idx] = payload;
    });

    builder.addCase(deleteUser.fulfilled, (s, { payload }) => {
      s.items = s.items.filter((u) => u._id !== payload);
    });
  },
});

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;
