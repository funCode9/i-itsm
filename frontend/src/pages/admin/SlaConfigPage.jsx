import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField } from '@mui/material';
import Layout from '../../components/Layout';
import { slaPolicyAPI } from '../../api';
import { PriorityChip } from '../../components/StatusChip';

export default function SlaConfigPage() {
  const [policies, setPolicies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ responseMinutes: 0, resolutionMinutes: 0 });

  const load = () => {
    slaPolicyAPI.getAll().then(res => setPolicies(res.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ responseMinutes: p.responseMinutes, resolutionMinutes: p.resolutionMinutes });
  };

  const handleSave = async (id) => {
    try {
      await slaPolicyAPI.update(id, form);
      setEditingId(null);
      load();
    } catch {}
  };

  return (
    <Layout title="SLA Policy Configuration">
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Service Level Agreement (SLA) Targets</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Defines maximum allowable response and resolution windows based on incident priority level.
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Priority</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Target Response Time</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Target Resolution Time</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {policies.map(p => {
                  const isEditing = editingId === p.id;
                  return (
                    <TableRow key={p.id} hover>
                      <TableCell><PriorityChip priority={p.priority} /></TableCell>
                      <TableCell>
                        {isEditing ? (
                          <TextField size="small" type="number" label="Minutes" value={form.responseMinutes} onChange={e => setForm({...form, responseMinutes: +e.target.value})} />
                        ) : (
                          `${p.responseMinutes} mins (${p.responseMinutes >= 60 ? (p.responseMinutes / 60) + ' hrs' : p.responseMinutes + ' mins'})`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <TextField size="small" type="number" label="Minutes" value={form.resolutionMinutes} onChange={e => setForm({...form, resolutionMinutes: +e.target.value})} />
                        ) : (
                          `${p.resolutionMinutes} mins (${p.resolutionMinutes >= 60 ? (p.resolutionMinutes / 60) + ' hrs' : p.resolutionMinutes + ' mins'})`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="contained" onClick={() => handleSave(p.id)}>Save</Button>
                            <Button size="small" onClick={() => setEditingId(null)}>Cancel</Button>
                          </Box>
                        ) : (
                          <Button size="small" onClick={() => startEdit(p)}>Edit</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Layout>
  );
}
