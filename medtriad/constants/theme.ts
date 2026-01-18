/**
 * MedTriads Design System
 * Refined Swiss Medical: Clinical precision meets editorial elegance
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Backgrounds - warm whites, not sterile
    background: '#FAFAFA',
    backgroundSecondary: '#F0F0F0',
    backgroundCard: '#FFFFFF',

    // Text hierarchy - true black for impact
    text: '#000000',
    textSecondary: '#525252',
    textMuted: '#A3A3A3',
    textInverse: '#FFFFFF',

    // Borders - subtle definition
    border: '#E5E5E5',
    borderStrong: '#D4D4D4',

    // Interactive states
    pressed: '#F5F5F5',

    // Semantic - the only colors (muted for elegance)
    success: '#16A34A',
    successBg: '#DCFCE7',
    error: '#DC2626',
    errorBg: '#FEE2E2',

    // Timer states
    timerNormal: '#171717',
    timerWarning: '#CA8A04',
    timerDanger: '#DC2626',

    // Legacy compat
    tint: '#000000',
    icon: '#737373',
    tabIconDefault: '#A3A3A3',
    tabIconSelected: '#000000',
  },
  dark: {
    // Backgrounds - deep, not muddy
    background: '#0A0A0A',
    backgroundSecondary: '#171717',
    backgroundCard: '#1C1C1C',

    // Text hierarchy
    text: '#FFFFFF',
    textSecondary: '#A3A3A3',
    textMuted: '#525252',
    textInverse: '#000000',

    // Borders
    border: '#262626',
    borderStrong: '#404040',

    // Interactive
    pressed: '#262626',

    // Semantic
    success: '#22C55E',
    successBg: '#14532D',
    error: '#EF4444',
    errorBg: '#7F1D1D',

    // Timer
    timerNormal: '#FFFFFF',
    timerWarning: '#FACC15',
    timerDanger: '#F87171',

    // Legacy
    tint: '#FFFFFF',
    icon: '#737373',
    tabIconDefault: '#525252',
    tabIconSelected: '#FFFFFF',
  },
} as const;

// Typography scale - dramatic hierarchy
export const Typography = {
  // Hero numbers (results score)
  display: {
    fontSize: 64,
    fontWeight: '700' as const,
    lineHeight: 64,
    letterSpacing: -2,
  },

  // Screen titles
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
    letterSpacing: -0.5,
  },

  // Section headers
  heading: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },

  // Findings, card titles
  body: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 26,
  },

  // Button labels
  label: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },

  // Secondary info
  caption: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  // Small details
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
} as const;

// Spacing scale (8px base)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Shadows - real depth
export const Shadows = {
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 8,
    },
  },
} as const;

// Border radius scale
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Font families
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    rounded: 'System',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', system-ui, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
