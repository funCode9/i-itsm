import React from 'react';
import { Box } from '@mui/material';

/**
 * AppLogo - Displays the 3-gear I-ITSM brand mark in a clean monotonic single color.
 *
 * @param {number|string} size - Pixel dimension for width/height (default 32)
 * @param {'blue'|'white'} variant - Monotonic color variant ('blue' for light backgrounds, 'white' for dark)
 * @param {object} sx - Additional MUI sx styling overrides
 */
export default function AppLogo({ size = 32, variant = 'blue', sx = {}, ...props }) {
  const src = variant === 'white' ? '/logo-white.png' : '/logo-blue.png';

  return (
    <Box
      component="img"
      src={src}
      alt="I-ITSM Logo"
      sx={{
        width: size,
        height: 'auto',
        maxHeight: size,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: variant === 'blue' 
          ? 'drop-shadow(0 1px 2px rgba(37,99,235,0.2))' 
          : 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
        ...sx,
      }}
      {...props}
    />
  );
}
