import React from 'react';
import { Chip, Box } from '@mui/material';

const STATUS_CONFIG = {
  NEW: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'New' },
  CLASSIFIED: { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe', label: 'Classified' },
  ASSIGNED: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', label: 'Assigned' },
  ACKNOWLEDGED: { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc', label: 'Acknowledged' },
  IN_PROGRESS: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'In Progress' },
  RESOLVED: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', label: 'Resolved' },
  VERIFIED: { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4', label: 'Verified' },
  CLOSED: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: 'Closed' },
};

const PRIORITY_CONFIG = {
  P1_CRITICAL: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', bar: '#e53e3e', label: 'P1 Critical' },
  P2_HIGH: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', bar: '#ed8936', label: 'P2 High' },
  P3_MEDIUM: { bg: '#fefce8', color: '#a16207', border: '#fef08a', bar: '#d69e2e', label: 'P3 Medium' },
  P4_LOW: { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd', bar: '#3b82f6', label: 'P4 Low' },
};

export function StatusChip({ status, size = 'small' }) {
  const conf = STATUS_CONFIG[status] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: status };
  return (
    <Chip
      label={conf.label}
      size={size}
      sx={{
        bgcolor: conf.bg,
        color: conf.color,
        border: `1px solid ${conf.border}`,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.72rem' : '0.82rem',
        height: size === 'small' ? 22 : 26,
        borderRadius: '6px',
        letterSpacing: '0.01em',
      }}
    />
  );
}

export function PriorityChip({ priority, size = 'small', showBar = false }) {
  const conf = PRIORITY_CONFIG[priority] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', bar: '#94a3b8', label: priority };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Chip
        label={conf.label}
        size={size}
        sx={{
          bgcolor: conf.bg,
          color: conf.color,
          border: `1px solid ${conf.border}`,
          fontWeight: 600,
          fontSize: size === 'small' ? '0.72rem' : '0.82rem',
          height: size === 'small' ? 22 : 26,
          borderRadius: '6px',
          ...(showBar && {
            borderLeft: `3px solid ${conf.bar}`,
          }),
        }}
      />
    </Box>
  );
}

export function PriorityBar({ priority }) {
  const conf = PRIORITY_CONFIG[priority] || { bar: '#94a3b8' };
  return (
    <Box
      sx={{
        width: 4,
        alignSelf: 'stretch',
        bgcolor: conf.bar,
        borderRadius: '2px 0 0 2px',
        mr: 1.5,
      }}
    />
  );
}
