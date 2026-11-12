import React, { useState } from 'react';
import {
  Box, Typography, Button, Chip, CircularProgress,
  Collapse, Alert, Checkbox, FormControlLabel, Tooltip,
  IconButton, Paper, Divider
} from '@mui/material';
import {
  AutoAwesome,
  CheckCircle,
  ContentCopy,
  TimerOutlined,
  PostAddOutlined,
  ExpandMore,
  ExpandLess,
  EngineeringOutlined,
  VerifiedOutlined
} from '@mui/icons-material';
import { incidentApi } from '../api';

export default function AiResolutionCard({ incidentId, onNoteAdded }) {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [open, setOpen] = useState(false);
  const [applyingNote, setApplyingNote] = useState(false);
  const [noteApplied, setNoteApplied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const handleGenerate = async () => {
    if (!incidentId) return;
    setLoading(true);
    setErrorMsg('');
    setNoteApplied(false);
    try {
      const res = await incidentApi.getAiResolution(incidentId);
      setRecommendation(res.data);
      setOpen(true);
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Failed to generate AI resolution recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNote = async () => {
    if (!incidentId) return;
    setApplyingNote(true);
    try {
      await incidentApi.applyAiResolutionNote(incidentId);
      setNoteApplied(true);
      onNoteAdded?.();
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Failed to save recommendation as note');
    } finally {
      setApplyingNote(false);
    }
  };

  const handleCopyCommand = (cmd, index) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        borderColor: recommendation ? '#93c5fd' : 'divider',
        bgcolor: recommendation ? '#f8faff' : 'background.paper',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        mb: 2.5
      }}
    >
      {/* Top Header Banner */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: recommendation ? 'pointer' : 'default',
          borderBottom: open ? '1px solid' : 'none',
          borderColor: 'divider'
        }}
        onClick={() => recommendation && setOpen(!open)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AutoAwesome sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                AI Resolution Playbook
              </Typography>
              {recommendation && (
                <Chip
                  label={recommendation.liveModel ? 'Gemini 2.0 Flash' : 'Simulated Heuristic'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: recommendation.liveModel ? '#10b981' : '#f59e0b',
                    color: 'white'
                  }}
                />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Step-by-step diagnostic procedures, CLI commands & verification checklist
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => e.stopPropagation()}>
          {!recommendation ? (
            <Button
              variant="contained"
              size="small"
              startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesome />}
              onClick={handleGenerate}
              disabled={loading}
              sx={{
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#1d4ed8' },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                borderRadius: 2,
                px: 2
              }}
            >
              {loading ? 'Analyzing...' : 'Generate AI Fix'}
            </Button>
          ) : (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Box>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ m: 2, fontSize: '0.82rem' }}>
          {errorMsg}
        </Alert>
      )}

      {/* Expanded Recommendation Content */}
      <Collapse in={open}>
        {recommendation && (
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Meta Row: Diagnosis + Est Time */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                gap: 2
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e40af', mb: 0.5 }}>
                  PROBABLE ROOT CAUSE
                </Typography>
                <Typography sx={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 600 }}>
                  {recommendation.rootCauseHypothesis}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#475569', mt: 0.5 }}>
                  {recommendation.summary}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 150, display: 'flex', flexDirection: 'column', gap: 0.8, alignItems: { sm: 'flex-end' } }}>
                <Chip
                  icon={<TimerOutlined sx={{ fontSize: '14px !important' }} />}
                  label={`Est. Fix: ${recommendation.estimatedMinutes} mins`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: '#dbeafe',
                    color: '#1e40af'
                  }}
                />
                <Chip
                  icon={<VerifiedOutlined sx={{ fontSize: '14px !important' }} />}
                  label={`Confidence: ${recommendation.confidence || 'HIGH'}`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: '#dcfce7',
                    color: '#166534'
                  }}
                />
              </Box>
            </Box>

            {/* Remediation Steps */}
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.primary', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EngineeringOutlined fontSize="small" sx={{ color: '#2563eb' }} />
                Recommended Remediation Steps
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {recommendation.steps?.map((step, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.8,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          bgcolor: '#2563eb',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {step.stepNumber || idx + 1}
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.primary' }}>
                        {step.title}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: step.command ? 1 : 0, pl: 3.5 }}>
                      {step.description}
                    </Typography>

                    {step.command && (
                      <Box
                        sx={{
                          ml: 3.5,
                          mt: 1,
                          p: 1.2,
                          px: 1.5,
                          borderRadius: 1.5,
                          bgcolor: '#0f172a',
                          color: '#38bdf8',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1
                        }}
                      >
                        <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                          <code>{step.command}</code>
                        </Box>
                        <Tooltip title={copiedIndex === idx ? 'Copied!' : 'Copy Command'}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyCommand(step.command, idx)}
                            sx={{ color: copiedIndex === idx ? '#4ade80' : '#94a3b8' }}
                          >
                            <ContentCopy fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Verification Checklist */}
            {recommendation.verificationChecklist?.length > 0 && (
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.primary', mb: 1 }}>
                  Verification & Post-Fix Validation Checklist
                </Typography>
                <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  {recommendation.verificationChecklist.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={!!checkedItems[idx]}
                            onChange={() => toggleCheck(idx)}
                            color="success"
                          />
                        }
                        label={
                          <Typography
                            sx={{
                              fontSize: '0.82rem',
                              color: checkedItems[idx] ? 'text.secondary' : 'text.primary',
                              textDecoration: checkedItems[idx] ? 'line-through' : 'none'
                            }}
                          >
                            {item}
                          </Typography>
                        }
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Divider />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleGenerate}
                disabled={loading}
                sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.78rem', fontWeight: 600 }}
              >
                Regenerate AI Playbook
              </Button>

              <Button
                variant="contained"
                size="small"
                startIcon={applyingNote ? <CircularProgress size={14} color="inherit" /> : (noteApplied ? <CheckCircle /> : <PostAddOutlined />)}
                onClick={handleApplyNote}
                disabled={applyingNote || noteApplied}
                sx={{
                  bgcolor: noteApplied ? '#059669' : '#1e293b',
                  '&:hover': { bgcolor: noteApplied ? '#047857' : '#0f172a' },
                  textTransform: 'none',
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  px: 2
                }}
              >
                {noteApplied ? 'Applied to Internal Notes' : 'Apply Playbook to Incident Notes'}
              </Button>
            </Box>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
}
