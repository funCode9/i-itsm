import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import Layout from '../../components/Layout';
import { serviceAPI, categoryAPI } from '../../api';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', categoryId: '' });

  const load = () => {
    serviceAPI.getAll().then(res => setServices(res.data)).catch(() => {});
    categoryAPI.getAll().then(res => setCategories(res.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await serviceAPI.create(form);
      setOpen(false);
      setForm({ name: '', description: '', categoryId: '' });
      load();
    } catch {}
  };

  return (
    <Layout title="IT Services Catalogue">
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Active Services & Category Mapping</Typography>
            <Button variant="contained" onClick={() => setOpen(true)}>Add IT Service</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Service Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.id}</TableCell>
                    <TableCell fontWeight="bold">{s.name}</TableCell>
                    <TableCell>{s.category?.name || '—'}</TableCell>
                    <TableCell>{s.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add IT Service</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 1 }}>
          <TextField fullWidth label="Service Name" margin="normal" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <TextField select fullWidth label="Category" margin="normal" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Description" margin="normal" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
