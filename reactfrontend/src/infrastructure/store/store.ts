// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.ts';
import studentReducer from './studentSlice.ts';
import dashboardReducer from './dashboardSlice.ts';
import transactionReducer from './transactionSlice.ts';

import bookReducer from './bookSlice.ts';
import authorReducer from './authorSlice.ts'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    dashboard: dashboardReducer,
    transaction: transactionReducer,
    book: bookReducer,
    author: authorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;