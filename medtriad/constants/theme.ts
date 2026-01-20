/**
 * MedTriads Design System - Semantic Theme
 *
 * Layer 2 of the design system token architecture.
 * Maps raw tokens to semantic meanings for component consumption.
 *
 * Light mode only - Duolingo-inspired, friendly, premium.
 */

import { Platform } from 'react-native';

// Import raw tokens
import { palette } from './tokens/colors';
import {
  fontFamily,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  typographyStyles,
} from './tokens/typography';
import { spacing } from './tokens/spacing';
import { radius } from './tokens/radius';
import { shadows } from './tokens/shadows';
import { durations, springs, easings } from './tokens/motion';

// =============================================================================
// SEMANTIC THEME (Layer 2)
// =============================================================================

export const theme = {
  colors: {
    // Surface colors - backgrounds and containers
    surface: {
      primary: palette.neutral[0],       // White - main background
      secondary: palette.neutral[50],    // Light gray - secondary background
      card: palette.neutral[0],          // White - card background
      brand: palette.wine[100],          // Light wine - brand background
      brandSubtle: palette.wine[50],     // Ultra light wine
      pressed: palette.wine[100],        // Pressed state background
    },

    // Text colors - hierarchy
    text: {
      primary: palette.neutral[600],     // Dark gray - main text
      secondary: palette.neutral[500],   // Medium gray - secondary text
      muted: palette.neutral[700],       // Light gray - muted text
      inverse: palette.neutral[0],       // White - text on dark bg
      brand: palette.wine[700],          // Dark wine - brand accent text
    },

    // Brand colors - primary identity
    brand: {
      primary: palette.wine[500],        // Wine - main brand
      primaryDark: palette.wine[600],    // Dark wine - depth/shadow
      primaryDarker: palette.wine[700],  // Darkest wine - strong accent
      accent: palette.pink[100],         // Light pink - accent
      accentStrong: palette.pink[200],   // Stronger pink
    },

    // Success/correct state
    success: {
      main: palette.success[500],        // Green
      dark: palette.success[600],        // Dark green
      darker: palette.success[800],      // Darker green for 3D depth borders
      light: palette.success[100],       // Light green bg
      text: palette.success[700],        // Green text
    },

    // Warning state
    warning: {
      main: palette.yellow[500],         // Gold/yellow
      dark: palette.yellow[600],         // Dark gold
      light: palette.yellow[100],        // Light yellow bg
      text: palette.yellow[700],         // Yellow text
    },

    // Danger/error state
    danger: {
      main: palette.error[500],          // Red
      dark: palette.error[600],          // Dark red
      darker: palette.error[700],        // Darker red for 3D depth borders
      light: palette.error[100],         // Light red bg
    },

    // Border colors
    border: {
      default: palette.neutral[200],     // Light border
      strong: palette.neutral[300],      // Strong border (3D depth)
    },

    // Achievement/gold colors
    gold: {
      main: palette.yellow[500],
      dark: palette.yellow[600],
      light: palette.yellow[100],
      text: palette.yellow[700],
    },

    // Streak/fire colors
    streak: {
      main: palette.streak[500],
      dark: palette.streak[600],
      light: palette.streak[100],
      text: palette.streak[700],
    },

    // Blue/info colors
    blue: {
      main: palette.blue[500],
      dark: palette.blue[600],
      light: palette.blue[100],
      text: palette.blue[700],
    },

    // Purple colors
    purple: {
      main: palette.purple[500],
      dark: palette.purple[600],
      light: palette.purple[100],
      text: palette.purple[700],
    },

    // Timer state colors
    timer: {
      normal: palette.timer.normal,
      warning: palette.timer.warning,
      danger: palette.timer.danger,
    },

    // Icon colors
    icon: {
      default: palette.neutral[500],
      muted: palette.neutral[700],
      brand: palette.wine[500],
      selected: palette.wine[500],
    },
  },

  // Typography - semantic text styles
  typography: typographyStyles,

  // Font family
  fontFamily,

  // Spacing scale
  spacing,

  // Border radius scale
  radius,

  // Shadow definitions
  shadows,

  // Motion/animation
  motion: {
    durations,
    springs,
    easings,
  },
} as const;

// =============================================================================
// BACKWARD-COMPATIBLE EXPORTS (Layer 1.5)
// These map new token structure to old export names for gradual migration
// =============================================================================

// Legacy winePalette-style Colors export
const legacyColors = {
  // Primary brand
  primary: palette.wine[500],
  primaryDark: palette.wine[600],
  primaryDarker: palette.wine[700],
  primaryLight: palette.wine[100],
  primaryUltraLight: palette.wine[50],

  // Backgrounds
  background: palette.neutral[0],
  backgroundSecondary: palette.neutral[50],
  backgroundCard: palette.neutral[0],

  // Text hierarchy
  text: palette.neutral[600],
  textSecondary: palette.neutral[500],
  textMuted: palette.neutral[700],
  textInverse: palette.neutral[0],

  // Borders
  border: palette.neutral[200],
  borderStrong: palette.neutral[300],

  // Interactive states
  pressed: palette.wine[100],

  // Semantic colors
  success: palette.success[500],
  successDark: palette.success[600],
  successBg: palette.success[100],
  successText: palette.success[700],
  error: palette.error[500],
  errorDark: palette.error[600],
  errorBg: palette.error[100],

  // Gold
  gold: palette.yellow[500],
  goldDark: palette.yellow[600],
  goldLight: palette.yellow[100],
  goldText: palette.yellow[700],

  // Streak
  streak: palette.streak[500],
  streakDark: palette.streak[600],
  streakLight: palette.streak[100],
  streakText: palette.streak[700],

  // Purple
  purple: palette.purple[500],
  purpleDark: palette.purple[600],
  purpleText: palette.purple[700],

  // Blue
  blue: palette.blue[500],
  blueDark: palette.blue[600],
  blueText: palette.blue[700],

  // Timer
  timerNormal: palette.timer.normal,
  timerWarning: palette.timer.warning,
  timerDanger: palette.timer.danger,

  // Legacy compat
  tint: palette.wine[500],
  icon: palette.neutral[500],
  tabIconDefault: palette.neutral[700],
  tabIconSelected: palette.wine[500],
} as const;

export const Colors = {
  light: legacyColors,
  dark: legacyColors, // Aliased for compatibility
} as const;

// Legacy Typography export (without fontFamily)
export const Typography = {
  display: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.display,
    letterSpacing: letterSpacing.tight,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.title,
    letterSpacing: letterSpacing.normal,
  },
  titleLarge: {
    fontSize: fontSizes.titleLarge,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.titleLarge,
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.heading,
  },
  body: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.body,
  },
  label: {
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.label,
  },
  stat: {
    fontSize: fontSizes.stat,
    fontWeight: fontWeights.extrabold,
    lineHeight: lineHeights.stat,
  },
  caption: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.caption,
  },
  footnote: {
    fontSize: fontSizes.footnote,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.footnote,
    letterSpacing: letterSpacing.loose,
  },
  tiny: {
    fontSize: fontSizes.tiny,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tiny,
    letterSpacing: letterSpacing.wide,
  },
} as const;

// Legacy Spacing export
export const Spacing = spacing;

// Legacy Shadows export
export const Shadows = {
  light: shadows,
  dark: shadows, // Aliased for compatibility
} as const;

// Legacy Radius export
export const Radius = radius;

// Legacy Durations export
export const Durations = durations;

// Legacy Easings export (combined springs + timing easings)
export const Easings = {
  ...springs,
  ...easings,
} as const;

// =============================================================================
// COMPONENT-LEVEL STYLES (Compound tokens)
// =============================================================================

// Card styling - Duolingo-style with hard border-bottom
export const CardStyle = {
  backgroundColor: theme.colors.surface.card,
  borderWidth: 2,
  borderColor: theme.colors.border.default,
  borderBottomWidth: 4,
  borderBottomColor: theme.colors.border.strong,
  borderRadius: theme.radius.lg,
  ...theme.shadows.sm,
} as const;

// Frame card styling - colored border with 3D depth
export const FrameCardStyle = {
  borderRadius: theme.radius.lg,
  borderWidth: 2,
  borderBottomWidth: 4,
} as const;

// Badge styling - pill with 3D border-bottom
export const BadgeStyle = {
  borderRadius: theme.radius.md,
  borderWidth: 2,
  borderBottomWidth: 3,
} as const;

export const FrameCardInnerStyle = {
  backgroundColor: theme.colors.surface.card,
  borderRadius: theme.radius.md,
} as const;

// Mascot sizes
export const MascotSizes = {
  sm: 56,
  md: 80,
  lg: 112,
  xl: 160,
} as const;

// Font families (platform-specific fallbacks for system fonts)
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

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeTypography = typeof theme.typography;
