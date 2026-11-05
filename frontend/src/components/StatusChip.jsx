import React from 'react';
import { Chip } from '@mui/material';

const STATUS_COLORS = {
  NEW: 'default', CLASSIFIED: 'info', ASSIGNED: 'primary',
  ACKNOWLEDGED: 'secondary', IN_PROGRESS: 'warning',
  RESOLVED: 'success', VERIFIED: 'success', CLOSED: 'default',
};

const PRIORITY_COLORS = {
  P1_CRITICAL: 'error', P2_HIGH: 'warning',
  P3_MEDIUM: 'info', P4_LOW: 'default',
};

const PRIORITY_LABELS = {
  P1_CRITICAL: 'P1 Critical', P2_HIGH: 'P2 High',
  P3_MEDIUM: 'P3 Medium', P4_LOW: 'P4 Low',
};

export function StatusChip({ status }) {
  return (
    <Chip label={status?.replace('_', ' ')}
      color={STATUS_COLORS[status] || 'default'}
      size="small" />
  );
}

export function PriorityChip({ priority }) {
  return (
    <Chip label={PRIORITY_LABELS[priority] || priority}
      color={PRIORITY_COLORS[priority] || 'default'}
      size="small" />
  );
}
