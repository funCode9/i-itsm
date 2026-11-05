import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ReportIncident from './pages/employee/ReportIncident';
import MyIncidents from './pages/employee/MyIncidents';
import IncidentDetail from './pages/shared/IncidentDetail';
import NotificationsPage from './pages/shared/NotificationsPage';

// Technician Pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import AssignedIncidents from './pages/technician/AssignedIncidents';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import ServicesPage from './pages/admin/ServicesPage';
import SlaConfigPage from './pages/admin/SlaConfigPage';
import ReportsPage from './pages/admin/ReportsPage';
import AuditPage from './pages/admin/AuditPage';
import SlaMonitoringPage from './pages/admin/SlaMonitoringPage';
import TechniciansPage from './pages/admin/TechniciansPage';

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    secondary: { main: '#e53935' },
    background: { default: '#f0f2f5' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'ADMINISTRATOR') return <Navigate to="/admin" />;
  if (user.role === 'TECHNICIAN') return <Navigate to="/technician" />;
  return <Navigate to="/employee" />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<RoleRouter />} />

            {/* Employee */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee/report" element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <ReportIncident />
              </ProtectedRoute>
            } />
            <Route path="/employee/incidents" element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <MyIncidents />
              </ProtectedRoute>
            } />

            {/* Technician */}
            <Route path="/technician" element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <TechnicianDashboard />
              </ProtectedRoute>
            } />
            <Route path="/technician/incidents" element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <AssignedIncidents />
              </ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/technicians" element={
              <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                <TechniciansPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                <CategoriesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/services" element={
              <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                <ServicesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/sla-config" element={
              <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                <SlaConfigPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/sla-monitoring" element={
              <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                <SlaMonitoringPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit" element={
              <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                <AuditPage />
              </ProtectedRoute>
            } />

            {/* Shared */}
            <Route path="/incidents/:id" element={
              <ProtectedRoute>
                <IncidentDetail />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
