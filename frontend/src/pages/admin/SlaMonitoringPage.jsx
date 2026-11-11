import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button
} from '@mui/material';
import {
  SpeedOutlined, WarningAmberOutlined, CheckCircleOutline,
  TimerOutlined, RefreshOutlined
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import MetricCard from '../../components/MetricCard';
import IncidentDrawer from '../../components/IncidentDrawer';
import { adminApi, incidentApi } from '../../api';

export default function SlaMonitoringPage() {
  const [records, setRecords] = useState([]);
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminApi.getSlaAll().then((res) => setRecords(res.data || [])).catch(() => {}),
      adminApi.getSlaBreached().then((res) => setBreaches(res.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDrawerForIncidentId = (incidentId) => {
    if (!incidentId) return;
    incidentApi.getById(incidentId).then((res) => setSelectedIncident(res.data)).catch(() => {});
  };

  return (
    <Layout
      title="SLA Compliance & Monitoring"
      breadcrumbs={['Compliance', 'SLA Health']}
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshOutlined />}
          onClick={loadData}
          sx={{ borderColor: '#cbd5e1', color: '#475569' }}
        >
          Refresh SLA Telemetry
        </Button>
      }
    >
      {/* Metric Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="Tracked SLA Records"
            value={records.length}
            subtitle="Active SLA timers in progress"
            icon={<TimerOutlined fontSize="small" />}
            color="#4f85c8"
            bgColor="#eff6ff"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="SLA Breaches"
            value={breaches.length}
            subtitle="Incidents exceeding resolution deadline"
            icon={<WarningAmberOutlined fontSize="small" />}
            color="#ef4444"
            bgColor="#fef2f2"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="Compliance Target"
            value="98.4%"
            subtitle="Scheduled background scanner (every 60s)"
            icon={<CheckCircleOutline fontSize="small" />}
            color="#059669"
            bgColor="#ecfdf5"
          />
        </Grid>
      </Grid>

      {/* Breached Incidents Paper */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '10px',
          border: '1px solid #fecaca',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          mb: 3.5,
        }}
      >
        <Box sx={{ p: 2.2, borderBottom: '1px solid #fee2e2', bgcolor: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberOutlined sx={{ color: '#dc2626', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: '#991b1b' }}>
              Breached SLA Violations ({breaches.length})
            </Typography>
          </Box>
          <Chip
            label={breaches.length === 0 ? 'Zero Breaches' : 'Action Required'}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.68rem',
              bgcolor: breaches.length === 0 ? '#ecfdf5' : '#ef4444',
              color: breaches.length === 0 ? '#047857' : 'white',
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fef2f2' }}>
                <TableCell sx={{ color: '#991b1b', fontWeight: 700 }}>Incident #</TableCell>
                <TableCell sx={{ color: '#991b1b', fontWeight: 700 }}>Response Deadline</TableCell>
                <TableCell sx={{ color: '#991b1b', fontWeight: 700 }}>Resolution Deadline</TableCell>
                <TableCell sx={{ color: '#991b1b', fontWeight: 700 }}>Response Breached?</TableCell>
                <TableCell sx={{ color: '#991b1b', fontWeight: 700 }}>Resolution Breached?</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {breaches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#059669', fontWeight: 500 }}>
                    🎯 No SLA breaches detected across active incidents!
                  </TableCell>
                </TableRow>
              ) : (
                breaches.map((b) => (
                  <TableRow
                    key={b.id}
                    hover
                    onClick={() => openDrawerForIncidentId(b.incident?.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#dc2626' }}>
                      {b.incident?.incidentNumber || '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{new Date(b.responseDeadline).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{new Date(b.resolutionDeadline).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={b.responseBreached ? 'BREACHED' : 'OK'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: b.responseBreached ? '#fef2f2' : '#ecfdf5',
                          color: b.responseBreached ? '#b91c1c' : '#047857',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={b.resolutionBreached ? 'BREACHED' : 'OK'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: b.resolutionBreached ? '#fef2f2' : '#ecfdf5',
                          color: b.resolutionBreached ? '#b91c1c' : '#047857',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* All Active Tracked Records Paper */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.2, borderBottom: '1px solid #edf0f4' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: '#15243b' }}>
            All Active Tracked Incident SLAs ({records.length})
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Continuous monitoring by SlaMonitoringService background worker
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Incident #</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Response Deadline</TableCell>
                <TableCell>Resolution Deadline</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                    No SLA tracking records available.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    onClick={() => openDrawerForIncidentId(r.incident?.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#4f85c8' }}>
                      {r.incident?.incidentNumber || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.status}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor:
                            r.status === 'BREACHED'
                              ? '#fef2f2'
                              : r.status === 'APPROACHING'
                              ? '#fffbeb'
                              : '#ecfdf5',
                          color:
                            r.status === 'BREACHED'
                              ? '#b91c1c'
                              : r.status === 'APPROACHING'
                              ? '#b45309'
                              : '#047857',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{new Date(r.responseDeadline).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{new Date(r.resolutionDeadline).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Slide-over Inspection Drawer */}
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
