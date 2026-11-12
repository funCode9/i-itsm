import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, Alert, Chip,
  CircularProgress, IconButton, Tooltip, Divider
} from '@mui/material';
import {
  SmartToyOutlined,
  CheckCircleOutline,
  ErrorOutline,
  Close,
  SpeedOutlined,
  VpnKeyOutlined,
  PlayArrowOutlined,
  AutoAwesome
} from '@mui/icons-material';
import { aiApi } from '../api';

export default function AiConfigModal({ open, onClose, onConfigSaved }) {
  const [status, setStatus] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadStatus = async () => {
    try {
      const res = await aiApi.getStatus();
      setStatus(res.data);
    } catch (e) {
      console.error('Failed to load AI status', e);
    }
  };

  useEffect(() => {
    if (open) {
      loadStatus();
      setTestResult(null);
      setSaveSuccess(false);
      setErrorMsg('');
      setApiKeyInput('');
    }
  }, [open]);

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      setErrorMsg('Please enter a valid Gemini API key (starts with AIza...)');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSaveSuccess(false);
    try {
      const res = await aiApi.setApiKey(apiKeyInput.trim());
      setStatus(res.data);
      setSaveSuccess(true);
      setApiKeyInput('');
      onConfigSaved?.();
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await aiApi.testConnection();
      setTestResult(res.data);
    } catch (e) {
      setTestResult({
        success: false,
        message: e.response?.data?.message || 'Connection test failed',
        latencyMs: 0
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AutoAwesome fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'text.primary' }}>
              Google Gemini AI Engine Settings
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Resolution recommendations & conversational incident reporting
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Status Banner */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2,
            bgcolor: status?.configured ? '#ecfdf5' : '#f8fafc',
            border: '1px solid',
            borderColor: status?.configured ? '#a7f3d0' : '#e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {status?.configured ? (
                <CheckCircleOutline sx={{ color: '#059669', fontSize: 20 }} />
              ) : (
                <ErrorOutline sx={{ color: '#d97706', fontSize: 20 }} />
              )}
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: status?.configured ? '#065f46' : '#92400e' }}>
                {status?.configured ? 'Gemini API Connected & Ready' : 'Gemini Key Not Configured (Using Smart Heuristic Fallback)'}
              </Typography>
            </Box>
            <Chip
              label={status?.configured ? 'LIVE LLM' : 'SIMULATION'}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                bgcolor: status?.configured ? '#10b981' : '#f59e0b',
                color: 'white'
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
            <Box>
              <strong>Active Model:</strong> {status?.preferredModel || 'gemini-2.0-flash'}
            </Box>
            <Box>
              <strong>Key:</strong> {status?.maskedApiKey || 'None'}
            </Box>
            <Box>
              <strong>Source:</strong> {status?.source || 'Default'}
            </Box>
          </Box>
        </Box>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2, fontSize: '0.82rem' }}>
            Gemini API Key successfully saved and active!
          </Alert>
        )}

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.82rem' }}>
            {errorMsg}
          </Alert>
        )}

        {/* Input API Key */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8, color: 'text.primary' }}>
            Configure or Update Gemini API Key
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
            Obtain a free key in ~30s from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>Google AI Studio</a>.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Paste AIzaSy... API key here"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              InputProps={{
                startAdornment: <VpnKeyOutlined sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.85rem'
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSaveKey}
              disabled={loading || !apiKeyInput.trim()}
              sx={{
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#1d4ed8' },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Save Key'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Connection Testing */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Live Connectivity Test
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={testLoading ? <CircularProgress size={14} /> : <PlayArrowOutlined />}
              onClick={handleTestConnection}
              disabled={testLoading}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Test Gemini Ping
            </Button>
          </Box>

          {testResult && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: testResult.success ? '#f0fdf4' : '#fef2f2',
                border: '1px solid',
                borderColor: testResult.success ? '#bbf7d0' : '#fecaca',
                mt: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: testResult.success ? '#166534' : '#991b1b' }}>
                  {testResult.message}
                </Typography>
                {testResult.latencyMs > 0 && (
                  <Chip
                    icon={<SpeedOutlined sx={{ fontSize: '13px !important' }} />}
                    label={`${testResult.latencyMs} ms`}
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                  />
                )}
              </Box>
              {testResult.sampleResponse && (
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    color: '#334155',
                    bgcolor: 'rgba(255,255,255,0.7)',
                    p: 1,
                    borderRadius: 1,
                    m: 0,
                    overflowX: 'auto'
                  }}
                >
                  {testResult.sampleResponse}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
