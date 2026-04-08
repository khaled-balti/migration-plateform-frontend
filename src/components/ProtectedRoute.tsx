import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthContext';

interface ProtectedRouteProps {
  requiredPermission?: string;
  children?: React.ReactNode;
}

export function ProtectedRoute({ requiredPermission, children }: ProtectedRouteProps) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-[#12121e]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !user.permissions.includes(requiredPermission)) {
    // If they lack the specific permission, redirect to history/all
    return <Navigate to="/history/all" replace />;
  }

  // If there's a child element, render it. Otherwise, render nested routes via Outlet.
  return children ? <>{children}</> : <Outlet />;
}
