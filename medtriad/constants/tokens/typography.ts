/**
 * Typography Tokens
 *
 * Layer 1 of the design system token architecture.
 * Contains font families, sizes, weights, and line heights.
 *
 * Font: Figtree (Google Font)
 * - Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)
 */

// Font family names as registered with expo-font
export const fontFamily = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
} as const;

// Font sizes scale (pixel values)
export const fontSizes = {
  tiny: 11,      // Category labels
  footnote: 13,  // Small details
  caption: 15,   // Secondary info
  label: 17,     // Button labels
  body: 18,      // Body text, findings
  heading: 22,   // Section headers
  stat: 24,      // Stats values
  titleLarge: 28, // Large title
  title: 32,     // Screen titles
  display: 64,   // Hero numbers (results score)
} as const;

// Font weights as string values (React Native convention)
export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

// Line heights scale (pixel values)
export const lineHeights = {
  tiny: 14,
  footnote: 18,
  caption: 20,
  label: 22,
  body: 26,
  heading: 28,
  stat: 28,
  titleLarge: 34,
  title: 38,
  display: 64,
} as const;

// Letter spacing (pixel values)
export const letterSpacing = {
  tight: -2,     // Display
  normal: -0.5,  // Titles
  loose: 0.3,    // Footnote
  wide: 0.5,     // Tiny labels
} as const;

// Composed typography styles for convenience
export const typographyStyles = {
  display: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.display,
    letterSpacing: letterSpacing.tight,
    fontFamily: fontFamily.bold,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.title,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamily.bold,
  },
  titleLarge: {
    fontSize: fontSizes.titleLarge,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.titleLarge,
    letterSpacing: -0.3,
    fontFamily: fontFamily.semibold,
  },
  heading: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.heading,
    fontFamily: fontFamily.semibold,
  },
  body: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.body,
    fontFamily: fontFamily.medium,
  },
  label: {
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.label,
    fontFamily: fontFamily.semibold,
  },
  stat: {
    fontSize: fontSizes.stat,
    fontWeight: fontWeights.extrabold,
    lineHeight: lineHeights.stat,
    fontFamily: fontFamily.extrabold,
  },
  caption: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.caption,
    fontFamily: fontFamily.regular,
  },
  footnote: {
    fontSize: fontSizes.footnote,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.footnote,
    letterSpacing: letterSpacing.loose,
    fontFamily: fontFamily.regular,
  },
  tiny: {
    fontSize: fontSizes.tiny,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tiny,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamily.semibold,
  },
} as const;

// Type helpers
export type FontFamily = keyof typeof fontFamily;
export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type TypographyVariant = keyof typeof typographyStyles;
