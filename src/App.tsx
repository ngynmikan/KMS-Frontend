import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { StaffPage } from './pages/StaffPage';
import { ClassesPage } from './pages/ClassesPage';
import { SchedulePage } from './pages/SchedulePage';
import { MenuPage } from './pages/MenuPage';
import { BillingPage } from './pages/BillingPage';
import { AccountManagementPage } from './pages/AccountManagementPage';
import { HealthPage } from './pages/HealthPage';
import { MainLayout } from './components/layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="accounts" element={<AccountManagementPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
