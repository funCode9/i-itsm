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
    primary: {
      main: '#15243b',
      light: '#273a56',
      dark: '#0f1a2b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4f85c8',
      light: '#72a0db',
      dark: '#3466a3',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#3b82f6' },
  },
  typography: {
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500, color: '#64748b' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 7,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        },
        root: {
          borderBottom: '1px solid #f1f5f9',
          padding: '12px 16px',
        },
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
