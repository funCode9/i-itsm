import React from 'react';
import AppLogo from './AppLogo';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Avatar, Chip, IconButton, Tooltip, Divider
} from '@mui/material';
import {
  DashboardOutlined,
  BugReportOutlined,
  AssignmentOutlined,
  PeopleOutline,
  CategoryOutlined,
  MiscellaneousServicesOutlined,
  GppGoodOutlined,
  BarChartOutlined,
  GavelOutlined,
  NotificationsNoneOutlined,
  LogoutOutlined,
  EngineeringOutlined,
  SpeedOutlined,
  AddCircleOutline
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 250;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role;

  const employeeNav = [
    { section: 'Operations' },
    { text: 'Overview', icon: <DashboardOutlined fontSize="small" />, path: '/employee' },
    { text: 'My Incidents', icon: <AssignmentOutlined fontSize="small" />, path: '/employee/incidents' },
    { text: 'Report Incident', icon: <AddCircleOutline fontSize="small" />, path: '/employee/report', highlight: true },
    { section: 'Communication' },
    { text: 'Notifications', icon: <NotificationsNoneOutlined fontSize="small" />, path: '/notifications' },
  ];

  const technicianNav = [
    { section: 'Technician Desk' },
    { text: 'Workbench', icon: <DashboardOutlined fontSize="small" />, path: '/technician' },
    { text: 'Assigned Incidents', icon: <AssignmentOutlined fontSize="small" />, path: '/technician/incidents' },
    { section: 'Communication' },
    { text: 'Notifications', icon: <NotificationsNoneOutlined fontSize="small" />, path: '/notifications' },
  ];

  const adminNav = [
    { section: 'Operations' },
    { text: 'Operations Console', icon: <DashboardOutlined fontSize="small" />, path: '/admin' },
    { text: 'Technicians Workspace', icon: <EngineeringOutlined fontSize="small" />, path: '/admin/technicians' },
    { text: 'User Accounts', icon: <PeopleOutline fontSize="small" />, path: '/admin/users' },
    { section: 'Service Catalog' },
    { text: 'Service Categories', icon: <CategoryOutlined fontSize="small" />, path: '/admin/categories' },
    { text: 'IT Services', icon: <MiscellaneousServicesOutlined fontSize="small" />, path: '/admin/services' },
    { section: 'Compliance & SLA' },
    { text: 'SLA Monitoring', icon: <SpeedOutlined fontSize="small" />, path: '/admin/sla-monitoring' },
    { text: 'SLA Policies', icon: <GppGoodOutlined fontSize="small" />, path: '/admin/sla-config' },
    { text: 'Audit Trail', icon: <GavelOutlined fontSize="small" />, path: '/admin/audit' },
    { text: 'Analytics & Reports', icon: <BarChartOutlined fontSize="small" />, path: '/admin/reports' },
    { section: 'Communication' },
    { text: 'Notifications', icon: <NotificationsNoneOutlined fontSize="small" />, path: '/notifications' },
  ];

  const navItems = role === 'ADMINISTRATOR' ? adminNav : role === 'TECHNICIAN' ? technicianNav : employeeNav;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#15243b',
          color: '#e2e8f0',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Brand Header */}
      <Box sx={{ p: 2.5, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <AppLogo size={32} variant="white" sx={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.05rem',
                letterSpacing: '-0.01em',
              }}
            >
              I-ITSM
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <span className="status-pulse" />
            <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.68rem', fontWeight: 600 }}>
              LIVE
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ color: '#8c99aa', fontSize: '0.72rem', display: 'block' }}>
          Operations & Incident Resolution
        </Typography>
      </Box>

      {/* Navigation List */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5, px: 1.5 }}>
        <List disablePadding>
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <Typography
                  key={idx}
                  variant="caption"
                  sx={{
                    px: 1.5,
                    pt: idx === 0 ? 0.5 : 2,
                    pb: 0.6,
                    display: 'block',
                    textTransform: 'uppercase',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#64748b',
                    letterSpacing: '0.06em',
                  }}
                >
                  {item.section}
                </Typography>
              );
            }

            const active = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.4 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '7px',
                    py: 0.8,
                    px: 1.4,
                    color: active ? '#ffffff' : '#94a3b8',
                    bgcolor: active ? 'rgba(79, 133, 200, 0.18)' : item.highlight ? 'rgba(79, 133, 200, 0.08)' : 'transparent',
                    border: active ? '1px solid rgba(79, 133, 200, 0.35)' : '1px solid transparent',
                    '&:hover': {
                      bgcolor: active ? 'rgba(79, 133, 200, 0.22)' : 'rgba(255,255,255,0.04)',
                      color: '#ffffff',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: active ? '#4f85c8' : item.highlight ? '#60a5fa' : '#64748b',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.82rem',
                      fontWeight: active ? 600 : 500,
                    }}
                  />
                  {item.highlight && (
                    <Chip
                      label="New"
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.62rem',
                        bgcolor: '#4f85c8',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Footer Card */}
      <Box
        sx={{
          p: 1.8,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          bgcolor: 'rgba(0,0,0,0.15)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
            <Avatar
              sx={{
                bgcolor: '#4f85c8',
                width: 34,
                height: 34,
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'white',
              }}
            >
              {user?.fullName?.[0] || user?.username?.[0] || 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: 600,
                  color: '#ffffff',
                  fontSize: '0.8rem',
                }}
              >
                {user?.fullName || user?.username}
              </Typography>
              <Chip
                label={role}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  bgcolor:
                    role === 'ADMINISTRATOR'
                      ? 'rgba(168, 85, 247, 0.2)'
                      : role === 'TECHNICIAN'
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(59, 130, 246, 0.2)',
                  color:
                    role === 'ADMINISTRATOR'
                      ? '#c084fc'
                      : role === 'TECHNICIAN'
                      ? '#4ade80'
                      : '#93c5fd',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </Box>
          </Box>
          <Tooltip title="Sign Out">
            <IconButton
              size="small"
              onClick={logout}
              sx={{
                color: '#94a3b8',
                '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
              }}
            >
              <LogoutOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
}
