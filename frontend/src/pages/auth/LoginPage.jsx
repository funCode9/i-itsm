import React, { useState, useEffect } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Alert,
  Link, CircularProgress, InputAdornment, IconButton, Chip
} from '@mui/material';
import {
  Visibility, VisibilityOff, LockOutlined, PersonOutline,
  CloudDoneOutlined, CloudQueueOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppLogo from '../../components/AppLogo';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverState, setServerState] = useState('checking'); // 'checking' | 'ready' | 'waking'

  // Pre-warm backend and verify live connection
  useEffect(() => {
    let active = true;
    const prewarm = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 2000)
        );
        await Promise.race([authApi.health(), timeoutPromise]);
        if (active) setServerState('ready');
      } catch {
        if (active) setServerState('waking');
        try {
          await authApi.health();
          if (active) setServerState('ready');
        } catch {
          if (active) setServerState('waking');
        }
      }
    };
    prewarm();
    return () => { active = false; };
  }, []);

  const handleQuickFill = (username, password) => {
    setForm({ username, password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Please provide both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(form);
      const { token, username, role, userId, fullName } = res.data;
      login({ username, role, userId, fullName }, token);
      if (role === 'ADMINISTRATOR') navigate('/admin');
      else if (role === 'TECHNICIAN') navigate('/technician');
      else navigate('/employee');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server is taking longer to respond (cloud instance waking up). Please click Sign In again in a few moments.');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password credentials. Click one of the Quick Demo Profiles below to sign in.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Authentication failed. Please verify credentials or try a Quick Profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0f1a2b',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #1e314d 0%, #0f1a2b 75%)',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4.5 },
          width: 440,
          maxWidth: '100%',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          bgcolor: '#ffffff',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
            <AppLogo size={52} variant="blue" />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              color: '#15243b',
              letterSpacing: '-0.02em',
            }}
          >
            I-ITSM
          </Typography>
          <Box sx={{ mt: 1, display: 'inline-flex', alignItems: 'center', gap: 0.8 }}>
            {serverState === 'ready' ? (
              <Chip
                icon={<CloudDoneOutlined sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
                label="Backend: Online & Ready"
                size="small"
                sx={{
                  bgcolor: '#f0fdf4',
                  color: '#15803d',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  height: 22,
                  border: '1px solid #bbf7d0',
                }}
              />
            ) : serverState === 'waking' ? (
              <Chip
                icon={<CircularProgress size={10} sx={{ color: '#d97706' }} />}
                label="Waking Up Cloud Server..."
                size="small"
                sx={{
                  bgcolor: '#fffbeb',
                  color: '#b45309',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  height: 22,
                  border: '1px solid #fde68a',
                }}
              />
            ) : (
              <Chip
                icon={<CloudQueueOutlined sx={{ fontSize: '14px !important', color: '#64748b !important' }} />}
                label="Connecting to Service..."
                size="small"
                sx={{
                  bgcolor: '#f8fafc',
                  color: '#64748b',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  height: 22,
                  border: '1px solid #e2e8f0',
                }}
              />
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px', fontSize: '0.82rem' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', display: 'block', mb: 0.5 }}>
              Username or ID
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. admin or user1"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline fontSize="small" sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              required
            />
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', display: 'block', mb: 0.5 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              size="small"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined fontSize="small" sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              bgcolor: '#15243b',
              color: 'white',
              py: 1.2,
              fontWeight: 600,
              fontSize: '0.88rem',
              '&:hover': { bgcolor: '#0f1a2b' },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Authenticate & Sign In'}
          </Button>
        </form>

        {/* Quick Demo Profiles for Instant Login */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #edf0f4' }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#64748b',
              display: 'block',
              mb: 1.2,
              textTransform: 'uppercase',
              fontSize: '0.68rem',
              letterSpacing: '0.04em',
            }}
          >
            Quick Demo Profiles (One-Click Fill)
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            <Chip
              label="👑 Admin"
              onClick={() => handleQuickFill('admin', 'Admin@123')}
              size="small"
              clickable
              sx={{
                bgcolor: '#eff6ff',
                color: '#1e40af',
                fontWeight: 600,
                border: '1px solid #bfdbfe',
                fontSize: '0.74rem',
                '&:hover': { bgcolor: '#dbeafe' },
              }}
            />
            <Chip
              label="🛠️ Technician"
              onClick={() => handleQuickFill('tech.network', 'Tech@123')}
              size="small"
              clickable
              sx={{
                bgcolor: '#f5f3ff',
                color: '#6b21a8',
                fontWeight: 600,
                border: '1px solid #ddd6fe',
                fontSize: '0.74rem',
                '&:hover': { bgcolor: '#ede9fe' },
              }}
            />
            <Chip
              label="👤 Employee"
              onClick={() => handleQuickFill('user1', 'User@123')}
              size="small"
              clickable
              sx={{
                bgcolor: '#ecfdf5',
                color: '#047857',
                fontWeight: 600,
                border: '1px solid #a7f3d0',
                fontSize: '0.74rem',
                '&:hover': { bgcolor: '#d1fae5' },
              }}
            />
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mt: 2.5, textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          Need a new employee account?{' '}
          <Link
            component="button"
            onClick={() => navigate('/register')}
            sx={{ color: '#4f85c8', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Register Here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
