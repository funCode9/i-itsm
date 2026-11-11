import React, { useState } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Alert,
  Link, CircularProgress, InputAdornment, IconButton, Chip
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, PersonOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError(err.response?.data?.error || err.response?.data?.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (username, password) => {
    setForm({ username, password });
    setError('');
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
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              bgcolor: '#15243b',
              color: 'white',
              display: 'inline-grid',
              placeItems: 'center',
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              fontSize: '1.4rem',
              mb: 1.5,
            }}
          >
            i
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
            I-ITSM Operations Console
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mt: 0.5 }}>
            <span className="status-pulse" />
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '0.72rem' }}>
              System Operational & Dispatch Ready
            </Typography>
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
              placeholder="Enter your username"
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

        {/* 1-Click Demo Accounts */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #edf0f4' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1, textTransform: 'uppercase', fontSize: '0.65rem' }}>
            Quick Demo Autofill Credentials:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
            <Chip
              label="Admin (admin)"
              size="small"
              onClick={() => fillQuickDemo('admin', 'Admin@123')}
              sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' }}
            />
            <Chip
              label="Tech: Alex (tech_alex)"
              size="small"
              onClick={() => fillQuickDemo('tech_alex', 'Tech@123')}
              sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' }}
            />
            <Chip
              label="Employee: Alice (alice)"
              size="small"
              onClick={() => fillQuickDemo('alice', 'Emp@123')}
              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' }}
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
