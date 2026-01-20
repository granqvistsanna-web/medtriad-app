/**
 * Spacing Tokens
 *
 * Layer 1 of the design system token architecture.
 * Contains spacing scale based on 8px grid with smaller increments.
 */

export const spacing = {
  xs: 4,    // Tight inline spacing
  sm: 8,    // Default small gap
  md: 12,   // Medium gap
  base: 16, // Base unit (standard padding)
  lg: 24,   // Large sections
  xl: 32,   // Extra large
  xxl: 48,  // Page-level spacing
  xxxl: 64, // Hero sections
} as const;

// Type helper
export type SpacingKey = keyof typeof spacing;
