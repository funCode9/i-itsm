import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, Chip
} from '@mui/material';
import { GppGoodOutlined, EditOutlined, Check, Close } from '@mui/icons-material';
import Layout from '../../components/Layout';
import { slaPolicyApi } from '../../api';
import { PriorityChip } from '../../components/StatusChip';

export default function SlaConfigPage() {
  const [policies, setPolicies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ responseMinutes: 0, resolutionMinutes: 0 });

  const loadData = () => {
    slaPolicyApi.getAll().then((res) => setPolicies(res.data || [])).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ responseMinutes: p.responseMinutes, resolutionMinutes: p.resolutionMinutes });
  };

  const handleSave = async (id) => {
    try {
      await slaPolicyApi.update(id, form);
      setEditingId(null);
      loadData();
    } catch {}
  };

  return (
    <Layout
      title="SLA Policies"
      breadcrumbs={['Configuration', 'SLA Policy Engine']}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: '1px solid #edf0f4' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <GppGoodOutlined sx={{ color: '#4f85c8', fontSize: 22 }} />
            <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.05rem', color: '#15243b' }}>
              Service Level Agreement (SLA) Matrix
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Sets the contractual response time and resolution time deadlines based on priority classification.
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 160 }}>Priority Tier</TableCell>
                <TableCell>Target Response Window</TableCell>
                <TableCell>Target Resolution Window</TableCell>
                <TableCell sx={{ width: 140 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.map((p) => {
                const isEditing = editingId === p.id;
                return (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <PriorityChip priority={p.priority} showBar />
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          type="number"
                          label="Response (mins)"
                          value={form.responseMinutes}
                          onChange={(e) => setForm({ ...form, responseMinutes: Number(e.target.value) })}
                          sx={{ width: 160 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                          {p.responseMinutes} mins{' '}
                          <span style={{ color: '#94a3b8', fontWeight: 400 }}>
                            ({p.responseMinutes >= 60 ? `${(p.responseMinutes / 60).toFixed(1)} hrs` : `${p.responseMinutes} mins`})
                          </span>
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          type="number"
                          label="Resolution (mins)"
                          value={form.resolutionMinutes}
                          onChange={(e) => setForm({ ...form, resolutionMinutes: Number(e.target.value) })}
                          sx={{ width: 160 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                          {p.resolutionMinutes} mins{' '}
                          <span style={{ color: '#94a3b8', fontWeight: 400 }}>
                            ({p.resolutionMinutes >= 60 ? `${(p.resolutionMinutes / 60).toFixed(1)} hrs` : `${p.resolutionMinutes} mins`})
                          </span>
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Box sx={{ display: 'flex', gap: 0.8 }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Check fontSize="small" />}
                            onClick={() => handleSave(p.id)}
                            sx={{ bgcolor: '#059669', color: 'white', fontSize: '0.75rem' }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setEditingId(null)}
                            sx={{ fontSize: '0.75rem', borderColor: '#cbd5e1', color: '#475569' }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditOutlined fontSize="small" />}
                          onClick={() => startEdit(p)}
                          sx={{ fontSize: '0.75rem', borderColor: '#cbd5e1', color: '#475569' }}
                        >
                          Modify
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Layout>
  );
}
