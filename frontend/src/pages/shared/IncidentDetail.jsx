import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip,
  Button, Divider, TextField, Tab, Tabs, Alert,
  List, ListItem, ListItemText, ListItemAvatar, Avatar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { incidentAPI, technicianAPI, feedbackAPI, auditAPI } from '../../api';
import { StatusChip, PriorityChip } from '../../components/StatusChip';
import { useAuth } from '../../context/AuthContext';

const NEXT_STATUS = {
  EMPLOYEE: { RESOLVED: 'VERIFIED', VERIFIED: 'CLOSED' },
  TECHNICIAN: {
    ASSIGNED: 'ACKNOWLEDGED', ACKNOWLEDGED: 'IN_PROGRESS',
    IN_PROGRESS: 'RESOLVED'
  },
  ADMINISTRATOR: {
    NEW: 'CLASSIFIED', CLASSIFIED: 'ASSIGNED',
    ASSIGNED: 'ACKNOWLEDGED', ACKNOWLEDGED: 'IN_PROGRESS',
    IN_PROGRESS: 'RESOLVED', RESOLVED: 'VERIFIED', VERIFIED: 'CLOSED'
  }
};

export default function IncidentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [notes, setNotes] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [tab, setTab] = useState(0);
  const [noteContent, setNoteContent] = useState('');
  const [resolution, setResolution] = useState('');
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      incidentAPI.getById(id),
      incidentAPI.getNotes(id),
      auditAPI.getForIncident(id)
    ]).then(([incRes, notesRes, auditRes]) => {
      setIncident(incRes.data);
      setNotes(notesRes.data);
      setAuditLog(auditRes.data);
    }).catch(() => setError('Failed to load incident'))
    .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await incidentAPI.updateStatus(id, {
        newStatus,
        resolutionDetails: newStatus === 'RESOLVED' ? resolution : undefined,
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    try {
      await incidentAPI.addNote(id, { content: noteContent, noteType: 'COMMENT' });
      setNoteContent('');
      load();
    } catch {}
  };

  const handleFeedback = async () => {
    try {
      await feedbackAPI.submit(id, feedback);
      setFeedbackSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Feedback submission failed');
    }
  };

  if (loading) return <Layout title="Loading..."><Typography>Loading incident...</Typography></Layout>;
  if (error && !incident) return <Layout title="Error"><Alert severity="error">{error}</Alert></Layout>;
  if (!incident) return null;

  const availableNext = NEXT_STATUS[user?.role]?.[incident.status];

  return (
    <Layout title={`Incident: ${incident.incidentNumber}`}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Header */}
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">{incident.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {incident.incidentNumber} • Created: {new Date(incident.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              {incident.priority && <PriorityChip priority={incident.priority} />}
              <StatusChip status={incident.status} />
              {availableNext && (
                <Button variant="contained" size="small"
                  onClick={() => handleStatusUpdate(availableNext)}>
                  Move to {availableNext.replace('_', ' ')}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Detail Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Description</Typography>
              <Typography variant="body1">{incident.description}</Typography>
              {incident.resolutionDetails && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="success.main" gutterBottom>Resolution Details</Typography>
                  <Typography variant="body2">{incident.resolutionDetails}</Typography>
                </>
              )}
              {incident.status === 'IN_PROGRESS' && user?.role === 'TECHNICIAN' && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <TextField fullWidth multiline rows={3} label="Resolution Details"
                    value={resolution} onChange={e => setResolution(e.target.value)}
                    helperText="Required when resolving" />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Details</Typography>
              {[
                ['Reporter', incident.reporter?.fullName],
                ['Category', incident.category?.name || '-'],
                ['Service', incident.service?.name || '-'],
                ['Assigned To', incident.assignedTechnician?.user?.fullName || 'Unassigned'],
                ['Priority Score', incident.priorityScore || '-'],
                ['Impact', incident.impact],
                ['Urgency', incident.urgency],
                ['Criticality', incident.businessCriticality],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">{k}</Typography>
                  <Typography variant="body2" fontWeight="medium">{v}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs: Notes / Audit / Feedback */}
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <Tab label={`Notes (${notes.length})`} />
          <Tab label={`Audit (${auditLog.length})`} />
          {user?.role === 'EMPLOYEE' && incident.status === 'RESOLVED' && <Tab label="Feedback" />}
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <Box>
              <List>
                {notes.map(note => (
                  <ListItem key={note.id} alignItems="flex-start" sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {note.author?.fullName?.[0] || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">{note.author?.fullName}</Typography>
                        <Chip label={note.noteType} size="small" />
                        <Typography variant="caption" color="text.secondary">{new Date(note.createdAt).toLocaleString()}</Typography>
                      </Box>}
                      secondary={note.content}
                    />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" multiline rows={2} placeholder="Add a comment..."
                  value={noteContent} onChange={e => setNoteContent(e.target.value)} />
                <Button variant="contained" onClick={handleAddNote}>Post</Button>
              </Box>
            </Box>
          )}
          {tab === 1 && (
            <List>
              {auditLog.map(log => (
                <ListItem key={log.id} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <ListItemText
                    primary={<Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={log.action} size="small" color="primary" />
                      {log.previousState && <Typography variant="caption">{log.previousState} → {log.newState}</Typography>}
                    </Box>}
                    secondary={`${log.actor?.username} • ${new Date(log.timestamp).toLocaleString()} • ${log.description}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
          {tab === 2 && user?.role === 'EMPLOYEE' && (
            <Box sx={{ maxWidth: 400 }}>
              {feedbackSubmitted ? (
                <Alert severity="success">Thank you for your feedback!</Alert>
              ) : (
                <>
                  <Typography variant="body2" gutterBottom>Rate the resolution (1-5 stars):</Typography>
                  <TextField fullWidth type="number" label="Rating (1-5)" inputProps={{ min: 1, max: 5 }}
                    value={feedback.rating} onChange={e => setFeedback({ ...feedback, rating: +e.target.value })}
                    sx={{ mb: 2 }} />
                  <TextField fullWidth multiline rows={3} label="Comments (optional)"
                    value={feedback.comment} onChange={e => setFeedback({ ...feedback, comment: e.target.value })}
                    sx={{ mb: 2 }} />
                  <Button variant="contained" onClick={handleFeedback}>Submit Feedback</Button>
                </>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
