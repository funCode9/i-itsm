import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Switch, FormControlLabel } from '@mui/material';
import Layout from '../../components/Layout';
import { adminAPI } from '../../api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  const load = () => {
    adminAPI.getUsers().then(res => setUsers(res.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (userId, currentEnabled) => {
    try {
      await adminAPI.toggleUser(userId, !currentEnabled);
      load();
    } catch {}
  };

  return (
    <Layout title="User Management">
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Registered Users & Roles</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Full Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Active</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.id}</TableCell>
                    <TableCell fontWeight="bold">{u.fullName}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.department || '—'}</TableCell>
                    <TableCell>
                      <Chip label={u.role} size="small"
                        color={u.role === 'ADMINISTRATOR' ? 'secondary' : u.role === 'TECHNICIAN' ? 'success' : 'primary'} />
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={<Switch checked={u.enabled} onChange={() => handleToggle(u.id, u.enabled)} size="small" />}
                        label={u.enabled ? "Active" : "Disabled"}
                      />
                    </TableCell>
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
