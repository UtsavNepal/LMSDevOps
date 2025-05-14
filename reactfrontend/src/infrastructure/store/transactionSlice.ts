import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { Transaction } from '../../domain/Transaction.Entity';
import { RootState } from './store';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk<
  Transaction[],
  void,
  { state: RootState }
>(
  'transactions/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue('Unauthorized');
    }
    
    try {
      const repository = new TransactionRepository();
      return await repository.getAll();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch transactions');
    }
  }
);

export const createTransaction = createAsyncThunk<
  Transaction,
  Omit<Transaction, "transaction_id">,
  { state: RootState }
>(
  'transactions/create',
  async (transaction, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue('Unauthorized');
    }
    
    try {
      const repository = new TransactionRepository();
      return await repository.post("/", transaction);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk<
  Transaction,
  { id: number; transaction: Partial<Transaction> },
  { state: RootState }
>(
  'transactions/update',
  async ({ id, transaction }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue('Unauthorized');
    }
    
    try {
      const repository = new TransactionRepository();
      return await repository.put(`/${id}/`, transaction);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk<
  number,
  number,
  { state: RootState }
>(
  'transactions/delete',
  async (id, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue('Unauthorized');
    }
    
    try {
      const repository = new TransactionRepository();
      await repository.delete(`/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete transaction');
    }
  }
);

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.loading = false;
        state.transactions.push(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.loading = false;
        const index = state.transactions.findIndex(t => t.transaction_id === action.payload.transaction_id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.transactions = state.transactions.filter(t => t.transaction_id !== action.payload);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default transactionSlice.reducer;