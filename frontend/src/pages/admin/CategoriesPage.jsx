import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Chip
} from '@mui/material';
import { AddOutlined, CategoryOutlined, RefreshOutlined } from '@mui/icons-material';
import Layout from '../../components/Layout';
import { categoryApi } from '../../api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', keywords: '' });

  const loadData = () => {
    categoryApi.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    try {
      await categoryApi.create(form);
      setOpen(false);
      setForm({ name: '', description: '', keywords: '' });
      loadData();
    } catch {}
  };

  return (
    <Layout
      title="Service Categories"
      breadcrumbs={['Service Catalog', 'Categories']}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<AddOutlined />}
          onClick={() => setOpen(true)}
          sx={{ bgcolor: '#4f85c8', '&:hover': { bgcolor: '#3b70b0' } }}
        >
          Add Category
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
        <Box sx={{ p: 2.5, borderBottom: '1px solid #edf0f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
              <CategoryOutlined sx={{ color: '#4f85c8', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.05rem', color: '#15243b' }}>
                Classification Categories & Auto-Suggestion Dictionary
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Keywords are indexed by the real-time AI Category Suggestion Engine.
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60 }}>ID</TableCell>
                <TableCell sx={{ width: 180 }}>Category Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Auto-Suggest Dictionary Keywords</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontFamily: 'JetBrains Mono', color: '#64748b' }}>#{c.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>{c.name}</TableCell>
                  <TableCell sx={{ color: '#475569', fontSize: '0.84rem' }}>{c.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {c.keywords?.split(',').map((kw, i) => (
                        <Chip
                          key={i}
                          label={kw.trim()}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Category Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>Add Category</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Category Name *"
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="Description"
            margin="normal"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="Keywords (Comma-separated) *"
            helperText="Used by rule-based category suggestion engine"
            margin="normal"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
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
            Save Category
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
