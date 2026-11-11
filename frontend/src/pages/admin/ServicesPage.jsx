import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Chip
} from '@mui/material';
import { AddOutlined, MiscellaneousServicesOutlined } from '@mui/icons-material';
import Layout from '../../components/Layout';
import { serviceApi, categoryApi } from '../../api';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', categoryId: '' });

  const loadData = () => {
    serviceApi.getAll().then((res) => setServices(res.data || [])).catch(() => {});
    categoryApi.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    try {
      await serviceApi.create(form);
      setOpen(false);
      setForm({ name: '', description: '', categoryId: '' });
      loadData();
    } catch {}
  };

  return (
    <Layout
      title="IT Services Catalog"
      breadcrumbs={['Service Catalog', 'IT Services']}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<AddOutlined />}
          onClick={() => setOpen(true)}
          sx={{ bgcolor: '#4f85c8', '&:hover': { bgcolor: '#3b70b0' } }}
        >
          Add Service
        </Button>
      }
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
            <MiscellaneousServicesOutlined sx={{ color: '#4f85c8', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.05rem', color: '#15243b' }}>
              Enterprise IT Services
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Catalog services mapped to specific categories for automatic dispatching and SLA assignment.
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60 }}>ID</TableCell>
                <TableCell sx={{ width: 200 }}>Service Name</TableCell>
                <TableCell sx={{ width: 180 }}>Category</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell sx={{ fontFamily: 'JetBrains Mono', color: '#64748b' }}>#{s.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={s.category?.name || 'General'}
                      size="small"
                      sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontWeight: 600, fontSize: '0.68rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontSize: '0.84rem' }}>{s.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Service Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>Add IT Service</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Service Name *"
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            select
            fullWidth
            size="small"
            label="Associated Category *"
            margin="normal"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            size="small"
            label="Description"
            margin="normal"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!form.name.trim()}
            sx={{ bgcolor: '#15243b', color: 'white' }}
          >
            Save Service
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
