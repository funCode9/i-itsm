import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Button, Paper } from '@mui/material';
import {
  BugReportOutlined, CheckCircleOutline, HourglassEmptyOutlined,
  WarningAmberOutlined, AddOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import MetricCard from '../../components/MetricCard';
import IncidentQueueTable from '../../components/IncidentQueueTable';
import IncidentDrawer from '../../components/IncidentDrawer';
import { incidentApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const loadData = () => {
    incidentApi.getMy()
      .then((r) => setIncidents(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openIncidents = incidents.filter(i => !['RESOLVED', 'VERIFIED', 'CLOSED'].includes(i.status));
  const resolvedIncidents = incidents.filter(i => ['RESOLVED', 'VERIFIED', 'CLOSED'].includes(i.status));
  const criticalIncidents = incidents.filter(i => i.priority === 'P1_CRITICAL');

  return (
    <Layout
      title="Employee Portal"
      breadcrumbs={['Dashboard']}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<AddOutlined />}
          onClick={() => navigate('/employee/report')}
          sx={{ bgcolor: '#4f85c8', '&:hover': { bgcolor: '#3b70b0' } }}
        >
          Report Incident
        </Button>
      }
    >
      {/* Welcome Banner */}
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
          Welcome back, {user?.fullName?.split(' ')[0] || user?.username} 👋
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
          Monitor your reported workplace IT incidents, track live technician resolutions, and verify fixes.
        </Typography>
      </Box>

      {/* Modular Metric Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Tickets"
            value={incidents.length}
            subtitle="All tickets filed by you"
            icon={<BugReportOutlined fontSize="small" />}
            color="#4f85c8"
            bgColor="#eff6ff"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Tickets"
            value={openIncidents.length}
            subtitle="Currently under investigation"
            icon={<HourglassEmptyOutlined fontSize="small" />}
            color="#d97706"
            bgColor="#fffbeb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Resolved & Closed"
            value={resolvedIncidents.length}
            subtitle="Verified solutions"
            icon={<CheckCircleOutline fontSize="small" />}
            color="#059669"
            bgColor="#ecfdf5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Critical P1"
            value={criticalIncidents.length}
            subtitle="Requires rapid intervention"
            icon={<WarningAmberOutlined fontSize="small" />}
            color="#dc2626"
            bgColor="#fef2f2"
          />
        </Grid>
      </Grid>

      {/* Incident Queue Table with Slide-Over Drawer */}
      <IncidentQueueTable
        incidents={incidents}
        title="Your Reported Incidents"
        subtitle="Click any ticket row for quick slide-over inspection and lifecycle verification"
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
