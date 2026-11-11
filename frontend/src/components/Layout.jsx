import React, { useState, useEffect } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Badge, InputBase,
  Button, Chip, Breadcrumbs, Link as MuiLink, Tooltip
} from '@mui/material';
import {
  NotificationsNoneOutlined,
  Search,
  AddOutlined,
  TuneOutlined,
  NavigateNext,
  DarkModeOutlined,
  LightModeOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';
import { notificationApi, adminApi } from '../api';

export default function Layout({ title, breadcrumbs = [], actions, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [unreadCount, setUnreadCount] = useState(0);
  const [strategy, setStrategy] = useState(null);

  useEffect(() => {
    // Fetch unread notifications
    notificationApi.getUnread().then((res) => {
      setUnreadCount(Array.isArray(res.data) ? res.data.length : 0);
    }).catch(() => {});

    // Fetch active strategy if administrator
    if (user?.role === 'ADMINISTRATOR') {
      adminApi.getStrategy().then((res) => {
        setStrategy(res.data?.strategy || res.data);
      }).catch(() => {});
    }
  }, [user]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Operations Bar */}
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            zIndex: (th) => th.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ minHeight: '64px !important', px: 3, gap: 2 }}>
            {/* Breadcrumbs & Title */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Breadcrumbs
                separator={<NavigateNext fontSize="inherit" sx={{ color: '#94a3b8' }} />}
                sx={{ fontSize: '0.75rem', mb: 0.3 }}
              >
                {(breadcrumbs.length > 0 ? breadcrumbs : ['Dashboard']).map((crumb, idx) => (
                  <Typography key={idx} color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    {crumb}
                  </Typography>
                ))}
                <Typography color="text.primary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {title}
                </Typography>
              </Breadcrumbs>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  color: '#15243b',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
            </Box>

            {/* Routing Indicator Badge (Admin) */}
            {strategy && (
              <Tooltip title="Active Auto-Assignment Rule">
                <Chip
                  icon={<TuneOutlined sx={{ fontSize: '14px !important', color: '#4f85c8' }} />}
                  label={`Routing: ${strategy === 'SKILL_BASED' ? 'Skill-Based' : 'Workload-Balanced'}`}
                  size="small"
                  sx={{
                    bgcolor: '#eff6ff',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    height: 26,
                  }}
                />
              </Tooltip>
            )}

            {/* Quick Action Button for Employee */}
            {user?.role === 'EMPLOYEE' && location.pathname !== '/employee/report' && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddOutlined />}
                onClick={() => navigate('/employee/report')}
                sx={{
                  bgcolor: '#4f85c8',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  px: 1.8,
                  py: 0.7,
                  '&:hover': { bgcolor: '#3b70b0' },
                }}
              >
                Report Incident
              </Button>
            )}

            {/* Custom page actions */}
            {actions}

            {/* Theme Mode Toggle (Light/Dark) */}
            <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                  width: 38,
                  height: 38,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                }}
              >
                {mode === 'dark' ? (
                  <LightModeOutlined fontSize="small" sx={{ color: '#f59e0b' }} />
                ) : (
                  <DarkModeOutlined fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {/* Notifications Bell */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={() => navigate('/notifications')}
                sx={{
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                  width: 38,
                  height: 38,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                }}
              >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsNoneOutlined fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Page Content Container */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: 'background.default' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
