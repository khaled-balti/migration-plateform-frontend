import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import { RepositoriesPage } from './pages/Repositories';
import { PipelinesPage } from './pages/Pipelines';
import { PipelineApprovalPage } from './pages/PipelineApproval';
import { CredentialsPage } from './pages/Credentials';
import { UsersPage } from './pages/Users';
import { HistoryPage } from './pages/History';
import { SettingsPage } from './pages/Settings';
import { LoginPage } from './pages/Login';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { VerifyOTPPage } from './pages/VerifyOTP';
import { ResetPasswordPage } from './pages/ResetPassword';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RepositoryDetails } from './pages/RepositoryDetails';
import { PipelineDetails } from './pages/PipelineDetails';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="migration-ui-theme">
      <AuthProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Sidebar />}>
              <Route index element={<Navigate to="/history/all" replace />} />
              
              <Route path="repositories" element={<ProtectedRoute requiredPermission="repositories" />}>
                <Route index element={<Navigate to="migrated" replace />} />
                <Route path="migrated" element={<RepositoriesPage type="migrated" />} />
                <Route path="waiting" element={<RepositoriesPage type="waiting" />} />
                <Route path="details/:id" element={<RepositoryDetails />} />
              </Route>

              <Route path="pipelines" element={<ProtectedRoute requiredPermission="pipelines" />}>
                <Route index element={<Navigate to="migrated" replace />} />
                <Route path="migrated" element={<PipelinesPage type="migrated" />} />
                <Route path="waiting" element={<PipelinesPage type="waiting" />} />
                <Route path="approve/:id" element={<PipelineApprovalPage />} />
                <Route path="details/:id" element={<PipelineDetails />} />
              </Route>

              <Route path="history">
                <Route index element={<Navigate to="all" replace />} />
                <Route path="all" element={<HistoryPage type="all" />} />
                <Route path="my" element={<HistoryPage type="my" />} />
              </Route>

              <Route path="credentials" element={<ProtectedRoute requiredPermission="credentials" />}>
                <Route index element={<Navigate to="migrated" replace />} />
                <Route path="migrated" element={<CredentialsPage type="migrated" />} />
                <Route path="waiting" element={<CredentialsPage type="waiting" />} />
              </Route>
              
              <Route path="users" element={<ProtectedRoute requiredPermission="users"><UsersPage /></ProtectedRoute>} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
