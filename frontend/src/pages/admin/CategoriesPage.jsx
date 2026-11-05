import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import Layout from '../../components/Layout';
import { categoryAPI } from '../../api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', keywords: '' });

  const load = () => {
    categoryAPI.getAll().then(res => setCategories(res.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await categoryAPI.create(form);
      setOpen(false);
      setForm({ name: '', description: '', keywords: '' });
      load();
    } catch {}
  };

  return (
    <Layout title="Incident Categories">
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Classification Categories & Suggestion Keywords</Typography>
            <Button variant="contained" onClick={() => setOpen(true)}>Add Category</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Auto-Suggest Keywords</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map(c => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.id}</TableCell>
                    <TableCell fontWeight="bold">{c.name}</TableCell>
                    <TableCell>{c.description}</TableCell>
                    <TableCell sx={{ maxWidth: 350 }}>
                      <Typography variant="caption" color="text.secondary">{c.keywords}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 1 }}>
          <TextField fullWidth label="Category Name" margin="normal" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <TextField fullWidth label="Description" margin="normal" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <TextField fullWidth label="Keywords (comma separated)" margin="normal" helperText="Used by rule-based category suggestion engine" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
