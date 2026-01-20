/**
 * Button Primitive
 *
 * Duolingo-style button with 3D press animation and all states.
 * Uses Text and Icon primitives internally for consistency.
 *
 * Usage:
 * ```tsx
 * import { Button } from '@/components/primitives';
 *
 * <Button label="Start Quiz" onPress={() => {}} />
 * <Button label="Loading" loading />
 * <Button label="Disabled" disabled />
 * ```
 */

import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import { theme } from '@/constants/theme';
import { Text } from './Text';
import { Icon, type IconSize } from './Icon';

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

// Button sizes
type ButtonSize = 'sm' | 'md' | 'lg';

// Solar Icon component type
type SolarIconProps = SvgProps & {
  size?: number;
  color?: string;
  mirrored?: boolean;
  alt?: string;
};

export type ButtonProps = {
  /** Button label text */
  label: string;
  /** Press handler */
  onPress: () => void;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Optional Solar Icon component */
  icon?: ComponentType<SolarIconProps>;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Loading state - shows spinner */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Additional styles */
  style?: ViewStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Size configurations
const SIZES: Record<ButtonSize, { height: number; paddingHorizontal: number; iconSize: IconSize }> = {
  sm: { height: 40, paddingHorizontal: 16, iconSize: 'sm' },
  md: { height: 48, paddingHorizontal: 20, iconSize: 'md' },
  lg: { height: 56, paddingHorizontal: 24, iconSize: 'md' },
};

// Variant configurations
const VARIANTS: Record<ButtonVariant, {
  backgroundColor: string;
  borderBottomColor: string;
  textColor: string;
  borderWidth?: number;
  borderColor?: string;
}> = {
  primary: {
    backgroundColor: theme.colors.brand.primary,
    borderBottomColor: theme.colors.brand.primaryDark,
    textColor: theme.colors.text.inverse,
  },
  secondary: {
    backgroundColor: theme.colors.success.main,
    borderBottomColor: theme.colors.success.dark,
    textColor: theme.colors.text.inverse,
  },
  outline: {
    backgroundColor: theme.colors.surface.card,
    borderBottomColor: theme.colors.border.strong,
    textColor: theme.colors.text.brand,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    textColor: theme.colors.text.brand,
  },
};

/**
 * Renders a button with Duolingo-style 3D press animation.
 *
 * @example
 * // Primary button
 * <Button label="Start Quiz" onPress={() => {}} />
 *
 * @example
 * // Loading state
 * <Button label="Saving..." onPress={() => {}} loading />
 *
 * @example
 * // Disabled state
 * <Button label="Submit" onPress={() => {}} disabled />
 *
 * @example
 * // With icon
 * import { Play } from '@solar-icons/react-native/Bold';
 * <Button label="Play" onPress={() => {}} icon={Play} />
 *
 * @example
 * // Outline variant
 * <Button label="Cancel" onPress={() => {}} variant="outline" />
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const borderBottom = useSharedValue(4);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.98, theme.motion.springs.press);
      borderBottom.value = withSpring(2, theme.motion.springs.press);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, theme.motion.springs.press);
    borderBottom.value = withSpring(4, theme.motion.springs.press);
  };

  const variantStyle = VARIANTS[variant];
  const sizeStyle = SIZES[size];
  const isDisabled = disabled || loading;
  const isGhost = variant === 'ghost';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          backgroundColor: variantStyle.backgroundColor,
          borderBottomColor: variantStyle.borderBottomColor,
          borderRadius: theme.radius.lg,
          opacity: isDisabled ? 0.5 : 1,
        },
        variantStyle.borderWidth && {
          borderWidth: variantStyle.borderWidth,
          borderColor: variantStyle.borderColor,
        },
        isGhost && { borderBottomWidth: 0 },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Icon icon={icon} size={sizeStyle.iconSize} color={variantStyle.textColor} />
          )}
          <Text
            variant="label"
            color={variantStyle.textColor}
            weight="bold"
            style={styles.label}
          >
            {label.toUpperCase()}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon icon={icon} size={sizeStyle.iconSize} color={variantStyle.textColor} />
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    letterSpacing: 0.5,
  },
});
