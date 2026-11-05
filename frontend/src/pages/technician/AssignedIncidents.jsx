import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { technicianAPI } from '../../api';
import { StatusChip, PriorityChip } from '../../components/StatusChip';

export default function AssignedIncidents() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    technicianAPI.getMyIncidents().then(r => { setIncidents(r.data); setFiltered(r.data); });
  }, []);

  useEffect(() => {
    let f = incidents;
    if (statusFilter) f = f.filter(i => i.status === statusFilter);
    if (search) f = f.filter(i =>
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.incidentNumber?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [statusFilter, search, incidents]);

  return (
    <Layout title="Assigned Incidents">
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField size="small" placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)} sx={{ minWidth: 200 }} />
            <TextField select size="small" label="Status" value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="">All</MenuItem>
              {['ASSIGNED','ACKNOWLEDGED','IN_PROGRESS','RESOLVED'].map(s =>
                <MenuItem key={s} value={s}>{s.replace('_',' ')}</MenuItem>)}
            </TextField>
            <Button variant="outlined" size="small" onClick={() => { setStatusFilter(''); setSearch(''); }}>Clear</Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  {['Incident #','Title','Reporter','Priority','Status','Created','Actions'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center">No incidents found</TableCell></TableRow>
                ) : filtered.map(inc => (
                  <TableRow key={inc.id} hover>
                    <TableCell><Typography color="primary" variant="body2" fontWeight="bold">{inc.incidentNumber}</Typography></TableCell>
                    <TableCell sx={{ maxWidth: 200 }}><Typography variant="body2" noWrap>{inc.title}</Typography></TableCell>
                    <TableCell>{inc.reporter?.fullName}</TableCell>
                    <TableCell>{inc.priority ? <PriorityChip priority={inc.priority} /> : '-'}</TableCell>
                    <TableCell><StatusChip status={inc.status} /></TableCell>
                    <TableCell>{new Date(inc.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell><Button size="small" onClick={() => navigate(`/incidents/${inc.id}`)}>Work</Button></TableCell>
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
