/**
 * Card Primitive
 *
 * Container component with Duolingo-style 3D depth and press animation.
 * Used for content containers, interactive cards, and list items.
 *
 * Usage:
 * ```tsx
 * import { Card } from '@/components/primitives';
 *
 * <Card>Static content</Card>
 * <Card onPress={() => {}}>Tappable card</Card>
 * <Card variant="elevated">Shadow-only card</Card>
 * ```
 */

import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';

// Card variants
export type CardVariant = 'default' | 'elevated' | 'outlined';

export type CardProps = {
  /** Card content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: CardVariant;
  /** Press handler - makes card interactive with animation */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional styles */
  style?: ViewStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Renders a card with optional Duolingo-style 3D press animation.
 *
 * @example
 * // Default card with 3D depth
 * <Card>
 *   <Text variant="heading">Card Title</Text>
 *   <Text>Card content here</Text>
 * </Card>
 *
 * @example
 * // Interactive card with press animation
 * <Card onPress={() => navigate('detail')}>
 *   <Text>Tap me!</Text>
 * </Card>
 *
 * @example
 * // Elevated card (shadow only, no borders)
 * <Card variant="elevated">
 *   <Text>Floating card</Text>
 * </Card>
 *
 * @example
 * // Outlined card (borders only)
 * <Card variant="outlined">
 *   <Text>Bordered card</Text>
 * </Card>
 */
export function Card({
  children,
  variant = 'default',
  onPress,
  disabled = false,
  style,
}: CardProps) {
  const scale = useSharedValue(1);
  const borderBottom = useSharedValue(4);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.98, theme.motion.springs.press);
      borderBottom.value = withSpring(2, theme.motion.springs.press);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, theme.motion.springs.press);
    borderBottom.value = withSpring(4, theme.motion.springs.press);
  };

  const isInteractive = !!onPress;

  // Get variant-specific styles
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        // Shadow only - no borders
        return {
          backgroundColor: theme.colors.surface.card,
          borderWidth: 0,
          borderBottomWidth: 0,
          ...theme.shadows.md,
        };
      case 'outlined':
        // Borders + 3D depth, no shadow
        return {
          backgroundColor: theme.colors.surface.card,
          borderWidth: 2,
          borderColor: theme.colors.border.default,
          borderBottomWidth: 4,
          borderBottomColor: theme.colors.border.strong,
        };
      default:
        // Duolingo style: borders + 3D depth + subtle shadow
        return {
          backgroundColor: theme.colors.surface.card,
          borderWidth: 2,
          borderColor: theme.colors.border.default,
          borderBottomWidth: 4,
          borderBottomColor: theme.colors.border.strong,
          ...theme.shadows.sm,
        };
    }
  };

  const variantStyle = getVariantStyle();
  // Only animate if interactive and has 3D depth
  const shouldAnimate = isInteractive && variant !== 'elevated';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || !isInteractive}
      style={[
        styles.card,
        variantStyle,
        { opacity: disabled ? 0.5 : 1 },
        shouldAnimate && animatedStyle,
        style,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
});
