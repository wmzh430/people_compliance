import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthContext } from './useAuthContext';

const RequireAuth = () => {
  const { currentUser, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return currentUser ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/login" state={{ from: location }} replace />
  );
};

export { RequireAuth };
