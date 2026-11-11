import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Button, Paper } from '@mui/material';
import {
  AssignmentOutlined, CheckCircleOutline, HourglassEmptyOutlined,
  SpeedOutlined, RefreshOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import MetricCard from '../../components/MetricCard';
import IncidentQueueTable from '../../components/IncidentQueueTable';
import IncidentDrawer from '../../components/IncidentDrawer';
import { technicianApi, incidentApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const loadData = () => {
    setLoading(true);
    technicianApi.getMyIncidents()
      .then((r) => setIncidents(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openIncidents = incidents.filter(i => !['RESOLVED', 'VERIFIED', 'CLOSED'].includes(i.status));
  const inProgressIncidents = incidents.filter(i => i.status === 'IN_PROGRESS');
  const resolvedIncidents = incidents.filter(i => ['RESOLVED', 'VERIFIED', 'CLOSED'].includes(i.status));
  const criticalIncidents = incidents.filter(i => i.priority === 'P1_CRITICAL' && !['RESOLVED', 'VERIFIED', 'CLOSED'].includes(i.status));

  return (
    <Layout
      title="Technician Workbench"
      breadcrumbs={['Technician', 'Workbench']}
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshOutlined />}
          onClick={loadData}
          sx={{ borderColor: '#cbd5e1', color: '#475569' }}
        >
          Refresh Queue
        </Button>
      }
    >
      {/* Header Info */}
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
          Technician Workbench — {user?.fullName || user?.username} 👨‍💻
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
          Manage your assigned incident tickets, log diagnostic solutions, acknowledge SLAs, and resolve escalations.
        </Typography>
      </Box>

      {/* Metric Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Assigned Queue"
            value={openIncidents.length}
            subtitle="Pending acknowledgment or investigation"
            icon={<AssignmentOutlined fontSize="small" />}
            color="#4f85c8"
            bgColor="#eff6ff"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="In Progress"
            value={inProgressIncidents.length}
            subtitle="Actively troubleshooting"
            icon={<HourglassEmptyOutlined fontSize="small" />}
            color="#d97706"
            bgColor="#fffbeb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Resolved Tickets"
            value={resolvedIncidents.length}
            subtitle="Completed resolutions"
            icon={<CheckCircleOutline fontSize="small" />}
            color="#059669"
            bgColor="#ecfdf5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="P1 Critical"
            value={criticalIncidents.length}
            subtitle="Strict 30m SLA resolution target"
            icon={<SpeedOutlined fontSize="small" />}
            color="#dc2626"
            bgColor="#fef2f2"
          />
        </Grid>
      </Grid>

      {/* Queue Table */}
      <IncidentQueueTable
        incidents={incidents}
        title="Your Assigned Incident Queue"
        subtitle="Click any row to acknowledge, append diagnostic notes, and record official resolutions"
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
