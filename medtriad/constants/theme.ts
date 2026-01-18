/**
 * MedTriads Design System
 * Duolingo-inspired: Friendly, teal-centric, light mode only
 *
 * For full documentation, see DESIGN-SYSTEM.md in this folder.
 */

import { Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';

// Teal color palette
const tealPalette = {
  // Primary brand color
  primary: '#4ECDC4',
  primaryDark: '#3BA99C',
  primaryLight: '#E6FAF8',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundCard: '#FFFFFF',

  // Text hierarchy
  text: '#2D3436',
  textSecondary: '#636E72',
  textMuted: '#B2BEC3',
  textInverse: '#FFFFFF',

  // Borders
  border: '#DFE6E9',
  borderStrong: '#B2BEC3',

  // Interactive states
  pressed: '#E6FAF8',

  // Semantic
  success: '#00B894',
  successBg: '#D4F5ED',
  error: '#E17055',
  errorBg: '#FFEAEA',

  // Timer states
  timerNormal: '#4ECDC4',
  timerWarning: '#FDCB6E',
  timerDanger: '#E17055',

  // Legacy compat
  tint: '#4ECDC4',
  icon: '#636E72',
  tabIconDefault: '#B2BEC3',
  tabIconSelected: '#4ECDC4',
} as const;

export const Colors = {
  light: tealPalette,
  // Dark mode aliased to light for compatibility
  dark: tealPalette,
} as const;

// Typography scale
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

  // Large title (MedTriads on home)
  titleLarge: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 34,
    letterSpacing: -0.3,
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

  // Stats values
  stat: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 24,
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

  // Tiny labels (category)
  tiny: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.5,
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

// Shadows - light theme only
const lightShadows = {
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
};

export const Shadows = {
  light: lightShadows,
  dark: lightShadows, // Alias for compatibility
} as const;

// Border radius scale
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

// Mascot sizes
export const MascotSizes = {
  sm: 56,
  md: 80,
  lg: 112,
  xl: 160,
} as const;

// Animation durations
export const Durations = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,      // Score count-ups, tier celebrations
  stagger: 50,
  staggerMedium: 80, // Celebratory reveals
} as const;

// Spring presets for react-native-reanimated
export const Easings = {
  // Standard press/release — snappy, controlled
  press: { damping: 15, stiffness: 400 },

  // Bouncy reveals — playful overshoot
  bouncy: { damping: 10, stiffness: 300 },

  // Gentle settles — slow, weighty landing
  gentle: { damping: 20, stiffness: 150 },

  // Pop effects — fast initial, slow settle
  pop: { damping: 8, stiffness: 400 },

  // Timing easings (for opacity, color)
  easeOut: Easing.out(Easing.cubic),
  easeInOut: Easing.inOut(Easing.cubic),
  easeOutBack: Easing.bezier(0.34, 1.56, 0.64, 1),
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
