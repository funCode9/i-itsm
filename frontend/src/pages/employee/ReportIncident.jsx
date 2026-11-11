import React, { useEffect, useState } from 'react';
import {
  Box, Paper, TextField, Button, Typography, MenuItem,
  Select, FormControl, InputLabel, Slider, Alert, Chip,
  Grid, CircularProgress, Divider, Tooltip
} from '@mui/material';
import {
  AutoAwesome, WarningAmber, SendOutlined, ArrowBack,
  CheckCircleOutline, SpeedOutlined, InfoOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { incidentApi, categoryApi, serviceApi } from '../../api';

const IMPACT_OPTIONS = [
  { value: 1, label: '1 - Individual (Single workstation)' },
  { value: 2, label: '2 - Department (Multiple team members)' },
  { value: 3, label: '3 - Enterprise-wide (Entire business impacted)' },
];

const URGENCY_OPTIONS = [
  { value: 1, label: '1 - Low (Workaround readily available)' },
  { value: 2, label: '2 - Medium (Normal operation degraded)' },
  { value: 3, label: '3 - High (Critical workflow completely blocked)' },
];

const CRITICALITY_OPTIONS = [
  { value: 1, label: '1 - Low (Non-essential tooling)' },
  { value: 2, label: '2 - Medium (Standard operational service)' },
  { value: 3, label: '3 - Critical (Mission-critical core infrastructure)' },
];

export default function ReportIncident() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    serviceId: '',
    impact: 1,
    urgency: 1,
    businessCriticality: 1,
  });

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  useEffect(() => {
    categoryApi.getAll().then((r) => setCategories(r.data || [])).catch(() => {});
    serviceApi.getAll().then((r) => setServices(r.data || [])).catch(() => {});
  }, []);

  // Compute Rule-Based Priority Score
  const score = form.impact * form.urgency * form.businessCriticality;
  let priorityBadge = { label: 'P4 Low', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' };
  if (score >= 18) {
    priorityBadge = { label: 'P1 Critical', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' };
  } else if (score >= 12) {
    priorityBadge = { label: 'P2 High', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa' };
  } else if (score >= 6) {
    priorityBadge = { label: 'P3 Medium', color: '#a16207', bg: '#fefce8', border: '#fef08a' };
  }

  // Real-time Category Suggestion (Debounced)
  useEffect(() => {
    if (form.title.trim().length < 5) {
      setSuggestedCategory(null);
      return;
    }
    const timer = setTimeout(() => {
      incidentApi.suggestCategory(form.title, form.description)
        .then((r) => {
          if (r.data && r.data.categoryId) {
            setSuggestedCategory(r.data);
          } else {
            setSuggestedCategory(null);
          }
        })
        .catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  }, [form.title, form.description]);

  // Check for duplicates when title or service changes
  const runDuplicateCheck = async () => {
    if (form.title.trim().length < 6) return;
    setCheckingDuplicates(true);
    try {
      const res = await incidentApi.checkDuplicates({
        title: form.title,
        description: form.description,
        categoryId: form.categoryId || undefined,
        serviceId: form.serviceId || undefined,
      });
      setDuplicates(Array.isArray(res.data) ? res.data : []);
    } catch {
      setDuplicates([]);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const setField = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Please provide an incident title and detailed description.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        serviceId: form.serviceId ? Number(form.serviceId) : null,
        impact: Number(form.impact),
        urgency: Number(form.urgency),
        businessCriticality: Number(form.businessCriticality),
      };
      const res = await incidentApi.create(payload);
      navigate(`/incidents/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit incident ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Report Incident"
      breadcrumbs={['Incidents', 'Create Ticket']}
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/employee')}
          sx={{ borderColor: '#cbd5e1', color: '#475569' }}
        >
          Back to Portal
        </Button>
      }
    >
      <Box sx={{ maxWidth: 860, mx: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Duplicate Incidents Warning Banner */}
        {duplicates.length > 0 && (
          <Alert
            severity="warning"
            icon={<WarningAmber />}
            sx={{
              mb: 2.5,
              borderRadius: '8px',
              border: '1px solid #fed7aa',
              bgcolor: '#fffbeb',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#9a3412', mb: 0.5 }}>
              Potential Duplicate Incident Detected ({duplicates.length})
            </Typography>
            <Typography variant="body2" sx={{ color: '#7c2d12', mb: 1, fontSize: '0.82rem' }}>
              Similar open incidents are already logged in the system. Submitting a duplicate may delay response times:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              {duplicates.map((dup) => (
                <Box
                  key={dup.id}
                  onClick={() => navigate(`/incidents/${dup.id}`)}
                  sx={{
                    p: 1,
                    bgcolor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #fed7aa',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#fff7ed' },
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#4f85c8', fontFamily: 'JetBrains Mono' }}>
                    {dup.incidentNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b' }}>
                    {dup.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Status: {dup.status} • Service: {dup.service?.name || 'General'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Alert>
        )}

        {/* Main Incident Form Paper */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                color: '#15243b',
              }}
            >
              Report New Workplace Incident
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Submit an issue ticket to the automated IT dispatch system. Our intelligent priority engine will compute SLA deadlines.
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {/* Title */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                Incident Title *
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., Office VPN disconnected and corporate Wi-Fi authentication failing"
                value={form.title}
                onChange={setField('title')}
                onBlur={runDuplicateCheck}
                required
              />
            </Grid>

            {/* AI Category Suggestion Pill */}
            {suggestedCategory && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 1.2,
                    bgcolor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesome sx={{ color: '#2563eb', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
                      AI Category Suggestion: <strong>{suggestedCategory.categoryName}</strong> (Confidence match)
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setForm({ ...form, categoryId: suggestedCategory.categoryId });
                      setSuggestedCategory(null);
                    }}
                    sx={{
                      bgcolor: '#2563eb',
                      fontSize: '0.72rem',
                      py: 0.3,
                      px: 1.2,
                      '&:hover': { bgcolor: '#1d4ed8' },
                    }}
                  >
                    Apply Category
                  </Button>
                </Box>
              </Grid>
            )}

            {/* Description */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                Detailed Description & Error Information *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                size="small"
                placeholder="Describe what occurred, any error codes displayed, troubleshooting attempts, and affected equipment..."
                value={form.description}
                onChange={setField('description')}
                onBlur={runDuplicateCheck}
                required
              />
            </Grid>

            {/* Service & Category Selects */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                Affected IT Service
              </Typography>
              <Select
                fullWidth
                size="small"
                displayEmpty
                value={form.serviceId}
                onChange={setField('serviceId')}
              >
                <MenuItem value="">
                  <em>Auto-detect / Not Sure</em>
                </MenuItem>
                {services.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                Incident Category
              </Typography>
              <Select
                fullWidth
                size="small"
                displayEmpty
                value={form.categoryId}
                onChange={setField('categoryId')}
              >
                <MenuItem value="">
                  <em>Awaiting Classification / Not Sure</em>
                </MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Priority Engine Multipliers */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  color: '#15243b',
                  fontSize: '0.95rem',
                  mb: 0.5,
                }}
              >
                Priority Engine Parameters
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
                The priority score is computed dynamically via rule-based multiplication: Impact × Urgency × Business Criticality.
              </Typography>
            </Grid>

            {/* Impact */}
            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                IMPACT (Scope of users)
              </Typography>
              <Select
                fullWidth
                size="small"
                value={form.impact}
                onChange={setField('impact')}
              >
                {IMPACT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.78rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Urgency */}
            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                URGENCY (Time sensitivity)
              </Typography>
              <Select
                fullWidth
                size="small"
                value={form.urgency}
                onChange={setField('urgency')}
              >
                {URGENCY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.78rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Business Criticality */}
            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                CRITICALITY (Business impact)
              </Typography>
              <Select
                fullWidth
                size="small"
                value={form.businessCriticality}
                onChange={setField('businessCriticality')}
              >
                {CRITICALITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.78rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Live Formula Preview Box */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                    CALCULATED FORMULA SCORE:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#15243b' }}>
                    {form.impact} (Impact) × {form.urgency} (Urgency) × {form.businessCriticality} (Criticality) ={' '}
                    <strong style={{ color: priorityBadge.color }}>{score} points</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    ASSIGNED LEVEL:
                  </Typography>
                  <Chip
                    label={priorityBadge.label}
                    sx={{
                      fontWeight: 700,
                      bgcolor: priorityBadge.bg,
                      color: priorityBadge.color,
                      border: `1px solid ${priorityBadge.border}`,
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Submit Action */}
            <Grid item xs={12} sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/employee')}
                disabled={loading}
                sx={{ borderColor: '#cbd5e1', color: '#475569' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendOutlined />}
                disabled={loading}
                sx={{
                  bgcolor: '#15243b',
                  color: 'white',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#0f1a2b' },
                }}
              >
                {loading ? 'Submitting Incident...' : 'Submit Incident Ticket'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Layout>
  );
}
