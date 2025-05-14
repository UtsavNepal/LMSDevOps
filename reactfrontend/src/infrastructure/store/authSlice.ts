
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authRepository } from '../repositories/AuthRepositories';
import { LoginResponse } from '../repositories/AuthRepositories';

interface AuthState {
  isAuthenticated: boolean;
  users: LoginResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem("access_token"),
  users: localStorage.getItem("users") 
    ? JSON.parse(localStorage.getItem("users")!) 
    : [],
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authRepository.login({ user_name: username, password });
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      return response;
    } catch (error) {
      return rejectWithValue("Login failed. Please check your credentials.");
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("users");
      state.isAuthenticated = false;
      state.users = [];
    },
    checkAuth: (state) => {
      state.isAuthenticated = !!localStorage.getItem("access_token");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.users = [action.payload];
        localStorage.setItem("users", JSON.stringify([action.payload]));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.users = [];
        state.error = action.payload as string;
      });
  }
});

export const { logout, checkAuth } = authSlice.actions;
export default authSlice.reducer;