import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Tabs, Tab, Button
} from '@mui/material';
import {
  GavelOutlined, MailOutline, RefreshOutlined
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { adminApi } from '../../api';

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminApi.getAudit().then((res) => setAuditLogs(res.data || [])).catch(() => {}),
      adminApi.getEmailLogs().then((res) => setEmailLogs(res.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Layout
      title="Audit Trail & System Logs"
      breadcrumbs={['Compliance', 'Observer Event Logs']}
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshOutlined />}
          onClick={loadData}
          sx={{ borderColor: '#cbd5e1', color: '#475569' }}
        >
          Refresh Logs
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
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: '1px solid #edf0f4',
            bgcolor: '#f8fafc',
            px: 2,
            '& .MuiTab-root': {
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
            },
          }}
        >
          <Tab
            icon={<GavelOutlined fontSize="small" />}
            iconPosition="start"
            label={`System Audit Trail (${auditLogs.length})`}
          />
          <Tab
            icon={<MailOutline fontSize="small" />}
            iconPosition="start"
            label={`Simulated Outbox / Emails (${emailLogs.length})`}
          />
        </Tabs>

        {tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 170 }}>Timestamp</TableCell>
                  <TableCell sx={{ width: 140 }}>Actor</TableCell>
                  <TableCell sx={{ width: 140 }}>Action</TableCell>
                  <TableCell sx={{ width: 220 }}>Transition</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5, color: '#94a3b8' }}>
                      No audit records captured yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.82rem' }}>
                        {log.actor?.username || 'SYSTEM ENGINE'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: '#eff6ff',
                            color: '#1e40af',
                            border: '1px solid #bfdbfe',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono' }}>
                        {log.previousState ? (
                          <span>
                            <strong style={{ color: '#64748b' }}>{log.previousState}</strong> ➔{' '}
                            <strong style={{ color: '#047857' }}>{log.newState}</strong>
                          </span>
                        ) : (
                          <strong style={{ color: '#1e40af' }}>{log.newState || '—'}</strong>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: '#334155' }}>
                        {log.description}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 170 }}>Sent At</TableCell>
                  <TableCell sx={{ width: 200 }}>Recipient</TableCell>
                  <TableCell sx={{ width: 250 }}>Subject</TableCell>
                  <TableCell>Message Body Preview</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emailLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 5, color: '#94a3b8' }}>
                      No outbound email logs dispatched yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  emailLogs.map((mail) => (
                    <TableRow key={mail.id} hover>
                      <TableCell sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {new Date(mail.sentAt).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.82rem' }}>
                        {mail.recipientName} ({mail.recipientEmail})
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#4f85c8', fontSize: '0.82rem' }}>
                        {mail.subject}
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontSize: '0.78rem', maxWidth: 350 }}>
                        <Typography variant="caption" noWrap sx={{ display: 'block' }}>
                          {mail.body}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Layout>
  );
}
