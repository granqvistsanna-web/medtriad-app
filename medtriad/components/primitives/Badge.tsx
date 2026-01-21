/**
 * Badge Primitive
 *
 * Status indicator with Duolingo-style 3D depth.
 * Used for streaks, XP, achievements, and status indicators.
 *
 * Usage:
 * ```tsx
 * import { Badge } from '@/components/primitives';
 * import { Fire } from '@solar-icons/react-native/Bold';
 *
 * <Badge label="5 Day Streak" icon={Fire} variant="streak" />
 * <Badge label="100 XP" variant="gold" />
 * <Badge label="Mastered" variant="success" />
 * ```
 */

import { View, StyleSheet, type ViewStyle } from 'react-native';
import { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import { theme } from '@/constants/theme';
import { Text } from './Text';
import { Icon, type IconSize } from './Icon';

// Badge variants for different contexts
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'gold' | 'streak';

// Solar Icon component type
type SolarIconProps = SvgProps & {
  size?: number;
  color?: string;
  mirrored?: boolean;
  alt?: string;
};

export type BadgeProps = {
  /** Badge label text */
  label: string;
  /** Optional Solar Icon component */
  icon?: ComponentType<SolarIconProps>;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: 'sm' | 'md';
  /** Additional styles */
  style?: ViewStyle;
};

// Variant color configurations using semantic tokens
const VARIANTS: Record<BadgeVariant, {
  backgroundColor: string;
  borderColor: string;
  borderBottomColor: string;
  textColor: string;
  iconColor: string;
}> = {
  default: {
    backgroundColor: theme.colors.surface.secondary,
    borderColor: theme.colors.border.default,
    borderBottomColor: theme.colors.border.strong,
    textColor: theme.colors.text.primary,
    iconColor: theme.colors.text.secondary,
  },
  success: {
    backgroundColor: theme.colors.success.light,
    borderColor: theme.colors.success.main,
    borderBottomColor: theme.colors.success.dark,
    textColor: theme.colors.success.text,
    iconColor: theme.colors.success.main,
  },
  warning: {
    backgroundColor: theme.colors.warning.light,
    borderColor: theme.colors.warning.main,
    borderBottomColor: theme.colors.warning.dark,
    textColor: theme.colors.text.primary,
    iconColor: theme.colors.warning.main,
  },
  danger: {
    backgroundColor: theme.colors.danger.light,
    borderColor: theme.colors.danger.main,
    borderBottomColor: theme.colors.danger.dark,
    textColor: theme.colors.text.primary,
    iconColor: theme.colors.danger.main,
  },
  brand: {
    backgroundColor: theme.colors.surface.brand,
    borderColor: theme.colors.brand.primary,
    borderBottomColor: theme.colors.brand.primaryDark,
    textColor: theme.colors.text.brand,
    iconColor: theme.colors.brand.primary,
  },
  // Gold variant for achievements/stars - soft teal style
  gold: {
    backgroundColor: theme.colors.gold.lighter,
    borderColor: theme.colors.gold.main,
    borderBottomColor: theme.colors.gold.dark,
    textColor: theme.colors.gold.text,
    iconColor: theme.colors.gold.main,
  },
  // Streak variant for fire/streak badges - soft pink style
  streak: {
    backgroundColor: theme.colors.streak.lighter,
    borderColor: theme.colors.streak.main,
    borderBottomColor: theme.colors.streak.dark,
    textColor: theme.colors.streak.text,
    iconColor: theme.colors.streak.main,
  },
};

// Size configurations
const SIZES: Record<'sm' | 'md', {
  height: number;
  paddingHorizontal: number;
  gap: number;
  iconSize: IconSize;
}> = {
  sm: { height: 28, paddingHorizontal: 10, gap: 4, iconSize: 'sm' },
  md: { height: 36, paddingHorizontal: 12, gap: 6, iconSize: 'sm' },
};

/**
 * Renders a badge with Duolingo-style 3D depth.
 *
 * @example
 * // Streak badge with icon
 * import { Fire } from '@solar-icons/react-native/Bold';
 * <Badge label="5 Day Streak" icon={Fire} variant="streak" />
 *
 * @example
 * // Gold achievement badge
 * import { Star } from '@solar-icons/react-native/Bold';
 * <Badge label="100 XP" icon={Star} variant="gold" />
 *
 * @example
 * // Success badge without icon
 * <Badge label="Mastered" variant="success" />
 */
export function Badge({
  label,
  icon,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  const colors = VARIANTS[variant];
  const sizeStyle = SIZES[size];

  return (
    <View
      style={[
        styles.badge,
        {
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderBottomColor: colors.borderBottomColor,
        },
        style,
      ]}
    >
      {icon && (
        <Icon
          icon={icon}
          size={sizeStyle.iconSize}
          color={colors.iconColor}
        />
      )}
      <Text
        variant="footnote"
        color={colors.textColor}
        weight="semibold"
        style={icon ? { marginLeft: sizeStyle.gap } : undefined}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.sm, // 8px rounded corners
    borderWidth: 2,
    borderBottomWidth: 4, // 3D depth effect
  },
});
