import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import type {
  UserRole,
  AuthData,
  LoginPayload,
  RegisterPayload,
  ApiResponse,
} from '@/lib/types';
import { extractErrorMessage } from '@/lib/utils';

interface AuthState {
  user: { id: string; fullName?: string; email: string; role: UserRole } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<AuthData>>('/auth/login', payload);
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Login failed'));
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<AuthData>>('/auth/register', payload);
      return data.data!;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Registration failed'));
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    /* ignore errors – we clear local state regardless */
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrate(state) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');
        if (token && user) {
          state.token = token;
          state.user = JSON.parse(user);
        }
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* login */
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.token = payload.access_token;
      state.user = payload.user;
      localStorage.setItem('access_token', payload.access_token);
      localStorage.setItem('user', JSON.stringify(payload.user));
    });
    builder.addCase(login.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload as string;
    });

    /* register */
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.token = payload.access_token;
      state.user = payload.user;
      localStorage.setItem('access_token', payload.access_token);
      localStorage.setItem('user', JSON.stringify(payload.user));
    });
    builder.addCase(register.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload as string;
    });

    /* logout */
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    });
  },
});

export const { hydrate, clearError } = authSlice.actions;
export default authSlice.reducer;
