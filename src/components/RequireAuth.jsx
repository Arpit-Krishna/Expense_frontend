import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../lib/api';

export default function RequireAuth({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
}
