import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';
import { BugReport, Assignment, CheckCircle, HourglassEmpty, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { incidentAPI } from '../../api';
import { StatusChip, PriorityChip } from '../../components/StatusChip';
import { useAuth } from '../../context/AuthContext';

function StatCard({ title, value, icon, color }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>{value}</Typography>
          </Box>
          <Box sx={{ bgcolor: color + '20', p: 1.5, borderRadius: 2 }}>
            {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentAPI.getMy().then(r => setIncidents(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const open = incidents.filter(i => !['RESOLVED','VERIFIED','CLOSED'].includes(i.status));
  const resolved = incidents.filter(i => ['RESOLVED','VERIFIED','CLOSED'].includes(i.status));
  const critical = incidents.filter(i => i.priority === 'P1_CRITICAL');

  return (
    <Layout title="Employee Dashboard">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          Welcome back, {user?.fullName?.split(' ')[0] || 'User'} 👋
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/employee/report')}>
          Report New Incident
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Incidents" value={incidents.length} icon={<BugReport />} color="#1565c0" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Open" value={open.length} icon={<HourglassEmpty />} color="#f57c00" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Resolved" value={resolved.length} icon={<CheckCircle />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Critical" value={critical.length} icon={<Assignment />} color="#c62828" />
        </Grid>
      </Grid>

      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Recent Incidents</Typography>
            <Button size="small" onClick={() => navigate('/employee/incidents')}>View All</Button>
          </Box>
          {loading ? <Typography>Loading...</Typography> :
            incidents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No incidents yet.</Typography>
                <Button variant="outlined" sx={{ mt: 1 }} onClick={() => navigate('/employee/report')}>
                  Report Your First Incident
                </Button>
              </Box>
            ) : (
              <List>
                {incidents.slice(0, 5).map((inc, i) => (
                  <React.Fragment key={inc.id}>
                    {i > 0 && <Divider />}
                    <ListItem button onClick={() => navigate(`/incidents/${inc.id}`)}>
                      <ListItemText
                        primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="bold" color="primary">{inc.incidentNumber}</Typography>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>{inc.title}</Typography>
                        </Box>}
                        secondary={new Date(inc.createdAt).toLocaleDateString()}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {inc.priority && <PriorityChip priority={inc.priority} />}
                        <StatusChip status={inc.status} />
                      </Box>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
        </CardContent>
      </Card>
    </Layout>
  );
}
