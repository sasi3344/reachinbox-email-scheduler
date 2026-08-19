import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-xs text-slate-400 font-medium">Authenticating ReachInbox Session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setUserFromToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setUserFromToken(token).then(() => {
        navigate('/dashboard', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, setUserFromToken, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      <p className="text-xs text-slate-400 font-medium">Finalizing Google Authentication...</p>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!loading && user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
