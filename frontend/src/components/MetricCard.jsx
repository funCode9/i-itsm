import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { ArrowUpward, ArrowDownward, Remove } from '@mui/icons-material';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = '#4f85c8',
  bgColor = '#eff6ff',
  badge,
  trend, // { text: '+12%', label: 'vs last week', isFavorable: true, neutral: false }
  onClick,
}) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.2,
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              borderColor: 'text.secondary',
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
            color: 'text.primary',
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

      {/* Trend indicator & Subtitle */}
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.8 }}>
        {trend && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.3,
              px: 0.8,
              py: 0.2,
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              bgcolor: trend.neutral
                ? '#f1f5f9'
                : trend.isFavorable
                ? '#ecfdf5'
                : '#fef2f2',
              color: trend.neutral
                ? '#64748b'
                : trend.isFavorable
                ? '#059669'
                : '#dc2626',
            }}
          >
            {trend.neutral ? (
              <Remove sx={{ fontSize: 11 }} />
            ) : trend.direction === 'down' ? (
              <ArrowDownward sx={{ fontSize: 11 }} />
            ) : (
              <ArrowUpward sx={{ fontSize: 11 }} />
            )}
            <span>{trend.text}</span>
          </Box>
        )}

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: '#94a3b8',
              fontSize: '0.72rem',
              lineHeight: 1.2,
            }}
          >
            {trend?.label ? trend.label : subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
