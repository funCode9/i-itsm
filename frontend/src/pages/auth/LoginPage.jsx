import React, { useState } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Alert,
  Link, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Shield } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authAPI.login(form);
      const { token, username, role, userId, fullName } = res.data;
      login({ username, role, userId, fullName }, token);
      if (role === 'ADMINISTRATOR') navigate('/admin');
      else if (role === 'TECHNICIAN') navigate('/technician');
      else navigate('/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)',
    }}>
      <Paper elevation={8} sx={{ p: 4, width: 400, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Shield sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight="bold" color="primary">I-ITSM</Typography>
          <Typography variant="body2" color="text.secondary">
            Intelligent IT Service Management
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Username" margin="normal" required
            value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          <TextField fullWidth label="Password" margin="normal" required
            type={showPass ? 'text' : 'password'}
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass(!showPass)}>
                    {showPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }} />
          <Button fullWidth variant="contained" type="submit" size="large"
            sx={{ mt: 2, py: 1.5 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link component="button" onClick={() => navigate('/register')} underline="hover">
            Register here
          </Link>
        </Typography>

        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Default admin: <strong>admin / Admin@123</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Sample tech: <strong>tech.network / Tech@123</strong>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
