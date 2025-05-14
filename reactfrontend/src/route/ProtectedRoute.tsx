import { useSelector } from 'react-redux';
import { RootState } from '../infrastructure/store/store';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (location.pathname === '/login/') {
    if (isAuthenticated) {

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    return <Outlet />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};