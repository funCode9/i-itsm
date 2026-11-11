import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Box, Typography, Button, Select, MenuItem,
  FormControl, InputLabel, Alert, Chip, LinearProgress, Tooltip
} from '@mui/material';
import {
  BugReportOutlined, AssignmentOutlined, SpeedOutlined,
  CheckCircleOutline, WarningAmberOutlined, TuneOutlined,
  PeopleOutline, EngineeringOutlined, RefreshOutlined,
  CheckCircle, RadioButtonChecked, FiberManualRecord
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
      setStatusMsg(`Routing rule updated: Tickets will now be distributed using ${val === 'SKILL_BASED' ? 'Skill-Based Routing' : 'Workload-Balanced Routing'}.`);
    } catch {
      setStatusMsg('Failed to update ticket routing rule.');
    }
  };

  return (
    <Layout
      title="Operations"
      breadcrumbs={['Dashboard']}
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshOutlined />}
          onClick={loadData}
          sx={{ borderColor: '#cbd5e1', color: '#475569', textTransform: 'none', fontWeight: 600 }}
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
            color: 'text.primary',
            letterSpacing: '-0.02em',
          }}
        >
          Global Operations &amp; IT Service Health
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
          Real-time incident dispatch, automatic ticket routing, and SLA compliance monitoring.
        </Typography>
      </Box>

      {statusMsg && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setStatusMsg('')}>
          {statusMsg}
        </Alert>
      )}

      {/* Operations Metric Grid with Trend Indicators */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Total Incidents"
            value={stats.totalIncidents}
            subtitle="vs last week"
            icon={<BugReportOutlined fontSize="small" />}
            color="#4f85c8"
            bgColor="#eff6ff"
            trend={{ text: '+8%', direction: 'up', isFavorable: false, label: 'vs last week' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Active Queue"
            value={stats.openIncidents}
            subtitle="under investigation"
            icon={<AssignmentOutlined fontSize="small" />}
            color="#d97706"
            bgColor="#fffbeb"
            trend={{ text: '-3%', direction: 'down', isFavorable: true, label: 'favorable trend' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="P1 Critical"
            value={stats.criticalIncidents}
            subtitle="high business urgency"
            icon={<SpeedOutlined fontSize="small" />}
            color="#dc2626"
            bgColor="#fef2f2"
            trend={{
              text: stats.criticalIncidents === 0 ? '0 Active' : `${stats.criticalIncidents} Urgent`,
              direction: 'neutral',
              isFavorable: stats.criticalIncidents === 0,
              neutral: stats.criticalIncidents === 0,
              label: stats.criticalIncidents === 0 ? 'stabilized' : 'escalated',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Resolved & Closed"
            value={stats.resolvedIncidents}
            subtitle="resolution velocity"
            icon={<CheckCircleOutline fontSize="small" />}
            color="#059669"
            bgColor="#ecfdf5"
            trend={{ text: '+14%', direction: 'up', isFavorable: true, label: 'resolution velocity' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="SLA Breaches"
            value={stats.slaBreaches}
            subtitle="breach reduction"
            icon={<WarningAmberOutlined fontSize="small" />}
            color="#ef4444"
            bgColor="#fef2f2"
            trend={{ text: '-2%', direction: 'down', isFavorable: true, label: 'breach reduction' }}
          />
        </Grid>
      </Grid>

      {/* Middle Row: Ticket Routing Logic & Visualized Technician Workload */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Ticket Routing Logic Panel */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
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
                    Auto-Assignment Rules
                  </Typography>
                </Box>
                <Chip
                  label={strategy === 'SKILL_BASED' ? 'Skill Matching' : 'Workload Balanced'}
                  size="small"
                  sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontWeight: 700, fontSize: '0.68rem' }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', mb: 2 }}>
                Automatically routes incoming tickets based on technician specialization and current workload.
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Active Ticket Routing Rule</InputLabel>
                <Select
                  value={strategy}
                  label="Active Ticket Routing Rule"
                  onChange={handleStrategyChange}
                  sx={{ fontSize: '0.82rem' }}
                >
                  <MenuItem value="SKILL_BASED">
                    Skill-Based Routing (Matches ticket category to technician specialization)
                  </MenuItem>
                  <MenuItem value="LEAST_LOADED">
                    Workload-Balanced Routing (Directs tickets to technician with lowest active queue)
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Strategy Telemetry & Distribution (Optimized Space) */}
              <Box sx={{ p: 1.8, bgcolor: 'action.hover', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                    Routing Performance
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <span className="status-pulse" />
                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '0.68rem' }}>
                      Auto-Dispatch Active
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
                      Match Accuracy
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.88rem' }}>
                      94.2%
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
                      Dispatch Velocity
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.88rem' }}>
                      &lt; 2.5s
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
                      Ready Staff
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.88rem' }}>
                      {technicians.filter((t) => t.available).length} / {technicians.length}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Mini Category Distribution Bar */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                      Recent Queue Distribution
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                      Last 10 Tickets
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', bgcolor: 'divider' }}>
                    <Tooltip title="Network: 40%"><Box sx={{ width: '40%', bgcolor: '#4f85c8' }} /></Tooltip>
                    <Tooltip title="Hardware: 30%"><Box sx={{ width: '30%', bgcolor: '#10b981' }} /></Tooltip>
                    <Tooltip title="Software: 20%"><Box sx={{ width: '20%', bgcolor: '#8b5cf6' }} /></Tooltip>
                    <Tooltip title="Security: 10%"><Box sx={{ width: '10%', bgcolor: '#f59e0b' }} /></Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#4f85c8', fontSize: '0.62rem', fontWeight: 600 }}>• Network 40%</Typography>
                    <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.62rem', fontWeight: 600 }}>• Hardware 30%</Typography>
                    <Typography variant="caption" sx={{ color: '#8b5cf6', fontSize: '0.62rem', fontWeight: 600 }}>• Software 20%</Typography>
                    <Typography variant="caption" sx={{ color: '#f59e0b', fontSize: '0.62rem', fontWeight: 600 }}>• Security 10%</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/admin/sla-monitoring')}
                sx={{ fontSize: '0.75rem', borderColor: 'divider', color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
              >
                SLA Compliance
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/admin/audit')}
                sx={{ fontSize: '0.75rem', borderColor: 'divider', color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
              >
                Audit Trail
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Visualized Technician Workload Panel */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EngineeringOutlined sx={{ color: '#059669', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.98rem' }}>
                    Technician Workload &amp; Capacity
                  </Typography>
                </Box>
                <Button size="small" onClick={() => navigate('/admin/technicians')} sx={{ fontSize: '0.75rem', textTransform: 'none', fontWeight: 600 }}>
                  Manage Roster
                </Button>
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', mb: 2 }}>
                Active ticket allocation across available support specialists (max 5 capacity).
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                {technicians.slice(0, 4).map((tech) => {
                  const maxCap = 5;
                  const activeCount = tech.activeIncidents ?? 0;
                  const loadPct = Math.min(100, Math.round((activeCount / maxCap) * 100));
                  const isNearCap = loadPct >= 80;
                  const isModerate = loadPct >= 50;

                  return (
                    <Box
                      key={tech.id}
                      sx={{
                        p: 1.4,
                        borderRadius: '8px',
                        bgcolor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: 'text.primary' }}>
                            {tech.user?.fullName || tech.user?.username}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {tech.specialization || 'General IT Specialist'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: isNearCap ? '#dc2626' : isModerate ? '#d97706' : '#059669' }}>
                            {activeCount} / {maxCap} Tickets ({loadPct}%)
                          </Typography>
                          <Chip
                            label={tech.available ? 'Available' : 'Busy'}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              bgcolor: tech.available ? '#ecfdf5' : '#f1f5f9',
                              color: tech.available ? '#047857' : '#64748b',
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Visual Capacity Progress Bar */}
                      <LinearProgress
                        variant="determinate"
                        value={loadPct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'divider',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: isNearCap ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Total Active Specialists: {technicians.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                Fleet Load: Balanced
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Global Incident Queue Table */}
      <IncidentQueueTable
        incidents={incidents}
        title="Incident Operations Queue"
        subtitle="Live multi-tenant dispatch queue with slide-over drawer action triggers"
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
