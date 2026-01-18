import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography, Shadows, Radius, Spacing, Easings } from '@/constants/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
}: ButtonProps) {
  const colors = Colors.light;
  const shadow = Shadows.light.md;

  const scale = useSharedValue(1);
  const borderBottom = useSharedValue(3);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.98, Easings.press);
      borderBottom.value = withSpring(1, Easings.press); // Compress depth
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Easings.press);
    borderBottom.value = withSpring(3, Easings.press); // Restore depth
  };

  const handleHoverIn = () => {
    if (!disabled) {
      scale.value = withSpring(1.02, Easings.press);
    }
  };

  const handleHoverOut = () => {
    scale.value = withSpring(1, Easings.press);
  };

  const isPrimary = variant === 'primary';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      disabled={disabled}
      style={[
        styles.button,
        isPrimary
          ? {
              backgroundColor: colors.primary,
              ...shadow,
            }
          : {
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: colors.border,
            },
        { opacity: disabled ? 0.5 : 1 },
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <IconSymbol
              name={icon as any}
              size={18}
              color={isPrimary ? colors.primary : colors.text}
            />
          </View>
        )}
        <Text
          style={[
            styles.label,
            { color: isPrimary ? colors.textInverse : colors.text },
          ]}
        >
          {label}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    // Depth border - width animated via borderBottom shared value
    borderBottomColor: '#3BA99C',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.label,
  },
});
