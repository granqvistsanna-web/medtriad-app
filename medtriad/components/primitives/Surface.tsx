/**
 * Surface Primitive
 *
 * A themed container component using semantic color and shadow tokens.
 * Provides consistent backgrounds with optional elevation.
 *
 * Usage:
 * ```tsx
 * import { Surface } from '@/components/primitives';
 *
 * <Surface variant="card" elevation="sm">
 *   <Text>Card content</Text>
 * </Surface>
 * ```
 */

import { View, type ViewStyle, type ViewProps } from 'react-native';
import { theme } from '@/constants/theme';

// Surface variants map to theme.colors.surface
export type SurfaceVariant =
  | 'primary' // White - main background
  | 'secondary' // Light gray - secondary background
  | 'card' // White - card background
  | 'brand' // Light wine - brand background
  | 'brandSubtle'; // Ultra light wine

// Elevation levels map to theme.shadows
export type SurfaceElevation = 'none' | 'sm' | 'md' | 'lg';

export type SurfaceProps = ViewProps & {
  /** Background color variant */
  variant?: SurfaceVariant;
  /** Shadow elevation level */
  elevation?: SurfaceElevation;
  /** Additional styles */
  style?: ViewStyle;
  /** Child components */
  children?: React.ReactNode;
};

/**
 * A themed container with semantic background colors and optional shadows.
 *
 * @example
 * // Basic white surface
 * <Surface>
 *   <Text>Content</Text>
 * </Surface>
 *
 * @example
 * // Brand-colored card with shadow
 * <Surface variant="brand" elevation="md" style={{ padding: 16, borderRadius: 12 }}>
 *   <Text>Brand card</Text>
 * </Surface>
 */
export function Surface({
  variant = 'primary',
  elevation = 'none',
  style,
  children,
  ...props
}: SurfaceProps) {
  const backgroundColor = theme.colors.surface[variant];
  const shadowStyle = elevation !== 'none' ? theme.shadows[elevation] : {};

  return (
    <View
      style={[
        { backgroundColor },
        shadowStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
