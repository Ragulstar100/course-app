import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, StudentAuthResponse, Student } from '../types/auth.types';
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

// Key for mock local DB in localStorage
const MOCK_DB_KEY = 'mock_student_db';

// Helper for Mock DB
const getMockDB = (): Student[] => {
  const db = localStorage.getItem(MOCK_DB_KEY);
  return db ? JSON.parse(db) : [];
};

const saveMockDB = (db: Student[]) => {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
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
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: AuthState };
    const { serverOnline } = state.auth;

    if (serverOnline) {
      try {
        const student = await api.register(payload.studentName, payload.email, payload.password);
        return student;
      } catch (err: any) {
        return rejectWithValue(err.message || 'Registration failed');
      }
    } else {
      // Mock flow
      const db = getMockDB();
      const existing = db.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
      if (existing) {
        // Redirection logic is handled in the Component on duplicate registration attempt.
        // We will throw a special error indicating the user already exists.
        return rejectWithValue('EMAIL_ALREADY_EXISTS');
      }

      const newStudent: Student = {
        id: crypto.randomUUID(),
        studentName: payload.studentName,
        email: payload.email,
        studentStatus: 'Active',
        createdDate: new Date().toISOString(),
        shop: 'quickstart-shop.myshopify.com',
      };

      db.push(newStudent);
      saveMockDB(db);

      // Return simulated auth response
      const authRes: StudentAuthResponse = {
        ...newStudent,
        token: `mock_jwt_token_${newStudent.id}`,
      };
      return authRes;
    }
  }
);

// Thunk to login a user
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    payload: { email: string; password: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: AuthState };
    const { serverOnline } = state.auth;

    if (serverOnline) {
      try {
        const student = await api.login(payload.email, payload.password);
        return student;
      } catch (err: any) {
        return rejectWithValue(err.message || 'Login failed');
      }
    } else {
      // Mock flow
      const db = getMockDB();
      const student = db.find(
        (u) => u.email.toLowerCase() === payload.email.toLowerCase()
      );

      // In mock flow, let's assume password is correct if the student exists
      // (For this mock test, password is '123456' as specified in prompt)
      if (!student || payload.password !== '123456') {
        return rejectWithValue('Invalid email or password');
      }

      const authRes: StudentAuthResponse = {
        ...student,
        token: `mock_jwt_token_${student.id}`,
      };
      return authRes;
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
    const { user, token, serverOnline } = state.auth;

    if (!user || !token) {
      return rejectWithValue('User not authenticated');
    }

    if (serverOnline) {
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
    } else {
      // Mock flow
      const db = getMockDB();
      const index = db.findIndex((u) => u.id === user.id);
      if (index === -1) {
        return rejectWithValue('Student not found in mock database');
      }

      const updatedStudent: Student = {
        ...db[index],
        studentName: payload.studentName,
        email: payload.email,
        phone: payload.phone,
        course: payload.course,
        bio: payload.bio,
      };

      db[index] = updatedStudent;
      saveMockDB(db);

      return updatedStudent;
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
    },
    setSimulatedServerStatus(state, action: PayloadAction<boolean>) {
      state.serverOnline = action.payload;
      state.checkingServer = false;
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
      // We don't log them in automatically because the user request says:
      // "after register automatic goes login page and 123456"
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

export const { logout, clearError, setSimulatedServerStatus } = authSlice.actions;
export default authSlice.reducer;
