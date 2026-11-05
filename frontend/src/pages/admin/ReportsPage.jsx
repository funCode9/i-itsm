import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Layout from '../../components/Layout';
import { adminAPI } from '../../api';

const COLORS = ['#1565c0', '#2e7d32', '#f57c00', '#d32f2f', '#7b1fa2', '#0097a7'];

export default function ReportsPage() {
  const [byStatus, setByStatus] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [workload, setWorkload] = useState([]);

  useEffect(() => {
    adminAPI.getByStatus().then(res => {
      setByStatus(Object.entries(res.data).map(([name, value]) => ({ name, value })));
    }).catch(() => {});

    adminAPI.getByPriority().then(res => {
      setByPriority(Object.entries(res.data).map(([name, value]) => ({ name, value })));
    }).catch(() => {});

    adminAPI.getByCategory().then(res => {
      setByCategory(Object.entries(res.data).map(([name, value]) => ({ name, value })));
    }).catch(() => {});

    adminAPI.getWorkload().then(res => setWorkload(res.data)).catch(() => {});
  }, []);

  return (
    <Layout title="Reports & Analytical Dashboards">
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Incidents by Status</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byStatus}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1565c0" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Incidents by Priority</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {byPriority.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Incidents by Category</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byCategory}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2e7d32" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Technician Workload Balance</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell>Technician</TableCell>
                      <TableCell>Specialization</TableCell>
                      <TableCell align="right">Active Incidents</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workload.map(w => (
                      <TableRow key={w.technicianId} hover>
                        <TableCell fontWeight="bold">{w.name}</TableCell>
                        <TableCell>{w.specialization}</TableCell>
                        <TableCell align="right">{w.activeIncidents}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}
