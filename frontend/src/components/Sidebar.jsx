import React from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  ListItemButton, Box, Typography, Divider, Avatar, Chip
} from '@mui/material';
import {
  Dashboard, BugReport, Assignment, People, Category,
  MiscellaneousServices, GppGood, BarChart, Gavel,
  Notifications, Logout, Computer, Engineering
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;

function getMenuItems(role) {
  if (role === 'EMPLOYEE') return [
    { text: 'Dashboard', icon: <Dashboard />, path: '/employee' },
    { text: 'Report Incident', icon: <BugReport />, path: '/employee/report' },
    { text: 'My Incidents', icon: <Assignment />, path: '/employee/incidents' },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
  ];
  if (role === 'TECHNICIAN') return [
    { text: 'Dashboard', icon: <Dashboard />, path: '/technician' },
    { text: 'Assigned Incidents', icon: <Assignment />, path: '/technician/incidents' },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
  ];
  if (role === 'ADMINISTRATOR') return [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Technicians', icon: <Engineering />, path: '/admin/technicians' },
    { text: 'Categories', icon: <Category />, path: '/admin/categories' },
    { text: 'Services', icon: <MiscellaneousServices />, path: '/admin/services' },
    { text: 'SLA Config', icon: <GppGood />, path: '/admin/sla-config' },
    { text: 'SLA Monitoring', icon: <Computer />, path: '/admin/sla-monitoring' },
    { text: 'Reports', icon: <BarChart />, path: '/admin/reports' },
    { text: 'Audit Log', icon: <Gavel />, path: '/admin/audit' },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
  ];
  return [];
}

const ROLE_COLORS = {
  EMPLOYEE: '#1565c0',
  TECHNICIAN: '#2e7d32',
  ADMINISTRATOR: '#6a1b9a',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = getMenuItems(user?.role);
  const color = ROLE_COLORS[user?.role] || '#1565c0';

  return (
    <Drawer variant="permanent" sx={{
      width: DRAWER_WIDTH,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: DRAWER_WIDTH,
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #1a237e 0%, #0d47a1 100%)',
        color: 'white',
      },
    }}>
      {/* Header */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" fontWeight="bold" color="white">
          🛡️ I-ITSM
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          IT Service Management
        </Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>
            {user?.fullName?.[0] || user?.username?.[0] || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold" color="white" noWrap>
              {user?.fullName || user?.username}
            </Typography>
            <Chip label={user?.role} size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.65rem', height: 18 }} />
          </Box>
        </Box>
      </Box>

      {/* Nav Items */}
      <List sx={{ flex: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1, borderRadius: 2, mb: 0.5,
                  bgcolor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}>
                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 700 : 400,
                    color: 'white'
                  }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={logout} sx={{ mx: 1, borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,0,0,0.15)' } }}>
            <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 36 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
