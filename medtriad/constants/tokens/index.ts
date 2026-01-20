/**
 * Design System Tokens - Barrel Export
 *
 * Layer 1 of the design system.
 * Re-exports all raw tokens for consumption by theme.ts and advanced use cases.
 */

// Colors
export { palette } from './colors';
export type { PaletteColor } from './colors';

// Typography
export {
  fontFamily,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  typographyStyles,
} from './typography';
export type {
  FontFamily,
  FontSize,
  FontWeight,
  TypographyVariant,
} from './typography';

// Spacing
export { spacing } from './spacing';
export type { SpacingKey } from './spacing';

// Radius
export { radius } from './radius';
export type { RadiusKey } from './radius';

// Shadows
export { shadows } from './shadows';
export type { ShadowKey, ShadowStyle } from './shadows';

// Motion
export { durations, springs, easings } from './motion';
export type { DurationKey, SpringKey, SpringConfig } from './motion';
