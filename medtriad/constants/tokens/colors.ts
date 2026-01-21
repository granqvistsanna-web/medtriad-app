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

  // Teal XP badge family (achievements, XP)
  yellow: {
    50: '#EAFBFA',   // Ultra light mint for badge background
    100: '#CDF0F0',  // Light teal background
    500: '#2E7D7A',  // Teal main (darker for border/icon)
    600: '#256663',  // Teal dark
    700: '#2E7D7A',  // Teal text
  },

  // Neutral grays
  neutral: {
    0: '#FFFFFF',    // Pure white
    50: '#F7F7F7',   // Background secondary
    200: '#E5E5E5',  // Border default
    300: '#CDCDCD',  // Border strong
    400: '#A8A8A8',  // Border strongest (3D depth on elevated cards)
    500: '#777777',  // Text secondary
    600: '#3C3C3C',  // Text primary
    700: '#AFAFAF',  // Text muted
  },

  // Success/correct answer family - muted sage green
  success: {
    100: '#E8F3EC',  // Soft sage light background
    500: '#4D9168',  // Muted sage main
    600: '#3E7854',  // Dark sage
    700: '#356A49',  // Sage text
    800: '#2D5A3E',  // Darker sage for 3D depth borders
  },

  // Error/wrong answer family - muted dusty coral
  error: {
    100: '#F9EBEB',  // Soft dusty rose light background
    500: '#C25B5B',  // Muted dusty coral main
    600: '#A84D4D',  // Dark coral
    700: '#944343',  // Darker coral for 3D depth borders
  },

  // Streak/fire badge family - soft pink with plum accent
  streak: {
    50: '#FAE3F0',   // Ultra light pink for badge background
    100: '#FCCAE6',  // Light pink background
    500: '#8B3A62',  // Plum/wine main (darker for border/icon)
    600: '#6B2D4C',  // Plum dark
    700: '#8B3A62',  // Plum text
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
    danger: '#C25B5B',   // Muted dusty coral (matches error)
  },
} as const;

// Type helper for palette access
export type PaletteColor = typeof palette;
