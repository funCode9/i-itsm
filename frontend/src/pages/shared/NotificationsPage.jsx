import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, IconButton, Button, Chip, Divider, Avatar
} from '@mui/material';
import {
  NotificationsNoneOutlined, DoneAllOutlined, CheckCircleOutlined,
  FiberManualRecord, RefreshOutlined
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { notificationApi } from '../../api';

const NOTIF_STYLES = {
  INCIDENT_CREATED: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  INCIDENT_ASSIGNED: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  STATUS_CHANGED: { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  SLA_WARNING: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  SLA_BREACH: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  INCIDENT_RESOLVED: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  FEEDBACK_REQUESTED: { color: '#4f85c8', bg: '#eff6ff', border: '#bfdbfe' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    notificationApi.getAll()
      .then((r) => setNotifications(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const markRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      loadData();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      loadData();
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Layout
      title="Notifications & Event Alerts"
      breadcrumbs={['Communication', 'In-App Alerts']}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DoneAllOutlined />}
              onClick={markAllRead}
              sx={{ borderColor: '#cbd5e1', color: '#475569' }}
            >
              Mark All Read
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshOutlined />}
            onClick={loadData}
            sx={{ borderColor: '#cbd5e1', color: '#475569' }}
          >
            Refresh
          </Button>
        </Box>
      }
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          maxWidth: 900,
          mx: 'auto',
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: '1px solid #edf0f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <NotificationsNoneOutlined sx={{ color: '#4f85c8', fontSize: 22 }} />
            <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.05rem', color: '#15243b' }}>
              In-App Dispatch Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                size="small"
                sx={{
                  bgcolor: '#fee2e2',
                  color: '#b91c1c',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  height: 20,
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
              <NotificationsNoneOutlined sx={{ fontSize: 44, mb: 1, opacity: 0.5 }} />
              <Typography variant="body2">No alerts in your notification feed.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {notifications.map((n) => {
                const style = NOTIF_STYLES[n.notificationType] || { color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' };
                return (
                  <Box
                    key={n.id}
                    sx={{
                      p: 1.8,
                      borderRadius: '8px',
                      bgcolor: n.read ? '#ffffff' : '#f8fafc',
                      border: '1px solid',
                      borderColor: n.read ? '#edf0f4' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <FiberManualRecord
                        sx={{
                          fontSize: 10,
                          color: n.read ? '#cbd5e1' : '#4f85c8',
                          mt: 0.7,
                        }}
                      />
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.3 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: n.read ? 600 : 700,
                              color: '#1e293b',
                              fontSize: '0.85rem',
                            }}
                          >
                            {n.title}
                          </Typography>
                          <Chip
                            label={n.notificationType?.replace('_', ' ')}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              bgcolor: style.bg,
                              color: style.color,
                              border: `1px solid ${style.border}`,
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', mb: 0.5 }}>
                          {n.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {new Date(n.createdAt).toLocaleString()}
                          {n.relatedIncidentNumber && ` • Ticket: ${n.relatedIncidentNumber}`}
                        </Typography>
                      </Box>
                    </Box>

                    {!n.read && (
                      <IconButton
                        size="small"
                        onClick={() => markRead(n.id)}
                        title="Mark as read"
                        sx={{ color: '#64748b', '&:hover': { color: '#059669' } }}
                      >
                        <CheckCircleOutlined fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Paper>
    </Layout>
  );
}
