import React, { useState } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Alert,
  Link, CircularProgress, MenuItem, Grid
} from '@mui/material';
import { Shield } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '', fullName: '',
    department: '', phone: '', role: 'EMPLOYEE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authAPI.register(form);
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)',
    }}>
      <Paper elevation={8} sx={{ p: 4, width: 500, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Shield sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight="bold" color="primary">Create Account</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Full Name" required value={form.fullName} onChange={set('fullName')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Username" required value={form.username} onChange={set('username')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Email" type="email" required value={form.email} onChange={set('email')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Password" type="password" required value={form.password} onChange={set('password')} inputProps={{ minLength: 6 }} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Department" value={form.department} onChange={set('department')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Phone" value={form.phone} onChange={set('phone')} /></Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Role" value={form.role} onChange={set('role')}>
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Button fullWidth variant="contained" type="submit" size="large"
            sx={{ mt: 3, py: 1.5 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link component="button" onClick={() => navigate('/login')} underline="hover">Sign in</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
