/**
 * Text Primitive
 *
 * Typography primitive using Figtree font and semantic tokens.
 * All text in the app should use this component for consistency.
 *
 * Usage:
 * ```tsx
 * import { Text } from '@/components/primitives';
 *
 * <Text variant="title" color="primary">Screen Title</Text>
 * <Text variant="body">Body text content</Text>
 * <Text variant="caption" color="secondary">Secondary info</Text>
 * ```
 */

import { Text as RNText, type TextStyle, type TextProps as RNTextProps } from 'react-native';
import { theme } from '@/constants/theme';
import { fontFamily } from '@/constants/tokens/typography';

// Text variants map to theme.typography
export type TextVariant =
  | 'display'    // 64px - Hero numbers (results score)
  | 'title'      // 32px - Screen titles
  | 'titleLarge' // 28px - Large title (MedTriads on home)
  | 'heading'    // 22px - Section headers
  | 'body'       // 18px - Body text, card titles
  | 'label'      // 17px - Button labels
  | 'stat'       // 24px - Stats values, extra bold
  | 'caption'    // 15px - Secondary info
  | 'footnote'   // 13px - Small details
  | 'tiny';      // 11px - Category labels

// Color can be a semantic key or a raw color string
export type TextColor = keyof typeof theme.colors.text;

// Weight options
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export type TextProps = RNTextProps & {
  /** Typography variant */
  variant?: TextVariant;
  /** Text color - semantic key or raw color string */
  color?: TextColor | string;
  /** Font weight override */
  weight?: TextWeight;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Child content */
  children: React.ReactNode;
};

// Map weight names to font family names
const WEIGHT_TO_FONT: Record<TextWeight, string> = {
  regular: fontFamily.regular,
  medium: fontFamily.medium,
  semibold: fontFamily.semibold,
  bold: fontFamily.bold,
  extrabold: fontFamily.extrabold,
};

// Default weights for each variant
const VARIANT_DEFAULT_WEIGHT: Record<TextVariant, TextWeight> = {
  display: 'bold',
  title: 'bold',
  titleLarge: 'semibold',
  heading: 'semibold',
  body: 'medium',
  label: 'semibold',
  stat: 'extrabold',
  caption: 'regular',
  footnote: 'regular',
  tiny: 'semibold',
};

/**
 * Renders text with Figtree font and typography tokens.
 *
 * @example
 * // Basic usage
 * <Text>Default body text</Text>
 *
 * @example
 * // With variant and color
 * <Text variant="title" color="brand">Screen Title</Text>
 *
 * @example
 * // With weight override
 * <Text variant="body" weight="bold">Bold body text</Text>
 *
 * @example
 * // With raw color
 * <Text color="#FF0000">Red text</Text>
 */
export function Text({
  variant = 'body',
  color = 'primary',
  weight,
  align,
  style,
  children,
  ...props
}: TextProps) {
  // Get typography values from theme
  const typography = theme.typography[variant];

  // Determine font family based on weight (explicit weight overrides variant default)
  const effectiveWeight = weight ?? VARIANT_DEFAULT_WEIGHT[variant];
  const fontFamilyName = WEIGHT_TO_FONT[effectiveWeight];

  // Resolve color - support both semantic keys and raw colors
  const textColor = color in theme.colors.text
    ? theme.colors.text[color as TextColor]
    : color;

  return (
    <RNText
      style={[
        {
          fontFamily: fontFamilyName,
          fontSize: typography.fontSize,
          lineHeight: typography.lineHeight,
          letterSpacing: (typography as { letterSpacing?: number }).letterSpacing ?? 0,
          color: textColor,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
