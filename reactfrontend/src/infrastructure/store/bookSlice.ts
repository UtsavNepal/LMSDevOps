
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BookRepository } from '../repositories/BookRepositories';
import { Book } from '../../domain/BookEntities';
import { RootState } from './store';

interface BookState {
  books: Book[];
  loading: boolean;
  error: string | null;
}

const initialState: BookState = {
  books: [],
  loading: false,
  error: null,
};

// Helper type for API error responses
type ApiError = {
  message: string;
  status?: number;
};

export const fetchBooks = createAsyncThunk<
  Book[], // Return type
  void, // Argument type
  { state: RootState; rejectValue: ApiError }
>(
  'book/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue({ message: "Unauthorized - Please login first" });
    }
    
    try {
      const repository = new BookRepository();
      return await repository.getAll();
    } catch (error) {
      return rejectWithValue({ 
        message: error instanceof Error ? error.message : 'Failed to fetch books'
      });
    }
  }
);

export const addBook = createAsyncThunk<
  Book, // Return type
  Omit<Book, "BookId">, // Argument type
  { state: RootState; rejectValue: ApiError }
>(
  'book/add',
  async (book, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue({ message: "Unauthorized - Please login first" });
    }
    
    try {
      const repository = new BookRepository();
      return await repository.post("/", book);
    } catch (error) {
      return rejectWithValue({ 
        message: error instanceof Error ? error.message : 'Failed to add book'
      });
    }
  }
);

export const updateBook = createAsyncThunk<
  Book, // Return type
  { id: number; book: Partial<Book> }, // Argument type
  { state: RootState; rejectValue: ApiError }
>(
  'book/update',
  async ({ id, book }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue({ message: "Unauthorized - Please login first" });
    }
    
    try {
      const repository = new BookRepository();
      return await repository.put(`/${id}/`, book);
    } catch (error) {
      return rejectWithValue({ 
        message: error instanceof Error ? error.message : 'Failed to update book'
      });
    }
  }
);

export const deleteBook = createAsyncThunk<
  number, // Return type
  number, // Argument type
  { state: RootState; rejectValue: ApiError }
>(
  'book/delete',
  async (id, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.isAuthenticated) {
      return rejectWithValue({ message: "Unauthorized - Please login first" });
    }
    
    try {
      const repository = new BookRepository();
      await repository.delete(`/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue({ 
        message: error instanceof Error ? error.message : 'Failed to delete book'
      });
    }
  }
);

export const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action: PayloadAction<Book[]>) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch books';
      })
      
      // Add Book
      .addCase(addBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBook.fulfilled, (state, action: PayloadAction<Book>) => {
        state.loading = false;
        state.books.push(action.payload);
      })
      .addCase(addBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add book';
      })
      
      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action: PayloadAction<Book>) => {
        state.loading = false;
        const index = state.books.findIndex(b => b.BookId === action.payload.BookId);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update book';
      })
      
      // Delete Book
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.books = state.books.filter(b => b.BookId !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete book';
      });
  },
});

export default bookSlice.reducer;