import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Switch, Avatar, Tooltip, IconButton, TextField,
  InputAdornment
} from '@mui/material';
import {
  PeopleOutlined, AdminPanelSettingsOutlined, EngineeringOutlined,
  BadgeOutlined, RefreshOutlined, SearchOutlined, CheckCircle, Cancel
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import MetricCard from '../../components/MetricCard';
import { adminApi } from '../../api';

const ROLE_CONFIG = {
  ADMINISTRATOR: { label: 'Admin', color: '#7c3aed', bg: '#f3e8ff' },
  TECHNICIAN:    { label: 'Technician', color: '#059669', bg: '#d1fae5' },
  EMPLOYEE:      { label: 'Employee', color: '#2563eb', bg: '#dbeafe' },
};

function RoleChip({ role }) {
  const cfg = ROLE_CONFIG[role] || { label: role, color: '#64748b', bg: '#f1f5f9' };
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: '0.72rem',
        height: 22,
        fontFamily: 'DM Sans, sans-serif',
      }}
    />
  );
}

function UserAvatar({ name }) {
  const initials = (name || '?').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#4f85c8', '#7c3aed', '#059669', '#d97706', '#dc2626'];
  const colorIdx = (name || '').charCodeAt(0) % colors.length;
  return (
    <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700, bgcolor: colors[colorIdx], mr: 1 }}>
      {initials}
    </Avatar>
  );
}

const hdrCell = {
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 700,
  fontSize: '0.72rem',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '2px solid #e2e8f0',
  py: 1.5,
  bgcolor: '#f8fafc',
};

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const loadData = () => {
    setLoading(true);
    adminApi.getUsers()
      .then(res => setUsers(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleToggle = async (userId, currentEnabled) => {
    try {
      await adminApi.toggleUser(userId, !currentEnabled);
      loadData();
    } catch {}
  };

  const filtered = users.filter(u =>
    !search ||
    (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const admins = users.filter(u => u.role === 'ADMINISTRATOR').length;
  const techs  = users.filter(u => u.role === 'TECHNICIAN').length;
  const emps   = users.filter(u => u.role === 'EMPLOYEE').length;
  const active = users.filter(u => u.enabled).length;

  return (
    <Layout
      title="User Management"
      actions={
        <Tooltip title="Refresh">
          <IconButton onClick={loadData} size="small" sx={{ color: '#64748b' }}>
            <RefreshOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      }
    >
      {/* ── Metric Cards ───────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Users"
            value={users.length}
            subtitle="All registered accounts"
            icon={<PeopleOutlined />}
            iconBg="#dbeafe"
            iconColor="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Administrators"
            value={admins}
            subtitle="With admin privileges"
            icon={<AdminPanelSettingsOutlined />}
            iconBg="#f3e8ff"
            iconColor="#7c3aed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Technicians"
            value={techs}
            subtitle="Support specialists"
            icon={<EngineeringOutlined />}
            iconBg="#d1fae5"
            iconColor="#059669"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Employees"
            value={emps}
            subtitle="End-user accounts"
            icon={<BadgeOutlined />}
            iconBg="#fef3c7"
            iconColor="#d97706"
          />
        </Grid>
      </Grid>

      {/* ── Users Table ────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
        {/* Table header bar */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 2, borderBottom: '1px solid #e2e8f0',
        }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#0f172a' }}>
              Registered Users &amp; Roles
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {active} of {users.length} accounts active
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ fontSize: 16, color: '#94a3b8' }} />
                </InputAdornment>
              ),
              sx: { fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem' },
            }}
            sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={hdrCell}>User</TableCell>
                <TableCell sx={hdrCell}>Username</TableCell>
                <TableCell sx={hdrCell}>Email</TableCell>
                <TableCell sx={hdrCell}>Department</TableCell>
                <TableCell sx={hdrCell}>Role</TableCell>
                <TableCell sx={hdrCell} align="center">Status</TableCell>
                <TableCell sx={hdrCell} align="center">Toggle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    Loading users…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(u => (
                  <TableRow
                    key={u.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#f8fafc' },
                      opacity: u.enabled ? 1 : 0.55,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {/* User cell with avatar */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <UserAvatar name={u.fullName} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: '#0f172a', lineHeight: 1.2 }}>
                            {u.fullName || '—'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem' }}>
                            #{u.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#334155' }}>
                      {u.username}
                    </TableCell>

                    <TableCell sx={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#475569' }}>
                      {u.email}
                    </TableCell>

                    <TableCell sx={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#475569' }}>
                      {u.department || <span style={{ color: '#cbd5e1' }}>—</span>}
                    </TableCell>

                    <TableCell>
                      <RoleChip role={u.role} />
                    </TableCell>

                    <TableCell align="center">
                      {u.enabled ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <CheckCircle sx={{ fontSize: 14, color: '#059669' }} />
                          <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>Active</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Cancel sx={{ fontSize: 14, color: '#dc2626' }} />
                          <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>Disabled</Typography>
                        </Box>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title={u.enabled ? 'Disable account' : 'Enable account'}>
                        <Switch
                          checked={!!u.enabled}
                          onChange={() => handleToggle(u.id, u.enabled)}
                          size="small"
                          color="success"
                          sx={{ '& .MuiSwitch-thumb': { boxShadow: 'none' } }}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <Box sx={{ px: 3, py: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Showing {filtered.length} of {users.length} users
            </Typography>
          </Box>
        )}
      </Paper>
    </Layout>
  );
}
