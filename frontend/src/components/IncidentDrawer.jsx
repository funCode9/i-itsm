import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, IconButton, Button, Divider, TextField,
  MenuItem, Select, FormControl, InputLabel, Chip, Avatar, Alert, Rating,
  CircularProgress, Collapse, LinearProgress
} from '@mui/material';
import {
  Close, CheckCircle, WarningAmber, TimerOutlined,
  PersonOutline, OpenInNew, SendOutlined, Star,
  PsychologyOutlined, TrendingUpOutlined, ReportProblemOutlined,
  AutoFixHighOutlined, ArrowUpwardOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { StatusChip, PriorityChip } from './StatusChip';
import { incidentApi, feedbackApi } from '../api';
import { useAuth } from '../context/AuthContext';

const STAGES = [
  'NEW', 'CLASSIFIED', 'ASSIGNED', 'ACKNOWLEDGED',
  'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED'
];

export default function IncidentDrawer({ open, incident, onClose, onRefresh }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('INTERNAL_DIAGNOSTIC');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Intelligent Features State
  const [prediction, setPrediction] = useState(null);
  const [rca, setRca] = useState(null);
  const [rcaLoading, setRcaLoading] = useState(false);
  const [rcaOpen, setRcaOpen] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [escalateMsg, setEscalateMsg] = useState('');

  useEffect(() => {
    if (incident?.id) {
      setRca(null);
      setRcaOpen(false);
      setEscalateMsg('');
      incidentApi.getSlaPrediction(incident.id)
        .then((res) => setPrediction(res.data))
        .catch(() => setPrediction(null));
    }
  }, [incident?.id]);

  const handleRunRca = async () => {
    if (!incident?.id) return;
    setRcaLoading(true);
    try {
      const res = await incidentApi.getRootCause(incident.id);
      setRca(res.data);
      setRcaOpen(true);
    } catch (e) {
      setErrorMsg('Failed to run root cause analysis');
    } finally {
      setRcaLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!incident?.id) return;
    const reason = prompt('Enter reason for automated incident escalation:', 'SLA risk / critical blocker');
    if (!reason) return;
    setEscalating(true);
    try {
      await incidentApi.escalate(incident.id, reason);
      setEscalateMsg('Incident successfully escalated to higher tier');
      onRefresh?.();
      incidentApi.getSlaPrediction(incident.id).then((res) => setPrediction(res.data)).catch(() => {});
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Escalation failed');
    } finally {
      setEscalating(false);
    }
  };

  if (!incident) return null;

  const currentStageIndex = STAGES.indexOf(incident.status);

  // Transition handler
  const handleTransition = async (newStatus, resolutionSummary = null) => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      if (newStatus === 'RESOLVED' && !resolutionSummary) {
        const sol = prompt('Enter official incident resolution summary:');
        if (!sol) {
          setActionLoading(false);
          return;
        }
        await incidentApi.resolve(incident.id, sol);
      } else {
        await incidentApi.updateStatus(incident.id, newStatus);
      }
      onRefresh?.();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'State transition failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Add note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setActionLoading(true);
    setErrorMsg('');
    try {
      await incidentApi.addNote(incident.id, {
        content: noteContent,
        noteType: noteType,
      });
      setNoteContent('');
      onRefresh?.();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit feedback
  const handleFeedback = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await feedbackApi.submit({
        incidentId: incident.id,
        rating: rating,
        comments: feedbackComment,
      });
      setFeedbackSuccess(true);
      onRefresh?.();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100vw', sm: 540 },
          maxWidth: '100vw',
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          color: 'text.primary',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-15px 0 40px rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              color: '#4f85c8',
              bgcolor: '#eff6ff',
              px: 1,
              py: 0.3,
              borderRadius: '4px',
              border: '1px solid #bfdbfe',
              fontSize: '0.8rem',
            }}
          >
            {incident.incidentNumber}
          </Typography>
          <PriorityChip priority={incident.priority} />
          <StatusChip status={incident.status} />
          {incident.escalated && (
            <Chip
              label={`Tier ${incident.escalationLevel || 1} Escalated`}
              size="small"
              sx={{
                bgcolor: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => {
              onClose();
              navigate(`/incidents/${incident.id}`);
            }}
            title="Open Full Page"
            sx={{ color: '#64748b' }}
          >
            <OpenInNew fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: '#64748b' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Drawer Body */}
      <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        {escalateMsg && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '8px', bgcolor: '#fffbeb', color: '#92400e' }} onClose={() => setEscalateMsg('')}>
            {escalateMsg}
          </Alert>
        )}

        {/* Title & Description */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            color: '#15243b',
            mb: 1,
            lineHeight: 1.3,
          }}
        >
          {incident.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            lineHeight: 1.6,
            mb: 2.5,
            whiteSpace: 'pre-wrap',
          }}
        >
          {incident.description}
        </Typography>

        {/* Metadata 2x2 Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.8,
            p: 2,
            bgcolor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #edf0f4',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
              Service & Category
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.3 }}>
              {incident.service?.name || 'General IT'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {incident.category?.name || 'Unclassified'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
              Reported By
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.3 }}>
              {incident.reporter?.fullName || incident.reporter?.username || 'Employee'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {incident.reporter?.department || 'Department Staff'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
              Priority Score Formula
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.3 }}>
              Score: {incident.priorityScore || '—'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Impact {incident.impact} × Urg {incident.urgency} × Crit {incident.businessCriticality}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
              Created Timestamp
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.3 }}>
              {new Date(incident.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {new Date(incident.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>

        {/* 8-Stage Lifecycle Progression Stepper */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#475569',
              mb: 1.5,
              fontSize: '0.7rem',
            }}
          >
            Lifecycle FSM Progression ({currentStageIndex + 1} of 8)
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, overflowX: 'auto', pb: 1 }}>
            {STAGES.map((st, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <Box
                  key={st}
                  sx={{
                    flex: 1,
                    minWidth: 48,
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      height: 6,
                      borderRadius: '3px',
                      bgcolor: isPast ? '#10b981' : isCurrent ? '#4f85c8' : '#e2e8f0',
                      mb: 0.8,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isPast ? '#059669' : isCurrent ? '#1e40af' : '#94a3b8',
                      display: 'block',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {st.replace('_', ' ')}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* SLA Monitor Box */}
        {incident.sla && (
          <Box
            sx={{
              p: 2,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: incident.sla.resolutionBreached ? '#fecaca' : '#fef3c7',
              bgcolor: incident.sla.resolutionBreached ? '#fef2f2' : '#fffbeb',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerOutlined sx={{ fontSize: '18px', color: incident.sla.resolutionBreached ? '#ef4444' : '#d97706' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem', color: incident.sla.resolutionBreached ? '#b91c1c' : '#92400e' }}>
                  SLA Target & Compliance
                </Typography>
              </Box>
              <Chip
                label={incident.sla.resolutionBreached ? 'BREACHED' : 'ON TRACK'}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: incident.sla.resolutionBreached ? '#ef4444' : '#10b981',
                  color: 'white',
                }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, fontSize: '0.75rem' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#78716c', display: 'block', fontSize: '0.68rem' }}>
                  Response Deadline:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#292524', fontSize: '0.78rem' }}>
                  {incident.sla.responseDeadline ? new Date(incident.sla.responseDeadline).toLocaleTimeString() : 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#78716c', display: 'block', fontSize: '0.68rem' }}>
                  Resolution Deadline:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#292524', fontSize: '0.78rem' }}>
                  {incident.sla.resolutionDeadline ? new Date(incident.sla.resolutionDeadline).toLocaleTimeString() : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Predictive SLA Risk Telemetry */}
        {prediction && (
          <Box
            sx={{
              p: 2,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: prediction.riskLevel === 'CRITICAL' ? '#fca5a5' : prediction.riskLevel === 'HIGH' ? '#fed7aa' : '#e2e8f0',
              bgcolor: prediction.riskLevel === 'CRITICAL' ? '#fef2f2' : prediction.riskLevel === 'HIGH' ? '#fffaf0' : '#f8fafc',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpOutlined sx={{ fontSize: '18px', color: prediction.riskScore >= 70 ? '#dc2626' : '#2563eb' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>
                  Predictive SLA Violation Risk
                </Typography>
              </Box>
              <Chip
                label={`${prediction.riskLevel} (${prediction.riskScore}%)`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: prediction.riskLevel === 'CRITICAL' ? '#dc2626' : prediction.riskLevel === 'HIGH' ? '#ea580c' : prediction.riskLevel === 'MEDIUM' ? '#d97706' : '#16a34a',
                  color: 'white',
                }}
              />
            </Box>

            <Box sx={{ mb: 1.2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>Time Elapsed</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.7rem' }}>{prediction.elapsedPercentage}% ({prediction.remainingMinutes}m remaining)</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, prediction.elapsedPercentage)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: prediction.riskScore >= 70 ? '#dc2626' : '#3b82f6',
                  },
                }}
              />
            </Box>

            {prediction.riskFactors?.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', fontSize: '0.68rem', mb: 0.3 }}>
                  Risk Indicators:
                </Typography>
                {prediction.riskFactors.map((rf, i) => (
                  <Typography key={i} variant="caption" sx={{ color: '#475569', display: 'block', fontSize: '0.7rem', pl: 1, borderLeft: '2px solid #cbd5e1', mb: 0.3 }}>
                    • {rf}
                  </Typography>
                ))}
              </Box>
            )}

            {prediction.recommendedAction && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, p: 0.8, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: '4px', color: '#1e293b', fontWeight: 600, fontSize: '0.7rem' }}>
                Action: {prediction.recommendedAction}
              </Typography>
            )}
          </Box>
        )}

        {/* Automated Root-Cause Analysis (RCA) */}
        <Box
          sx={{
            p: 2,
            borderRadius: '8px',
            border: '1px solid #e0e7ff',
            bgcolor: '#f5f7ff',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyOutlined sx={{ fontSize: '18px', color: '#4f46e5' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#312e81' }}>
                Automated Root-Cause Analysis (RCA)
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={handleRunRca}
              disabled={rcaLoading}
              startIcon={rcaLoading ? <CircularProgress size={12} color="inherit" /> : <AutoFixHighOutlined sx={{ fontSize: 14 }} />}
              sx={{
                fontSize: '0.68rem',
                py: 0.2,
                px: 1,
                textTransform: 'none',
                borderColor: '#c7d2fe',
                color: '#4338ca',
                bgcolor: '#ffffff',
                '&:hover': { bgcolor: '#eef2ff' },
              }}
            >
              {rca ? 'Re-analyze' : 'Run RCA'}
            </Button>
          </Box>

          <Collapse in={Boolean(rca)}>
            {rca && (
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #c7d2fe' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                  <Chip
                    label={rca.domainClassification}
                    size="small"
                    sx={{ bgcolor: '#e0e7ff', color: '#3730a3', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669', fontSize: '0.72rem' }}>
                    Confidence: {rca.confidenceScore}%
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.82rem', mb: 0.5 }}>
                  Probable Cause: {rca.probableRootCause}
                </Typography>

                {rca.evidenceKeywords?.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {rca.evidenceKeywords.map((kw, i) => (
                      <Chip key={i} label={kw} size="small" sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#ffffff', border: '1px solid #c7d2fe' }} />
                    ))}
                  </Box>
                )}

                {rca.recommendedWorkaround && (
                  <Box sx={{ p: 1, bgcolor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#b45309', display: 'block', fontSize: '0.68rem' }}>
                      Recommended Workaround:
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem' }}>
                      {rca.recommendedWorkaround}
                    </Typography>
                  </Box>
                )}

                {rca.remediationSteps?.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#312e81', display: 'block', fontSize: '0.68rem', mb: 0.3 }}>
                      Remediation Plan:
                    </Typography>
                    {rca.remediationSteps.map((step, idx) => (
                      <Typography key={idx} variant="caption" sx={{ color: '#334155', display: 'block', fontSize: '0.7rem', mb: 0.2 }}>
                        {idx + 1}. {step}
                      </Typography>
                    ))}
                  </Box>
                )}

                {rca.correlationSummary && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#6366f1', fontStyle: 'italic', fontSize: '0.68rem' }}>
                    🔗 {rca.correlationSummary}
                  </Typography>
                )}
              </Box>
            )}
          </Collapse>
        </Box>
        <Box
          sx={{
            p: 2,
            borderRadius: '8px',
            bgcolor: '#f8fafc',
            border: '1px solid #edf0f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#4f85c8', width: 36, height: 36, fontSize: '0.85rem' }}>
              <PersonOutline />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#15243b' }}>
                {incident.assignee?.user?.fullName || incident.assignee?.user?.username || 'Unassigned'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                {incident.assignee?.specialization || 'Awaiting Strategy Assignment'}
              </Typography>
            </Box>
          </Box>
          {incident.assignee && (
            <Chip
              label="Assigned"
              size="small"
              sx={{ bgcolor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 600 }}
            />
          )}
        </Box>

        {/* Lifecycle Action Buttons */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', color: '#475569', mb: 1, fontSize: '0.7rem' }}>
            Action Controls
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {user?.role === 'ADMINISTRATOR' && incident.status === 'NEW' && (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleTransition('CLASSIFIED')}
                disabled={actionLoading}
                sx={{ bgcolor: '#4f85c8', color: 'white' }}
              >
                Mark Classified
              </Button>
            )}

            {user?.role === 'ADMINISTRATOR' && (incident.status === 'CLASSIFIED' || incident.status === 'NEW') && (
              <Button
                variant="contained"
                size="small"
                onClick={async () => {
                  setActionLoading(true);
                  try {
                    await incidentApi.autoAssign(incident.id);
                    onRefresh?.();
                  } catch (e) {
                    setErrorMsg('Auto-assignment failed');
                  } finally {
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
                sx={{ bgcolor: '#6d28d9', color: 'white' }}
              >
                Trigger Auto Assignment
              </Button>
            )}

            {user?.role === 'TECHNICIAN' && incident.status === 'ASSIGNED' && (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleTransition('ACKNOWLEDGED')}
                disabled={actionLoading}
                sx={{ bgcolor: '#0e7490', color: 'white' }}
              >
                Acknowledge Ticket
              </Button>
            )}

            {user?.role === 'TECHNICIAN' && incident.status === 'ACKNOWLEDGED' && (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleTransition('IN_PROGRESS')}
                disabled={actionLoading}
                sx={{ bgcolor: '#d97706', color: 'white' }}
              >
                Start Progress
              </Button>
            )}

            {user?.role === 'TECHNICIAN' && incident.status === 'IN_PROGRESS' && (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleTransition('RESOLVED')}
                disabled={actionLoading}
                sx={{ bgcolor: '#059669', color: 'white' }}
              >
                Submit Resolution
              </Button>
            )}

            {user?.role === 'EMPLOYEE' && incident.status === 'RESOLVED' && (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleTransition('VERIFIED')}
                disabled={actionLoading}
                sx={{ bgcolor: '#0f766e', color: 'white' }}
              >
                Verify & Confirm Fix
              </Button>
            )}

            {user?.role === 'ADMINISTRATOR' && (incident.status === 'VERIFIED' || incident.status === 'RESOLVED') && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleTransition('CLOSED')}
                disabled={actionLoading}
                sx={{ borderColor: '#64748b', color: '#334155' }}
              >
                Close Incident
              </Button>
            )}

            {/* Pre-emptive / SLA Escalation Button */}
            {!['RESOLVED', 'VERIFIED', 'CLOSED'].includes(incident.status) && (user?.role === 'ADMINISTRATOR' || user?.role === 'TECHNICIAN') && (
              <Button
                variant="outlined"
                size="small"
                startIcon={escalating ? <CircularProgress size={12} color="inherit" /> : <ArrowUpwardOutlined sx={{ fontSize: 14 }} />}
                onClick={handleEscalate}
                disabled={escalating || actionLoading}
                sx={{
                  borderColor: '#fca5a5',
                  color: '#b91c1c',
                  bgcolor: '#fff5f5',
                  '&:hover': { bgcolor: '#fee2e2', borderColor: '#ef4444' },
                }}
              >
                {incident.escalated ? `Re-Escalate (Tier ${(incident.escalationLevel || 1) + 1})` : 'Escalate Incident'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Feedback Section (if Resolved / Verified / Closed) */}
        {['RESOLVED', 'VERIFIED', 'CLOSED'].includes(incident.status) && (
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #edf0f4', mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#15243b', mb: 1 }}>
              Service Feedback & Rating
            </Typography>

            {incident.feedback ? (
              <Box>
                <Rating value={incident.feedback.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ color: '#475569', mt: 0.5, fontStyle: 'italic' }}>
                  "{incident.feedback.comments || 'No comment provided'}"
                </Typography>
              </Box>
            ) : user?.role === 'EMPLOYEE' ? (
              feedbackSuccess ? (
                <Alert severity="success">Feedback submitted. Thank you!</Alert>
              ) : (
                <form onSubmit={handleFeedback}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Your Rating:</Typography>
                    <Rating value={rating} onChange={(_, val) => setRating(val)} size="small" />
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Comments regarding technician resolution..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Button type="submit" size="small" variant="contained" disabled={actionLoading} sx={{ bgcolor: '#4f85c8' }}>
                    Submit Rating
                  </Button>
                </form>
              )
            ) : (
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Awaiting employee feedback rating.
              </Typography>
            )}
          </Box>
        )}

        {/* Diagnostic Notes Feed */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#15243b', mb: 1.5 }}>
            Activity & Diagnostic Notes ({incident.notes?.length || 0})
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
            {incident.notes?.map((n) => (
              <Box
                key={n.id}
                sx={{
                  p: 1.6,
                  borderRadius: '6px',
                  bgcolor: n.noteType === 'SOLUTION' ? '#ecfdf5' : n.noteType === 'INTERNAL_DIAGNOSTIC' ? '#f8fafc' : '#ffffff',
                  border: '1px solid',
                  borderColor: n.noteType === 'SOLUTION' ? '#a7f3d0' : '#e2e8f0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                    {n.author?.fullName || n.author?.username || 'Author'}
                  </Typography>
                  <Chip
                    label={n.noteType?.replace('_', ' ')}
                    size="small"
                    sx={{ height: 16, fontSize: '0.6rem', fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                  {n.content}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Append Note Form */}
          <form onSubmit={handleAddNote}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Select
                size="small"
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                sx={{ width: 170, fontSize: '0.78rem' }}
              >
                <MenuItem value="PUBLIC">Public Note</MenuItem>
                <MenuItem value="INTERNAL_DIAGNOSTIC">Diagnostic Note</MenuItem>
                <MenuItem value="SOLUTION">Solution Note</MenuItem>
              </Select>
              <TextField
                fullWidth
                size="small"
                placeholder="Add investigation or diagnostic note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="small"
                startIcon={<SendOutlined fontSize="small" />}
                disabled={actionLoading || !noteContent.trim()}
                sx={{ bgcolor: '#15243b', color: 'white' }}
              >
                Append Note
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Drawer>
  );
}
