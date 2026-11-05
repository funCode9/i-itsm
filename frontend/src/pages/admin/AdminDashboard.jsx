import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import { BugReport, Assignment, Warning, CheckCircle, Settings, People, Engineering } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { adminAPI } from '../../api';

function StatCard({ title, value, icon, color }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>{value ?? 0}</Typography>
          </Box>
          <Box sx={{ bgcolor: color + '20', p: 1.5, borderRadius: 2 }}>
            {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIncidents: 0,
    openIncidents: 0,
    criticalIncidents: 0,
    resolvedIncidents: 0,
    slaBreaches: 0
  });
  const [strategy, setStrategy] = useState('SKILL_BASED');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    adminAPI.getDashboard().then(res => setStats(res.data)).catch(() => {});
    adminAPI.getStrategy().then(res => setStrategy(res.data.strategy)).catch(() => {});
  }, []);

  const handleStrategyChange = async (e) => {
    const val = e.target.value;
    try {
      await adminAPI.setStrategy(val);
      setStrategy(val);
      setStatusMsg(`Assignment strategy successfully switched to ${val.replace('_', ' ')}.`);
    } catch {
      setStatusMsg('Failed to update strategy.');
    }
  };

  return (
    <Layout title="Administrator Dashboard">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">I-ITSM System Overview</Typography>
        <Typography variant="body2" color="text.secondary">Global Incident Operations & SLA Health</Typography>
      </Box>

      {statusMsg && <Alert severity="info" sx={{ mb: 3 }} onClose={() => setStatusMsg('')}>{statusMsg}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Total Incidents" value={stats.totalIncidents} icon={<BugReport />} color="#1565c0" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Open Incidents" value={stats.openIncidents} icon={<Assignment />} color="#f57c00" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Critical (P1)" value={stats.criticalIncidents} icon={<Warning />} color="#c62828" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Resolved" value={stats.resolvedIncidents} icon={<CheckCircle />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="SLA Breaches" value={stats.slaBreaches} icon={<Warning />} color="#d32f2f" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings color="primary" /> Assignment Strategy Pattern Config
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Dynamic strategy selection (GoF Strategy Pattern). Changes technician distribution behavior in real-time.
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Active Strategy</InputLabel>
                <Select value={strategy} label="Active Strategy" onChange={handleStrategyChange}>
                  <MenuItem value="SKILL_BASED">Strategy A: Skill-Based (Keyword & Domain Match)</MenuItem>
                  <MenuItem value="LEAST_LOADED">Strategy B: Least-Loaded (Active Load Balancing)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" startIcon={<People />} onClick={() => navigate('/admin/users')}>
                  Manage Users
                </Button>
                <Button variant="outlined" startIcon={<Engineering />} onClick={() => navigate('/admin/technicians')}>
                  Technicians
                </Button>
                <Button variant="outlined" onClick={() => navigate('/admin/sla-monitoring')}>
                  SLA Violations
                </Button>
                <Button variant="contained" onClick={() => navigate('/admin/reports')}>
                  Analytics & Reports
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}
