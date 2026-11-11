import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Switch, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Avatar, Tooltip
} from '@mui/material';
import {
  EngineeringOutlined, PersonAddOutlined, CheckCircleOutline,
  WorkOutline, RefreshOutlined
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import MetricCard from '../../components/MetricCard';
import { adminApi, technicianApi } from '../../api';

export default function TechniciansPage() {
  const [techs, setTechs] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ userId: '', specialization: '', skills: '' });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      technicianApi.getAll().then((res) => setTechs(res.data || [])).catch(() => {}),
      adminApi.getUsers().then((res) => setUsers(res.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvail = async (id, current) => {
    try {
      await technicianApi.setAvailability(id, !current);
      loadData();
    } catch {}
  };

  const handleCreate = async () => {
    try {
      await adminApi.createTechnician({
        userId: Number(form.userId),
        specialization: form.specialization,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setOpen(false);
      setForm({ userId: '', specialization: '', skills: '' });
      loadData();
    } catch {}
  };

  const availableCount = techs.filter((t) => t.available).length;
  const totalActiveTickets = techs.reduce((acc, t) => acc + (t.activeIncidents || 0), 0);

  return (
    <Layout
      title="Technicians Workspace"
      breadcrumbs={['Operations', 'Technician Roster']}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<PersonAddOutlined />}
          onClick={() => setOpen(true)}
          sx={{ bgcolor: '#4f85c8', '&:hover': { bgcolor: '#3b70b0' } }}
        >
          Add Specialist
        </Button>
      }
    >
      {/* Metric Summary */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="Total Specialists"
            value={techs.length}
            subtitle="Registered IT technicians"
            icon={<EngineeringOutlined fontSize="small" />}
            color="#4f85c8"
            bgColor="#eff6ff"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="Available On Duty"
            value={availableCount}
            subtitle="Ready for strategy auto-assignment"
            icon={<CheckCircleOutline fontSize="small" />}
            color="#059669"
            bgColor="#ecfdf5"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="Active Workload"
            value={totalActiveTickets}
            subtitle="Cumulative active tickets in progress"
            icon={<WorkOutline fontSize="small" />}
            color="#d97706"
            bgColor="#fffbeb"
          />
        </Grid>
      </Grid>

      {/* Roster Table Paper */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: '1px solid #edf0f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.05rem', color: '#15243b' }}>
              Specialist Roster & Domain Skills
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Used by GoF Skill-Based Assignment Strategy and Least-Loaded Load Balancing
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={loadData}
            sx={{ borderColor: '#cbd5e1', color: '#475569' }}
          >
            Refresh
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60 }}>ID</TableCell>
                <TableCell>Specialist Name</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Domain Skills Keywords</TableCell>
                <TableCell sx={{ width: 130 }}>Active Tickets</TableCell>
                <TableCell sx={{ width: 130 }}>Availability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {techs.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell sx={{ fontFamily: 'JetBrains Mono', color: '#64748b' }}>#{t.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Avatar sx={{ width: 30, height: 30, bgcolor: '#4f85c8', fontSize: '0.8rem', fontWeight: 700 }}>
                        {t.fullName?.[0] || 'T'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {t.fullName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {t.email || t.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
                      {t.specialization || 'General IT Support'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                      {t.skills?.map((s) => (
                        <Chip
                          key={s.id || s.skillName}
                          label={s.skillName}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${t.activeIncidents ?? 0} active`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        bgcolor: (t.activeIncidents ?? 0) > 3 ? '#fff7ed' : '#f0fdf4',
                        color: (t.activeIncidents ?? 0) > 3 ? '#c2410c' : '#15803d',
                        border: `1px solid ${(t.activeIncidents ?? 0) > 3 ? '#fed7aa' : '#bbf7d0'}`,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Switch
                        checked={t.available}
                        onChange={() => handleToggleAvail(t.id, t.available)}
                        size="small"
                        color="success"
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: t.available ? '#059669' : '#94a3b8' }}>
                        {t.available ? 'Ready' : 'Off-duty'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Specialist Modal Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>
          Register New IT Specialist
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Link an existing user account and configure domain expertise skills for Strategy Pattern matching.
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            label="User Account *"
            margin="normal"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
          >
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.fullName} ({u.username}) — {u.role}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            size="small"
            label="Specialization *"
            placeholder="e.g. Network Engineering, Hardware Diagnostics, Cloud Infrastructure"
            margin="normal"
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="Domain Skills (Comma-separated) *"
            placeholder="e.g. wifi, vpn, router, dns, switch, lan"
            helperText="These keywords are analyzed by the Strategy Pattern during ticket classification"
            margin="normal"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!form.userId || !form.specialization}
            sx={{ bgcolor: '#15243b', color: 'white' }}
          >
            Save Specialist
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
