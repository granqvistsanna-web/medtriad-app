import { StyleSheet, Text, type ViewStyle, Pressable } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeInUp,
} from 'react-native-reanimated';
import { Colors, Typography, Radius, Spacing, Durations, Easings } from '@/constants/theme';

type AnswerState = 'default' | 'correct' | 'incorrect' | 'revealed' | 'faded';

type AnswerCardProps = {
  condition: string;
  onPress: () => void;
  state?: AnswerState;
  disabled?: boolean;
  style?: ViewStyle;
  delay?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnswerCard({
  condition,
  onPress,
  state = 'default',
  disabled,
  style,
  delay = 0,
}: AnswerCardProps) {
  const colors = Colors.light;

  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  // State-based animations
  useEffect(() => {
    if (state === 'correct') {
      // Pop animation when correct
      scale.value = withSequence(
        withSpring(1.05, Easings.pop),   // Quick overshoot
        withSpring(1, Easings.gentle)    // Settle back
      );
    } else if (state === 'incorrect') {
      // Shake animation when incorrect - spring-based for physical feel
      shakeX.value = withSequence(
        withSpring(-5, { damping: 3, stiffness: 500 }),
        withSpring(5, { damping: 3, stiffness: 500 }),
        withSpring(-3, { damping: 5, stiffness: 500 }),
        withSpring(0, { damping: 10, stiffness: 300 })
      );
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shakeX.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && state === 'default') {
      scale.value = withSpring(0.95, Easings.press);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Easings.press);
  };

  const getBorderWidth = () => {
    switch (state) {
      case 'correct':
      case 'incorrect':
      case 'revealed':
        return 3; // Thicker for visibility
      default:
        return 2;
    }
  };

  const getBackgroundColor = () => {
    switch (state) {
      case 'correct':
        return colors.successBg;
      case 'incorrect':
        return colors.errorBg;
      case 'revealed':
        return colors.successBg;
      case 'faded':
        return colors.backgroundCard;
      default:
        return colors.backgroundCard;
    }
  };

  const getBorderColor = () => {
    switch (state) {
      case 'correct':
        return colors.success;
      case 'incorrect':
        return colors.error;
      case 'revealed':
        return colors.success;
      case 'faded':
        return colors.border;
      default:
        return colors.border;
    }
  };

  const getTextColor = () => {
    switch (state) {
      case 'correct':
        return colors.success;
      case 'incorrect':
        return colors.error;
      case 'revealed':
        return colors.success;
      case 'faded':
        return colors.text;
      default:
        return colors.text;
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || state !== 'default'}
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: getBorderWidth(),
          opacity: state === 'faded' ? 0.4 : (disabled && state === 'default' ? 0.4 : 1),
        },
        animatedStyle,
        style,
      ]}
    >
      <Text
        style={[styles.text, { color: getTextColor() }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {condition}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 48,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.label,
    fontSize: 15,
    textAlign: 'center',
    flex: 1,
  },
});
