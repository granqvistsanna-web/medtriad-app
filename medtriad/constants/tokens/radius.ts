/**
 * Border Radius Tokens
 *
 * Layer 1 of the design system token architecture.
 * Soft, friendly corners (8-12px range) per design context.
 */

export const radius = {
  sm: 8,      // Small elements, badges
  md: 12,     // Medium elements, buttons
  lg: 16,     // Cards, containers
  xl: 24,     // Large containers
  xxl: 32,    // Extra large
  full: 9999, // Pill/circle
} as const;

// Type helper
export type RadiusKey = keyof typeof radius;
