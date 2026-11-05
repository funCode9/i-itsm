import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 240;

export default function Layout({ title, children }) {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" color="default" elevation={0}
          sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <Toolbar>
            <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, color: '#1565c0' }}>
              {title}
            </Typography>
            <IconButton onClick={() => navigate('/notifications')}>
              <Notifications />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
