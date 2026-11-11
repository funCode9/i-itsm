import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = '#4f85c8',
  bgColor = '#eff6ff',
  badge,
  onClick,
}) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.2,
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              borderColor: '#cbd5e1',
            }
          : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.2 }}>
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontSize: '0.78rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </Typography>
        {icon && (
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              bgcolor: bgColor,
              color: color,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            color: '#15243b',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {value ?? '—'}
        </Typography>
        {badge && (
          <Box sx={{ ml: 'auto' }}>
            {badge}
          </Box>
        )}
      </Box>

      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            color: '#94a3b8',
            fontSize: '0.72rem',
            mt: 0.8,
            display: 'block',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}
