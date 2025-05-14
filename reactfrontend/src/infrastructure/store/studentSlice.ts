
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StudentRepository } from '../repositories/StudentRepository';
import { Student } from '../../domain/Student';
import { RootState } from './store';

interface StudentState {
    students: Student[];
    loading: boolean;
    error: string | null;
  }
  
  const initialState: StudentState = {
    students: [],
    loading: false,
    error: null,
  };
  
  const repository = new StudentRepository();
  
  // Helper type for API error responses
  type ApiError = {
    message: string;
    status?: number;
  };
  
  export const fetchStudents = createAsyncThunk<
    Student[], 
    void, 
    { state: RootState; rejectValue: ApiError }
  >(
    'student/fetchAll',
    async (_, { getState, rejectWithValue }) => {
      try {
        const { auth } = getState();
        if (!auth.isAuthenticated) {
          return rejectWithValue({ message: "Unauthorized - Please login first" });
        }
        return await repository.getAll();
      } catch (error) {
        return rejectWithValue({ 
          message: error instanceof Error ? error.message : 'Failed to fetch students'
        });
      }
    }
  );
  
  export const addStudent = createAsyncThunk<
    Student, 
    Omit<Student, "student_id">, 
    { state: RootState; rejectValue: ApiError }
  >(
    'student/add',
    async (student, { getState, rejectWithValue }) => {
      try {
        const { auth } = getState();
        if (!auth.isAuthenticated) {
          return rejectWithValue({ message: "Unauthorized - Please login first" });
        }
        return await repository.post("/", student);
      } catch (error) {
        return rejectWithValue({ 
          message: error instanceof Error ? error.message : 'Failed to add student'
        });
      }
    }
  );
  
  export const updateStudent = createAsyncThunk<
    Student, 
    { id: number; student: Partial<Student> }, 
    { state: RootState; rejectValue: ApiError }
  >(
    'student/update',
    async ({ id, student }, { getState, rejectWithValue }) => {
      try {
        const { auth } = getState();
        if (!auth.isAuthenticated) {
          return rejectWithValue({ message: "Unauthorized - Please login first" });
        }
        return await repository.put(`/${id}/`, student);
      } catch (error) {
        return rejectWithValue({ 
          message: error instanceof Error ? error.message : 'Failed to update student'
        });
      }
    }
  );
  
  export const deleteStudent = createAsyncThunk<
    number, // Return type (student ID)
    number, // Argument type (student ID)
    { state: RootState; rejectValue: ApiError }
  >(
    'student/delete',
    async (id, { getState, rejectWithValue }) => {
      try {
        const { auth } = getState();
        if (!auth.isAuthenticated) {
          return rejectWithValue({ message: "Unauthorized - Please login first" });
        }
        await repository.delete(`/${id}/`);
        return id;
      } catch (error) {
        return rejectWithValue({ 
          message: error instanceof Error ? error.message : 'Failed to delete student'
        });
      }
    }
  );
  
  export const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        // Fetch Students
        .addCase(fetchStudents.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchStudents.fulfilled, (state, action: PayloadAction<Student[]>) => {
          state.loading = false;
          state.students = action.payload;
        })
        .addCase(fetchStudents.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Failed to fetch students';
        })
        
        // Add Student
        .addCase(addStudent.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(addStudent.fulfilled, (state, action: PayloadAction<Student>) => {
          state.loading = false;
          state.students.push(action.payload);
        })
        .addCase(addStudent.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Failed to add student';
        })
        
        // Update Student
        .addCase(updateStudent.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateStudent.fulfilled, (state, action: PayloadAction<Student>) => {
          state.loading = false;
          const index = state.students.findIndex(s => s.student_id === action.payload.student_id);
          if (index !== -1) {
            state.students[index] = action.payload;
          }
        })
        .addCase(updateStudent.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Failed to update student';
        })
        
        // Delete Student
        .addCase(deleteStudent.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteStudent.fulfilled, (state, action: PayloadAction<number>) => {
          state.loading = false;
          state.students = state.students.filter(s => s.student_id !== action.payload);
        })
        .addCase(deleteStudent.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Failed to delete student';
        });
    },
  });
  
  export default studentSlice.reducer;