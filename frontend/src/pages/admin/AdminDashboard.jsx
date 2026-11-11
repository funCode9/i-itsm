import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Box, Typography, Button, Select, MenuItem,
  FormControl, InputLabel, Alert, Chip, LinearProgress
} from '@mui/material';
import {
  BugReportOutlined, AssignmentOutlined, SpeedOutlined,
  CheckCircleOutline, WarningAmberOutlined, TuneOutlined,
  PeopleOutline, EngineeringOutlined, RefreshOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import MetricCard from '../../components/MetricCard';
import IncidentQueueTable from '../../components/IncidentQueueTable';
import IncidentDrawer from '../../components/IncidentDrawer';
import { adminApi, incidentApi, technicianApi } from '../../api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIncidents: 0,
    openIncidents: 0,
    criticalIncidents: 0,
    resolvedIncidents: 0,
    slaBreaches: 0,
  });
  const [strategy, setStrategy] = useState('SKILL_BASED');
  const [incidents, setIncidents] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminApi.getDashboard().then((r) => setStats(r.data || {})).catch(() => {}),
      adminApi.getStrategy().then((r) => setStrategy(r.data?.strategy || r.data)).catch(() => {}),
      incidentApi.getAll().then((r) => setIncidents(r.data || [])).catch(() => {}),
      technicianApi.getAll().then((r) => setTechnicians(r.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStrategyChange = async (e) => {
    const val = e.target.value;
    try {
      await adminApi.setStrategy(val);
      setStrategy(val);
      setStatusMsg(`Assignment strategy successfully switched to ${val.replace('_', ' ')}.`);
    } catch {
      setStatusMsg('Failed to update strategy.');
    }
  };

  return (
    <Layout
      title="Operations Console"
      breadcrumbs={['Overview', 'Executive Dashboard']}
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshOutlined />}
          onClick={loadData}
          sx={{ borderColor: '#cbd5e1', color: '#475569' }}
        >
          Refresh Console
        </Button>
      }
    >
      {/* Console Headline */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            color: '#15243b',
            letterSpacing: '-0.02em',
          }}
        >
          Global Operations & IT Service Health
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
          Real-time incident dispatch telemetry, GoF strategy assignment engine, and background SLA monitor.
        </Typography>
      </Box>

      {statusMsg && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setStatusMsg('')}>
          {statusMsg}
        </Alert>
      )}

      {/* Operations Metric Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Total Incidents"
            value={stats.totalIncidents}
            subtitle="Lifetime ticket volume"
            icon={<BugReportOutlined fontSize="small" />}
            color="#4f85c8"
            bgColor="#eff6ff"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Active Queue"
            value={stats.openIncidents}
            subtitle="Under active investigation"
            icon={<AssignmentOutlined fontSize="small" />}
            color="#d97706"
            bgColor="#fffbeb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="P1 Critical"
            value={stats.criticalIncidents}
            subtitle="High business urgency"
            icon={<SpeedOutlined fontSize="small" />}
            color="#dc2626"
            bgColor="#fef2f2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Resolved & Closed"
            value={stats.resolvedIncidents}
            subtitle="Resolved tickets"
            icon={<CheckCircleOutline fontSize="small" />}
            color="#059669"
            bgColor="#ecfdf5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="SLA Breaches"
            value={stats.slaBreaches}
            subtitle="Missed deadline violations"
            icon={<WarningAmberOutlined fontSize="small" />}
            color="#ef4444"
            bgColor="#fef2f2"
          />
        </Grid>
      </Grid>

      {/* Middle Row: Strategy Config & Quick Technician Workload */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Strategy Control Panel */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TuneOutlined sx={{ color: '#4f85c8', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.98rem' }}>
                    Assignment Strategy Pattern Engine
                  </Typography>
                </Box>
                <Chip
                  label={strategy === 'SKILL_BASED' ? 'Strategy A: Skill' : 'Strategy B: Load'}
                  size="small"
                  sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontWeight: 700, fontSize: '0.68rem' }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem', mb: 2 }}>
                Runtime polymorphic algorithm switching (GoF Strategy Pattern). Dictates how incoming classified tickets are distributed across technicians.
              </Typography>

              <FormControl fullWidth size="small">
                <InputLabel>Active Assignment Strategy</InputLabel>
                <Select
                  value={strategy}
                  label="Active Assignment Strategy"
                  onChange={handleStrategyChange}
                  sx={{ fontSize: '0.82rem' }}
                >
                  <MenuItem value="SKILL_BASED">
                    Strategy A: Skill-Based (Domain keyword scoring against specialization)
                  </MenuItem>
                  <MenuItem value="LEAST_LOADED">
                    Strategy B: Least-Loaded (Real-time active ticket count balancing)
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/admin/sla-monitoring')}
                sx={{ fontSize: '0.75rem', borderColor: '#cbd5e1', color: '#475569' }}
              >
                SLA Monitor
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/admin/audit')}
                sx={{ fontSize: '0.75rem', borderColor: '#cbd5e1', color: '#475569' }}
              >
                Audit Trail
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Technician Workload Quick Overview */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EngineeringOutlined sx={{ color: '#059669', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.98rem' }}>
                  Technician Workload Balancing
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate('/admin/technicians')} sx={{ fontSize: '0.75rem' }}>
                Manage All
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {technicians.slice(0, 4).map((tech) => (
                <Box
                  key={tech.id}
                  sx={{
                    p: 1.2,
                    borderRadius: '6px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #edf0f4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>
                      {tech.user?.fullName || tech.user?.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {tech.specialization || 'General IT'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${tech.activeIncidents ?? 0} active`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: (tech.activeIncidents ?? 0) > 3 ? '#fff7ed' : '#f0fdf4',
                        color: (tech.activeIncidents ?? 0) > 3 ? '#c2410c' : '#15803d',
                        border: `1px solid ${(tech.activeIncidents ?? 0) > 3 ? '#fed7aa' : '#bbf7d0'}`,
                      }}
                    />
                    <Chip
                      label={tech.available ? 'Ready' : 'Busy'}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor: tech.available ? '#ecfdf5' : '#f1f5f9',
                        color: tech.available ? '#047857' : '#64748b',
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Global Incident Queue Table */}
      <IncidentQueueTable
        incidents={incidents}
        title="Enterprise Incident Dispatch Queue"
        subtitle="Live multi-tenant queue across all departments with slide-over drawer action triggers"
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        loading={loading}
      />

      {/* Quick Inspection Drawer */}
      <IncidentDrawer
        open={Boolean(selectedIncident)}
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onRefresh={() => {
          loadData();
          if (selectedIncident) {
            incidentApi.getById(selectedIncident.id).then((res) => setSelectedIncident(res.data)).catch(() => {});
          }
        }}
      />
    </Layout>
  );
}
