import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, IconButton, TextField, Button, Paper,
  Avatar, Chip, CircularProgress, Fade, Tooltip, Divider,
  Card, CardContent
} from '@mui/material';
import {
  ChatOutlined,
  Close,
  Send,
  AutoAwesome,
  Refresh,
  ConfirmationNumberOutlined,
  CheckCircle,
  HelpOutline,
  OpenInNew
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '../api';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_QUERIES = [
  "Corporate WiFi keeps dropping connection",
  "Outlook cannot connect to mail server",
  "Request password reset for Active Directory",
  "Laptop screen flickers when on external monitor"
];

export default function AiChatbotWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.fullName ? user.fullName.split(' ')[0] : 'there'}! 👋 I am your **I-ITSM Copilot** powered by Google Gemini. Describe your IT problem or outage, and I will assist in troubleshooting and auto-generate an incident ticket for you.`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketDraft, setTicketDraft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      aiApi.getStatus().then((res) => setAiStatus(res.data)).catch(() => {});
    }
  }, [isOpen, messages, ticketDraft]);

  const handleSend = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const newHistory = [...messages, { role: 'user', content: textToSend }];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    try {
      // Build API request
      const formattedHistory = newHistory.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content
      }));

      const res = await aiApi.chat({
        history: formattedHistory,
        message: textToSend
      });

      const data = res.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'I have analyzed your request.',
        liveModel: data.liveModel
      }]);

      if (data.ticketDraft && data.readyToSubmit) {
        setTicketDraft(data.ticketDraft);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ I encountered an error communicating with the AI service. Please try again or report directly using the standard form.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDraft = async () => {
    if (!ticketDraft || submitting) return;
    setSubmitting(true);
    try {
      const res = await aiApi.submitDraftTicket({
        title: ticketDraft.title,
        description: ticketDraft.description,
        categoryId: ticketDraft.categoryId,
        serviceId: ticketDraft.serviceId,
        impact: ticketDraft.impact,
        urgency: ticketDraft.urgency,
        businessCriticality: ticketDraft.businessCriticality || 'MEDIUM'
      });
      const incident = res.data;
      setSubmittedIncident(incident);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🎉 **Incident ${incident.incidentNumber} created successfully!** It has been entered into the active queue with priority **${incident.priority}** and automatically assigned to the best technician.`
      }]);
      setTicketDraft(null);
    } catch (e) {
      alert('Failed to submit ticket: ' + (e.response?.data?.message || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello ${user?.fullName ? user.fullName.split(' ')[0] : 'there'}! 👋 I am your **I-ITSM Copilot** powered by Google Gemini. Describe your IT problem or outage, and I will assist in troubleshooting and auto-generate an incident ticket for you.`
      }
    ]);
    setTicketDraft(null);
    setSubmittedIncident(null);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <Tooltip title="AI Virtual Service Desk Assistant" placement="left">
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1200,
            width: 54,
            height: 54,
            bgcolor: isOpen ? '#1e293b' : '#2563eb',
            color: 'white',
            boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
            transition: 'all 0.25s ease-in-out',
            '&:hover': {
              bgcolor: isOpen ? '#0f172a' : '#1d4ed8',
              transform: 'scale(1.05)'
            }
          }}
        >
          {isOpen ? <Close /> : <AutoAwesome />}
        </IconButton>
      </Tooltip>

      {/* Floating Chat Container */}
      <Fade in={isOpen}>
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 88,
            right: 24,
            width: { xs: 'calc(100vw - 32px)', sm: 400 },
            height: 560,
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 1200,
            borderRadius: 3,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 16px 40px rgba(0,0,0,0.18)'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#15243b',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Avatar
                sx={{
                  bgcolor: '#3b82f6',
                  width: 34,
                  height: 34,
                  boxShadow: '0 0 10px rgba(59,130,246,0.5)'
                }}
              >
                <AutoAwesome sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
                  I-ITSM Copilot
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: aiStatus?.configured ? '#10b981' : '#f59e0b'
                    }}
                  />
                  <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {aiStatus?.configured ? 'Gemini 2.0 Flash' : 'Simulated Heuristic Engine'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Reset Chat">
                <IconButton size="small" onClick={handleResetChat} sx={{ color: '#cbd5e1' }}>
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: '#cbd5e1' }}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Chat Messages Stream */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              bgcolor: 'background.default'
            }}
          >
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: isUser ? '#2563eb' : 'background.paper',
                      color: isUser ? 'white' : 'text.primary',
                      fontSize: '0.85rem',
                      lineHeight: 1.45,
                      boxShadow: isUser ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                      border: isUser ? 'none' : '1px solid',
                      borderColor: 'divider',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {msg.content}
                  </Box>
                </Box>
              );
            })}

            {/* Live Ticket Draft Preview */}
            {ticketDraft && !submittedIncident && (
              <Fade in={true}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: '#93c5fd',
                    bgcolor: '#eff6ff',
                    p: 1.5,
                    mt: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <ConfirmationNumberOutlined sx={{ color: '#2563eb', fontSize: 18 }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e40af' }}>
                        Ready to File Incident Ticket
                      </Typography>
                    </Box>
                    <Chip
                      label="AI Drafted"
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#dbeafe', color: '#1d4ed8' }}
                    />
                  </Box>

                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b', mb: 0.5 }}>
                    {ticketDraft.title}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, my: 1 }}>
                    <Chip
                      label={`Category: ${ticketDraft.categoryName || 'General'}`}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#e0e7ff', color: '#3730a3' }}
                    />
                    <Chip
                      label={`Service: ${ticketDraft.serviceName || 'General'}`}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#e0f2fe', color: '#0369a1' }}
                    />
                    <Chip
                      label={`Impact: ${ticketDraft.impact}`}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#fef3c7', color: '#92400e' }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <CheckCircle />}
                    onClick={handleSubmitDraft}
                    disabled={submitting}
                    sx={{
                      mt: 1,
                      bgcolor: '#2563eb',
                      '&:hover': { bgcolor: '#1d4ed8' },
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      borderRadius: 1.5
                    }}
                  >
                    {submitting ? 'Submitting to Queue...' : 'Confirm & Submit Ticket'}
                  </Button>
                </Card>
              </Fade>
            )}

            {/* Submitted Ticket Banner */}
            {submittedIncident && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#065f46' }}>
                  Incident Ref: {submittedIncident.incidentNumber}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/incidents/${submittedIncident.id}`);
                  }}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 1.5
                  }}
                >
                  View Incident Details
                </Button>
              </Box>
            )}

            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                <CircularProgress size={16} />
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  Gemini is thinking...
                </Typography>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Suggestion Chips */}
          {messages.length <= 2 && (
            <Box
              sx={{
                p: 1.2,
                px: 2,
                display: 'flex',
                gap: 0.8,
                overflowX: 'auto',
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
                '&::-webkit-scrollbar': { display: 'none' }
              }}
            >
              {SUGGESTED_QUERIES.map((q, idx) => (
                <Chip
                  key={idx}
                  label={q}
                  size="small"
                  onClick={() => handleSend(q)}
                  sx={{
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                />
              ))}
            </Box>
          )}

          {/* Input Box */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
              alignItems: 'center'
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Type your issue or question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.85rem'
                }
              }}
            />
            <IconButton
              color="primary"
              onClick={() => handleSend()}
              disabled={loading || !inputMessage.trim()}
              sx={{
                bgcolor: '#2563eb',
                color: 'white',
                '&:hover': { bgcolor: '#1d4ed8' },
                '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
                borderRadius: 2,
                width: 38,
                height: 38
              }}
            >
              <Send fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}
