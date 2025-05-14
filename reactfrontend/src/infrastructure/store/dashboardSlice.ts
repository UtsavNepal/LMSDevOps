
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardRepository } from '../repositories/DashboardRepository';
import { RootState } from './store';

interface DashboardData {
  total_borrowed_books: number;
  total_returned_books: number;
  total_books: number;
  total_students: number;
  overdue_borrowers: { transaction_id: number; student_name: string }[];
}

interface DashboardState {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  notification: {
    status: 'idle' | 'sending' | 'success' | 'error';
    message: string | null;
  };
}

const initialState: DashboardState = {
  data: {
    total_borrowed_books: 0,
    total_returned_books: 0,
    total_books: 0,
    total_students: 0,
    overdue_borrowers: [],
  },
  loading: true,
  error: null,
  notification: {
    status: 'idle',
    message: null,
  },
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as RootState;
    if (!auth.isAuthenticated) {
      return rejectWithValue('Unauthorized - Please login first');
    }
    
    try {
      const repository = new DashboardRepository();
      const [bookSummary, overdueBorrowers] = await Promise.all([
        repository.getBookSummary(),
        repository.getOverdueBorrowers(),
      ]);
      return { ...bookSummary, overdue_borrowers: overdueBorrowers };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    }
  }
);

export const sendOverdueNotifications = createAsyncThunk(
  'dashboard/sendNotifications',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as RootState;
    if (!auth.isAuthenticated) {
      return rejectWithValue('Unauthorized - Please login first');
    }
    
    try {
      const repository = new DashboardRepository();
      const response = await repository.sendOverdueNotifications();
      return response.message || 'Notifications sent successfully!';
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send notifications');
    }
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearNotification: (state) => {
      state.notification = {
        status: 'idle',
        message: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<DashboardData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Send Notifications
      .addCase(sendOverdueNotifications.pending, (state) => {
        state.notification = {
          status: 'sending',
          message: null,
        };
      })
      .addCase(sendOverdueNotifications.fulfilled, (state, action: PayloadAction<string>) => {
        state.notification = {
          status: 'success',
          message: action.payload,
        };
      })
      .addCase(sendOverdueNotifications.rejected, (state, action) => {
        state.notification = {
          status: 'error',
          message: action.payload as string,
        };
      });
  },
});

export const { clearNotification } = dashboardSlice.actions;
export default dashboardSlice.reducer;