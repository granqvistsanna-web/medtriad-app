/**
 * Icon Primitive
 *
 * Wraps Solar Icons with standardized sizes for consistent iconography.
 * Renders Solar Icons from the Bold style by default.
 *
 * Usage:
 * ```tsx
 * import { Icon } from '@/components/primitives';
 * import { Home } from '@solar-icons/react-native/Bold';
 *
 * <Icon icon={Home} size="md" color={theme.colors.text.primary} />
 * ```
 */

import { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import { theme } from '@/constants/theme';

// Standardized icon sizes
export type IconSize = 'sm' | 'md' | 'lg';

export const ICON_SIZES: Record<IconSize, number> = {
  sm: 16, // Inline text, badges
  md: 20, // Buttons
  lg: 24, // Navigation, prominent
};

// Props for Solar Icons (they accept size, color, and standard SvgProps)
type SolarIconProps = SvgProps & {
  size?: number;
  color?: string;
  mirrored?: boolean;
  alt?: string;
};

export type IconProps = {
  /** The Solar Icon component to render */
  icon: ComponentType<SolarIconProps>;
  /** Standardized size: sm (16px), md (20px), lg (24px) */
  size?: IconSize;
  /** Icon color (defaults to theme.colors.text.primary) */
  color?: string;
  /** Mirror icon horizontally */
  mirrored?: boolean;
  /** Accessibility label */
  alt?: string;
  /** Additional style props */
  style?: SvgProps['style'];
};

/**
 * Renders a Solar Icon with standardized sizing.
 *
 * @example
 * // Basic usage
 * import { Home } from '@solar-icons/react-native/Bold';
 * <Icon icon={Home} />
 *
 * @example
 * // With size and color
 * import { Settings } from '@solar-icons/react-native/Bold';
 * <Icon icon={Settings} size="lg" color={theme.colors.brand.primary} />
 */
export function Icon({
  icon: IconComponent,
  size = 'md',
  color = theme.colors.text.primary,
  mirrored,
  alt,
  style,
}: IconProps) {
  const pixelSize = ICON_SIZES[size];

  return (
    <IconComponent
      size={pixelSize}
      color={color}
      mirrored={mirrored}
      alt={alt}
      style={style}
    />
  );
}
