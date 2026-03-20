import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AuthGuard = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/login" replace />;

  return children;
};

export default AuthGuard;
