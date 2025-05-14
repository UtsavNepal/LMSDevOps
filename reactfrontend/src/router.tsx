import {
    createBrowserRouter,
    Navigate,
  } from 'react-router-dom';
  import AppLayout from './App';
  import LoginPage from './presentation/pages/mainpage/LoginPage';
  import Dashboard from './presentation/pages/inside page/Dashboard';
  import Author from './presentation/pages/inside page/Author';
  import Book from './presentation/pages/inside page/Book';
  import Student from './presentation/pages/inside page/Student';
  import TransactionList from './presentation/pages/inside page/TransactionList';
  import Issuing from './presentation/pages/inside page/Issuing';
  import { ProtectedRoute } from './route/ProtectedRoute';
  
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/author', element: <Author /> },
            { path: '/book', element: <Book /> },
            { path: '/student', element: <Student /> },
            { path: '/transaction', element: <TransactionList /> },
            { path: '/issuing', element: <Issuing /> },
            { path: '*', element: <Navigate to="/dashboard" replace /> },
          ],
        },
      ],
    },
  ]);
  
  export default router;