import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Layout from '../../components/Layout';
import { adminApi } from '../../api';

const PIE_COLORS = ['#dc2626', '#ea580c', '#d97706', '#2563eb', '#059669', '#7c3aed'];

export default function ReportsPage() {
  const [byStatus, setByStatus] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [workload, setWorkload] = useState([]);

  useEffect(() => {
    adminApi.getByStatus()
      .then((res) => setByStatus(Object.entries(res.data || {}).map(([name, value]) => ({ name: name.replace('_', ' '), value }))))
      .catch(() => {});

    adminApi.getByPriority()
      .then((res) => setByPriority(Object.entries(res.data || {}).map(([name, value]) => ({ name: name.replace('_', ' '), value }))))
      .catch(() => {});

    adminApi.getByCategory()
      .then((res) => setByCategory(Object.entries(res.data || {}).map(([name, value]) => ({ name, value }))))
      .catch(() => {});

    adminApi.getWorkload()
      .then((res) => setWorkload(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <Layout
      title="Analytics & Operations Reports"
      breadcrumbs={['Analytics', 'Executive Telemetry']}
    >
      <Grid container spacing={3}>
        {/* Incidents by Status */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
            }}
          >
            <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: '#15243b', mb: 2 }}>
              Incidents by Lifecycle Status
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byStatus}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f85c8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Incidents by Priority */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
            }}
          >
            <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: '#15243b', mb: 2 }}>
              Priority Distribution (P1–P4)
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byPriority}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  label
                >
                  {byPriority.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Incidents by Category */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
            }}
          >
            <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: '#15243b', mb: 2 }}>
              Incidents by Service Category
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byCategory}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Technician Workload Balance */}
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
            <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: '#15243b', mb: 2 }}>
              Technician Real-Time Workload Balance
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Technician</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell align="right">Active Tickets</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workload.map((w) => (
                    <TableRow key={w.technicianId} hover>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>{w.name}</TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{w.specialization}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${w.activeIncidents ?? 0} tickets`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: (w.activeIncidents ?? 0) > 3 ? '#fff7ed' : '#ecfdf5',
                            color: (w.activeIncidents ?? 0) > 3 ? '#c2410c' : '#047857',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
