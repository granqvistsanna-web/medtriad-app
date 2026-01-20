/**
 * Raw Color Tokens
 *
 * Layer 1 of the design system token architecture.
 * Contains all color values organized by hue family with numeric scale.
 *
 * Usage: Import these in theme.ts for semantic mapping.
 * Do NOT import directly in components - use theme.ts instead.
 */

export const palette = {
  // Primary brand color - wine/magenta family
  wine: {
    50: '#FCF5F8',   // Ultra light tint
    100: '#F8E8EE',  // Light tint for backgrounds
    500: '#8B2252',  // Primary brand
    600: '#6B1A3F',  // Darker for shadows/depth
    700: '#4A1230',  // Darkest for text on light bg
  },

  // Accent pink family
  pink: {
    100: '#FFE8EE',  // Light background
    200: '#FFD1DD',  // Slightly stronger
  },

  // Yellow/gold family (achievements, XP)
  yellow: {
    100: '#FFF8E1',  // Light gold background
    500: '#F5B800',  // Gold accent
    600: '#D4A000',  // Dark gold
    700: '#996600',  // Gold text
  },

  // Neutral grays
  neutral: {
    0: '#FFFFFF',    // Pure white
    50: '#F7F7F7',   // Background secondary
    200: '#E5E5E5',  // Border default
    300: '#CDCDCD',  // Border strong
    500: '#777777',  // Text secondary
    600: '#3C3C3C',  // Text primary
    700: '#AFAFAF',  // Text muted
  },

  // Success/correct answer family
  success: {
    100: '#E5F9DB',  // Light background
    500: '#58CC02',  // Main success
    600: '#46A302',  // Dark success
    700: '#3D8B00',  // Success text
    800: '#16A34A',  // Darker green for 3D depth borders
  },

  // Error/wrong answer family
  error: {
    100: '#FFE5E5',  // Light background
    500: '#FF4B4B',  // Main error
    600: '#EA2B2B',  // Dark error
    700: '#DC2626',  // Darker red for 3D depth borders
  },

  // Streak/fire badge family
  streak: {
    100: '#FFE8E8',  // Light background
    500: '#FF6B6B',  // Main streak
    600: '#E85555',  // Dark streak
    700: '#C44545',  // Streak text
  },

  // Teal family (info/category) - muted, sophisticated
  blue: {
    100: '#E8F4F3',  // Light teal background
    500: '#5BA9A2',  // Main muted teal
    600: '#4A908A',  // Dark teal (depth)
    700: '#2D5F5B',  // Teal text
  },

  // Purple/lavender family
  purple: {
    100: '#F3E5F5',  // Light background
    500: '#A855F7',  // Main purple
    600: '#9333EA',  // Dark purple
    700: '#5B21B6',  // Purple text
  },

  // Timer states (semantic but kept as palette for flexibility)
  timer: {
    normal: '#8B2252',   // Wine primary
    warning: '#FF9500',  // Orange warning
    danger: '#FF4B4B',   // Error red
  },
} as const;

// Type helper for palette access
export type PaletteColor = typeof palette;
