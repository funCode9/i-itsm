import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Tabs, Tab } from '@mui/material';
import Layout from '../../components/Layout';
import { adminAPI } from '../../api';

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    adminAPI.getAudit().then(res => setAuditLogs(res.data)).catch(() => {});
    adminAPI.getEmailLogs().then(res => setEmailLogs(res.data)).catch(() => {});
  }, []);

  return (
    <Layout title="Audit Trail & Notification Logs">
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #e0e0e0', px: 2, pt: 1 }}>
          <Tab label={`System Audit Trail (${auditLogs.length})`} />
          <Tab label={`Simulated Outbox / Emails (${emailLogs.length})`} />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Timestamp</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actor</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Transition</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map(log => (
                    <TableRow key={log.id} hover>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell fontWeight="bold">{log.actor?.username || 'SYSTEM'}</TableCell>
                      <TableCell><Chip label={log.action} size="small" /></TableCell>
                      <TableCell>
                        {log.previousState ? `${log.previousState} ➔ ${log.newState}` : (log.newState || '—')}
                      </TableCell>
                      <TableCell>{log.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tab === 1 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'secondary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sent At</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Recipient</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Message Preview</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emailLogs.map(mail => (
                    <TableRow key={mail.id} hover>
                      <TableCell>{new Date(mail.sentAt).toLocaleString()}</TableCell>
                      <TableCell fontWeight="bold">{mail.recipientName} ({mail.recipientEmail})</TableCell>
                      <TableCell>{mail.subject}</TableCell>
                      <TableCell sx={{ maxWidth: 350 }}>
                        <Typography variant="caption" noWrap>{mail.body}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
