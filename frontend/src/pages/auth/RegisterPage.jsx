import React, { useState } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Alert,
  Link, CircularProgress, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    department: '',
    phone: '',
    role: 'EMPLOYEE',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.register(form);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

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
          width: 520,
          maxWidth: '100%',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          bgcolor: '#ffffff',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
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
            Create Employee Account
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Register to submit incidents and track IT resolutions in real-time
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: '8px' }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Full Name *"
                placeholder="Alice Johnson"
                required
                value={form.fullName}
                onChange={setField('fullName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Username *"
                placeholder="alice"
                required
                value={form.username}
                onChange={setField('username')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Work Email *"
                type="email"
                placeholder="alice@itsm.local"
                required
                value={form.email}
                onChange={setField('email')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Password *"
                type="password"
                placeholder="••••••••••••"
                required
                inputProps={{ minLength: 6 }}
                value={form.password}
                onChange={setField('password')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Department"
                placeholder="Operations / Finance"
                value={form.department}
                onChange={setField('department')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Contact Phone"
                placeholder="+1 555-0199"
                value={form.phone}
                onChange={setField('phone')}
              />
            </Grid>
          </Grid>

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.2,
              bgcolor: '#15243b',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.88rem',
              '&:hover': { bgcolor: '#0f1a2b' },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Complete Registration'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2.5, textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link
            component="button"
            onClick={() => navigate('/login')}
            sx={{ color: '#4f85c8', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
