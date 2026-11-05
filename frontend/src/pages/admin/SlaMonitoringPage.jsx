import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import Layout from '../../components/Layout';
import { adminAPI } from '../../api';

export default function SlaMonitoringPage() {
  const [records, setRecords] = useState([]);
  const [breaches, setBreaches] = useState([]);

  useEffect(() => {
    adminAPI.getSlaAll().then(res => setRecords(res.data)).catch(() => {});
    adminAPI.getSlaBreached().then(res => setBreaches(res.data)).catch(() => {});
  }, []);

  return (
    <Layout title="SLA Monitoring & Breaches">
      <Card elevation={2} sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold" color="error.main">
              ⚠️ Breached Incidents ({breaches.length})
            </Typography>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'error.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Incident #</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Response Deadline</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Resolution Deadline</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Response Breached?</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Resolution Breached?</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {breaches.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">No breaches detected! 🎯</TableCell></TableRow>
                ) : breaches.map(b => (
                  <TableRow key={b.id} hover>
                    <TableCell fontWeight="bold">{b.incident?.incidentNumber || '—'}</TableCell>
                    <TableCell>{new Date(b.responseDeadline).toLocaleString()}</TableCell>
                    <TableCell>{new Date(b.resolutionDeadline).toLocaleString()}</TableCell>
                    <TableCell><Chip label={b.responseBreached ? "YES" : "NO"} color={b.responseBreached ? "error" : "success"} size="small" /></TableCell>
                    <TableCell><Chip label={b.resolutionBreached ? "YES" : "NO"} color={b.resolutionBreached ? "error" : "success"} size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>All Active Tracked SLA Records ({records.length})</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Incident #</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Response Deadline</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Resolution Deadline</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell fontWeight="bold">{r.incident?.incidentNumber || '—'}</TableCell>
                    <TableCell>
                      <Chip label={r.status} size="small"
                        color={r.status === 'BREACHED' ? 'error' : r.status === 'APPROACHING' ? 'warning' : 'success'} />
                    </TableCell>
                    <TableCell>{new Date(r.responseDeadline).toLocaleString()}</TableCell>
                    <TableCell>{new Date(r.resolutionDeadline).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Layout>
  );
}
