import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { Assignment, CheckCircle, HourglassEmpty, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { technicianAPI } from '../../api';
import { StatusChip, PriorityChip } from '../../components/StatusChip';
import { useAuth } from '../../context/AuthContext';

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    technicianAPI.getMyIncidents().then(r => setIncidents(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const open = incidents.filter(i => !['RESOLVED','VERIFIED','CLOSED'].includes(i.status));
  const inProgress = incidents.filter(i => i.status === 'IN_PROGRESS');
  const resolved = incidents.filter(i => ['RESOLVED','VERIFIED','CLOSED'].includes(i.status));
  const critical = incidents.filter(i => i.priority === 'P1_CRITICAL' && !['RESOLVED','VERIFIED','CLOSED'].includes(i.status));

  return (
    <Layout title="Technician Dashboard">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Welcome, {user?.fullName?.split(' ')[0] || 'Technician'} 👨‍💻
        </Typography>
        <Typography variant="body2" color="text.secondary">Here's your current workload</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { title: 'Open Incidents', value: open.length, icon: <Assignment />, color: '#1565c0' },
          { title: 'In Progress', value: inProgress.length, icon: <HourglassEmpty />, color: '#f57c00' },
          { title: 'Resolved', value: resolved.length, icon: <CheckCircle />, color: '#2e7d32' },
          { title: 'P1 Critical', value: critical.length, icon: <TrendingUp />, color: '#c62828' },
        ].map(({ title, value, icon, color }) => (
          <Grid item xs={12} sm={6} md={3} key={title}>
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
          </Grid>
        ))}
      </Grid>

      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Active Incidents</Typography>
            <Button size="small" onClick={() => navigate('/technician/incidents')}>View All</Button>
          </Box>
          {open.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
              <Typography color="text.secondary">No active incidents. Great work! 🎉</Typography>
            </Box>
          ) : (
            <List>
              {open.slice(0, 8).map((inc, i) => (
                <React.Fragment key={inc.id}>
                  {i > 0 && <Divider />}
                  <ListItem button onClick={() => navigate(`/incidents/${inc.id}`)}>
                    <ListItemText
                      primary={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold" color="primary">{inc.incidentNumber}</Typography>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>{inc.title}</Typography>
                      </Box>}
                      secondary={`Reporter: ${inc.reporter?.fullName} • ${new Date(inc.createdAt).toLocaleDateString()}`}
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
