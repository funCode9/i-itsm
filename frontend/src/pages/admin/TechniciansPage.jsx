import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Switch, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import Layout from '../../components/Layout';
import { adminAPI, technicianAPI } from '../../api';

export default function TechniciansPage() {
  const [techs, setTechs] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ userId: '', specialization: '', skills: '' });

  const load = () => {
    technicianAPI.getAll().then(res => setTechs(res.data)).catch(() => {});
    adminAPI.getUsers().then(res => setUsers(res.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleToggleAvail = async (id, current) => {
    try {
      await technicianAPI.setAvailability(id, !current);
      load();
    } catch {}
  };

  const handleCreate = async () => {
    try {
      await adminAPI.createTechnician({
        userId: form.userId,
        specialization: form.specialization,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      setOpen(false);
      load();
    } catch {}
  };

  return (
    <Layout title="Technician Management">
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Technician Roster & Skills</Typography>
            <Button variant="contained" onClick={() => setOpen(true)}>Add Technician</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Specialization</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Skills</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Available</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {techs.map(t => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.id}</TableCell>
                    <TableCell fontWeight="bold">{t.fullName}</TableCell>
                    <TableCell>{t.specialization || 'General IT'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {t.skills?.map(s => (
                          <Chip key={s.id || s.skillName} label={s.skillName} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Switch checked={t.available} onChange={() => handleToggleAvail(t.id, t.available)} size="small" />
                      {t.available ? 'Ready' : 'Off duty'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Register New Technician</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 1 }}>
          <TextField select fullWidth label="User" margin="normal" value={form.userId} onChange={e => setForm({...form, userId: e.target.value})}>
            {users.map(u => <MenuItem key={u.id} value={u.id}>{u.fullName} ({u.username})</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Specialization" margin="normal" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} />
          <TextField fullWidth label="Skills (comma-separated)" margin="normal" helperText="e.g. network, wifi, vpn, router" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
