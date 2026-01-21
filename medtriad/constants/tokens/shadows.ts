/**
 * Shadow Tokens
 *
 * Layer 1 of the design system token architecture.
 * Platform-aware shadow definitions:
 * - Web: uses boxShadow (CSS)
 * - iOS: uses shadow* props
 * - Android: uses elevation
 */

import { Platform } from 'react-native';

// Define shadow values
const shadowValues = {
  sm: {
    native: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    web: {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06)',
    },
  },
  md: {
    native: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    web: {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    },
  },
  lg: {
    native: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
    web: {
      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
    },
  },
} as const;

// Export platform-specific shadows
export const shadows = Platform.select({
  web: {
    sm: shadowValues.sm.web,
    md: shadowValues.md.web,
    lg: shadowValues.lg.web,
  },
  default: {
    sm: shadowValues.sm.native,
    md: shadowValues.md.native,
    lg: shadowValues.lg.native,
  },
}) as {
  sm: Record<string, unknown>;
  md: Record<string, unknown>;
  lg: Record<string, unknown>;
};

// Type helper
export type ShadowKey = keyof typeof shadowValues;
export type ShadowStyle = typeof shadowValues.sm.native | typeof shadowValues.sm.web;
