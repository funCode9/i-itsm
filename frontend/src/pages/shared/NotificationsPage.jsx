import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, List, ListItem, ListItemText,
  ListItemIcon, IconButton, Box, Button, Chip, Divider
} from '@mui/material';
import {
  Notifications as NotifIcon, CheckCircle, Circle, MarkEmailRead
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { notificationAPI } from '../../api';

const TYPE_COLORS = {
  INCIDENT_CREATED: 'info', INCIDENT_ASSIGNED: 'primary',
  STATUS_CHANGED: 'secondary', SLA_WARNING: 'warning',
  SLA_BREACH: 'error', INCIDENT_RESOLVED: 'success',
  FEEDBACK_REQUESTED: 'info', INCIDENT_CLOSED: 'default',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  const load = () =>
    notificationAPI.getAll().then(r => setNotifications(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    load();
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    load();
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <Layout title="Notifications">
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotifIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Notifications</Typography>
              {unread > 0 && <Chip label={`${unread} unread`} color="error" size="small" />}
            </Box>
            {unread > 0 && (
              <Button size="small" startIcon={<MarkEmailRead />} onClick={markAllRead}>
                Mark All Read
              </Button>
            )}
          </Box>

          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotifIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography color="text.secondary">No notifications yet.</Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((n, i) => (
                <React.Fragment key={n.id}>
                  {i > 0 && <Divider />}
                  <ListItem
                    sx={{ bgcolor: n.read ? 'transparent' : 'primary.50', borderRadius: 1 }}
                    secondaryAction={
                      !n.read && (
                        <IconButton size="small" onClick={() => markRead(n.id)} title="Mark as read">
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      )
                    }>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {n.read
                        ? <Circle sx={{ fontSize: 10, color: 'text.disabled' }} />
                        : <Circle sx={{ fontSize: 10, color: 'primary.main' }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" fontWeight={n.read ? 'normal' : 'bold'}>
                            {n.title}
                          </Typography>
                          <Chip label={n.notificationType?.replace('_', ' ')}
                            color={TYPE_COLORS[n.notificationType] || 'default'}
                            size="small" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                          <Typography variant="caption" color="text.disabled">
                            {new Date(n.createdAt).toLocaleString()}
                            {n.relatedIncidentNumber && ` • ${n.relatedIncidentNumber}`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
