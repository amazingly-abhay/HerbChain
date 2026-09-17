import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BatchProvider } from '@/contexts/BatchContext';

import AppLayout from '@/components/layout/AppLayout';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import BatchesPage from '@/pages/BatchesPage';
import BatchDetailPage from '@/pages/BatchDetailPage';
import CreateBatchPage from '@/pages/CreateBatchPage';
import AIAnalysisPage from '@/pages/AIAnalysisPage';
import ActorsPage from '@/pages/ActorsPage';
import VerifyPage from '@/pages/VerifyPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <BatchProvider>
            <Toaster position="top-right" />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/verify/:batchId" element={<VerifyPage />} />

              {/* Protected Routes wrapped in Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="batches" element={<BatchesPage />} />
                <Route path="batches/create" element={<CreateBatchPage />} />
                <Route path="batches/:batchId" element={<BatchDetailPage />} />
                <Route path="ai-analysis" element={<AIAnalysisPage />} />
                <Route path="actors" element={<ActorsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BatchProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
