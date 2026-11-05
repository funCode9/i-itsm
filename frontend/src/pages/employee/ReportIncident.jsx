import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, MenuItem,
  Slider, Alert, Chip, Grid, CircularProgress, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { incidentAPI, categoryAPI, serviceAPI } from '../../api';

const IMPACT_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High' };

export default function ReportIncident() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', categoryId: '', serviceId: '',
    impact: 1, urgency: 1, businessCriticality: 1
  });
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priorityPreview, setPriorityPreview] = useState(null);

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data));
    serviceAPI.getAll().then(r => setServices(r.data));
  }, []);

  // Auto-compute priority preview
  useEffect(() => {
    const score = form.impact * form.urgency * form.businessCriticality;
    if (score >= 18) setPriorityPreview({ label: 'P1 Critical', color: 'error' });
    else if (score >= 12) setPriorityPreview({ label: 'P2 High', color: 'warning' });
    else if (score >= 6) setPriorityPreview({ label: 'P3 Medium', color: 'info' });
    else setPriorityPreview({ label: 'P4 Low', color: 'default' });
  }, [form.impact, form.urgency, form.businessCriticality]);

  // Category suggestion (debounced)
  useEffect(() => {
    if (form.title.length < 5) return;
    const t = setTimeout(() => {
      incidentAPI.suggestCategory(form.title, form.description)
        .then(r => {
          if (r.data.categoryId) setSuggestedCategory(r.data);
          else setSuggestedCategory(null);
        }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [form.title, form.description]);

  // Duplicate check
  const checkDuplicates = async () => {
    if (!form.title) return;
    try {
      const r = await incidentAPI.checkDuplicates({
        title: form.title,
        description: form.description,
        categoryId: form.categoryId || undefined,
        serviceId: form.serviceId || undefined,
      });
      setDuplicates(r.data);
    } catch {}
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId || null,
        serviceId: form.serviceId || null,
      };
      const r = await incidentAPI.create(payload);
      navigate(`/incidents/${r.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create incident.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Report New Incident">
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {duplicates.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>⚠️ Potential duplicates found ({duplicates.length}):</strong>
            {duplicates.map(d => (
              <Box key={d.id} sx={{ mt: 0.5 }}>
                <Typography variant="body2">• [{d.incidentNumber}] {d.title} ({d.status})</Typography>
              </Box>
            ))}
            <Typography variant="caption">Please review before submitting.</Typography>
          </Alert>
        )}

        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Incident Details</Typography>
            <form onSubmit={handleSubmit}>
              <TextField fullWidth label="Title *" sx={{ mb: 2 }} required
                value={form.title} onChange={set('title')}
                onBlur={checkDuplicates}
                helperText="Briefly describe the issue" />

              {suggestedCategory && (
                <Alert severity="info" sx={{ mb: 2 }} action={
                  <Button size="small" onClick={() => setForm({ ...form, categoryId: suggestedCategory.categoryId })}>
                    Use
                  </Button>}>
                  💡 Suggested category: <strong>{suggestedCategory.categoryName}</strong>
                </Alert>
              )}

              <TextField fullWidth label="Description *" multiline rows={4} sx={{ mb: 2 }} required
                value={form.description} onChange={set('description')}
                helperText="Provide full details of the issue" />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField fullWidth select label="Category" value={form.categoryId} onChange={set('categoryId')}>
                    <MenuItem value="">-- None --</MenuItem>
                    {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth select label="Affected Service" value={form.serviceId} onChange={set('serviceId')}>
                    <MenuItem value="">-- None --</MenuItem>
                    {services.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">Priority Factors</Typography>
                {priorityPreview && (
                  <Chip label={`Estimated: ${priorityPreview.label}`} color={priorityPreview.color} size="small" />
                )}
              </Box>

              {[
                { field: 'impact', label: 'Impact' },
                { field: 'urgency', label: 'Urgency' },
                { field: 'businessCriticality', label: 'Business Criticality' },
              ].map(({ field, label }) => (
                <Box key={field} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{label}</Typography>
                    <Typography variant="body2" fontWeight="bold">{IMPACT_LABELS[form[field]]}</Typography>
                  </Box>
                  <Slider value={form[field]} min={1} max={3} step={1} marks
                    onChange={(_, v) => setForm({ ...form, [field]: v })}
                    valueLabelDisplay="auto"
                    valueLabelFormat={v => IMPACT_LABELS[v]} />
                </Box>
              ))}

              <Button fullWidth variant="contained" type="submit" size="large"
                sx={{ mt: 2, py: 1.5 }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Incident'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}
