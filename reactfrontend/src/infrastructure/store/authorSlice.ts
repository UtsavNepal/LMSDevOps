
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthorRepository } from '../repositories/AuthorRepository';
import { Author } from '../../domain/Author';
import { RootState } from './store';

interface AuthorState {
  authors: Author[];
  loading: boolean;
  error: string | null;
}

const initialState: AuthorState = {
  authors: [],
  loading: false,
  error: null,
};

// Helper type for API error responses
type ApiError = {
  message: string;
  status?: number;
};

export const fetchAuthors = createAsyncThunk<
  Author[], // Return type
  void, // Argument type
  { state: RootState; rejectValue: ApiError }
>(
  'author/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue({ message: "Unauthorized - Please login first" });
    }
    
    try {
      const repository = new AuthorRepository();
      return await repository.getAll();
    } catch (error) {
      return rejectWithValue({ 
        message: error instanceof Error ? error.message : 'Failed to fetch authors'
      });
    }
  }
);

export const addAuthor = createAsyncThunk<
  Author, // Return type
  Omit<Author, "AuthorID">, // Argument type
  { state: RootState; rejectValue: ApiError }
>(
  'author/add',
  async (author, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue({ message: "Unauthorized - Please login first" });
    }
    
    try {
      const repository = new AuthorRepository();
      return await repository.post("/", author);
    } catch (error) {
      return rejectWithValue({ 
        message: error instanceof Error ? error.message : 'Failed to add author'
      });
    }
  }
);

export const updateAuthor = createAsyncThunk<
  Author, // Return type
  { id: number; author: Partial<Author> }, // Argument type
  { state: RootState; rejectValue: ApiError }
>(
  'author/update',
  async ({ id, author }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue({ message: "Unauthorized - Please login first" });
    }
    
    try {
      const repository = new AuthorRepository();
      return await repository.put(`/${id}/`, author);
    } catch (error) {
      return rejectWithValue({ 
        message: error instanceof Error ? error.message : 'Failed to update author'
      });
    }
  }
);

export const deleteAuthor = createAsyncThunk<
  number, // Return type
  number, // Argument type
  { state: RootState; rejectValue: ApiError }
>(
  'author/delete',
  async (id, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue({ message: "Unauthorized - Please login first" });
    }
    
    try {
      const repository = new AuthorRepository();
      await repository.delete(`/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue({ 
        message: error instanceof Error ? error.message : 'Failed to delete author'
      });
    }
  }
);

export const authorSlice = createSlice({
  name: 'author',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Authors
      .addCase(fetchAuthors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuthors.fulfilled, (state, action: PayloadAction<Author[]>) => {
        state.loading = false;
        state.authors = action.payload;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch authors';
      })
      
      // Add Author
      .addCase(addAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAuthor.fulfilled, (state, action: PayloadAction<Author>) => {
        state.loading = false;
        state.authors.push(action.payload);
      })
      .addCase(addAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add author';
      })
      
      // Update Author
      .addCase(updateAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAuthor.fulfilled, (state, action: PayloadAction<Author>) => {
        state.loading = false;
        const index = state.authors.findIndex(a => a.AuthorID === action.payload.AuthorID);
        if (index !== -1) {
          state.authors[index] = action.payload;
        }
      })
      .addCase(updateAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update author';
      })
      
      // Delete Author
      .addCase(deleteAuthor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAuthor.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.authors = state.authors.filter(a => a.AuthorID !== action.payload);
      })
      .addCase(deleteAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete author';
      });
  },
});

export default authorSlice.reducer;