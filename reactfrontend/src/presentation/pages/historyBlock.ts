import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../infrastructure/store/store';

export const usePreventBackNavigation = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleBackButton = (e: PopStateEvent) => {
      console.log(e);
      if (window.location.pathname === '/login') {
        navigate('/dashboard', { replace: true });
      }
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isAuthenticated, navigate]);
};