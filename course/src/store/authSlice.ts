import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, StudentAuthResponse } from '../types/auth.types';
import { api } from '../services/api';

// Retrieve initial auth state from localStorage
const storedUser = localStorage.getItem('auth_user');
const storedToken = localStorage.getItem('auth_token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  loading: false,
  error: null,
  serverOnline: false,
  checkingServer: true,
};

// Thunk to check server health
export const checkServerStatus = createAsyncThunk(
  'auth/checkServerStatus',
  async () => {
    try {
      const isOnline = await api.checkServerHealth();
      return isOnline;
    } catch (err) {
      return false;
    }
  }
);

// Thunk to register a user
export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    payload: { studentName: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const student = await api.register(payload.studentName, payload.email, payload.password);
      return student;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

// Thunk to login a user
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    payload: { email: string; password: string },
    { rejectWithValue }
  ) => {
    // Hardcoded Admin login check
    if (payload.email === 'test' && payload.password === 'test') {
      const adminUser: StudentAuthResponse = {
        id: 'admin_id',
        studentName: 'Admin Test',
        email: 'test',
        studentStatus: 'Active',
        createdDate: new Date().toISOString(),
        shop: 'quickstart-shop.myshopify.com',
        token: 'mock_admin_token',
        isAdmin: true,
      };
      return adminUser;
    }

    try {
      const student = await api.login(payload.email, payload.password);
      return student;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

// Thunk to update student profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    payload: { studentName: string; email: string; phone?: string; course?: string; bio?: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: AuthState };
    const { token } = state.auth;

    if (!token) {
      return rejectWithValue('User not authenticated');
    }

    try {
      const updatedStudent = await api.updateProfile(
        token,
        payload.studentName,
        payload.email,
        payload.phone,
        payload.course,
        payload.bio
      );
      return updatedStudent;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Check server status
    builder.addCase(checkServerStatus.pending, (state) => {
      state.checkingServer = true;
    });
    builder.addCase(checkServerStatus.fulfilled, (state, action) => {
      state.serverOnline = action.payload;
      state.checkingServer = false;
    });
    builder.addCase(checkServerStatus.rejected, (state) => {
      state.serverOnline = false;
      state.checkingServer = false;
    });

    // Register user
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Login user
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.token = action.payload.token;
      localStorage.setItem('auth_user', JSON.stringify(action.payload));
      localStorage.setItem('auth_token', action.payload.token);
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Profile
    builder.addCase(updateProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
        localStorage.setItem('auth_user', JSON.stringify(state.user));
      }
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
