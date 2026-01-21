import { StyleSheet, View, type ViewStyle, Pressable } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeInUp,
} from 'react-native-reanimated';
import { Text } from '@/components/primitives';
import { theme, Radius, Spacing, Durations, Easings, Shadows } from '@/constants/theme';

type AnswerState = 'default' | 'correct' | 'incorrect' | 'revealed' | 'faded';

type AnswerCardProps = {
  condition: string;
  onPress: () => void;
  state?: AnswerState;
  disabled?: boolean;
  style?: ViewStyle;
  delay?: number;
  /** Letter label (A, B, C, D) shown on the left */
  letter?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnswerCard({
  condition,
  onPress,
  state = 'default',
  disabled,
  style,
  delay = 0,
  letter,
}: AnswerCardProps) {
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
        return 2;
      default:
        return 1;
    }
  };

  const getBackgroundColor = () => {
    switch (state) {
      case 'correct':
        return theme.colors.success.light;
      case 'incorrect':
        return theme.colors.danger.light;
      case 'revealed':
        return theme.colors.success.light;
      case 'faded':
        return theme.colors.surface.card;
      default:
        return theme.colors.surface.card;
    }
  };

  const getBorderColor = () => {
    switch (state) {
      case 'correct':
        return theme.colors.success.main;
      case 'incorrect':
        return theme.colors.danger.main;
      case 'revealed':
        return theme.colors.success.main;
      case 'faded':
        return theme.colors.border.default;
      default:
        return theme.colors.border.default; // Neutral gray border for contrast with FindingsCard
    }
  };

  // Duolingo-style: darker bottom border for depth using semantic tokens
  const getBottomBorderColor = () => {
    switch (state) {
      case 'correct':
        return theme.colors.success.darker; // Uses semantic token
      case 'incorrect':
        return theme.colors.danger.darker; // Uses semantic token
      case 'revealed':
        return theme.colors.success.darker;
      case 'faded':
        return theme.colors.border.strong;
      default:
        return theme.colors.border.strong; // Neutral darker border for depth
    }
  };

  const getTextColor = () => {
    switch (state) {
      case 'correct':
        return theme.colors.success.main;
      case 'incorrect':
        return theme.colors.danger.main;
      case 'revealed':
        return theme.colors.success.main;
      case 'faded':
        return theme.colors.text.primary;
      default:
        return theme.colors.text.primary;
    }
  };

  const getAccessibilityLabel = () => {
    const prefix = letter ? `Option ${letter}, ` : '';
    const stateLabel = state === 'correct' ? ', correct answer' :
                       state === 'incorrect' ? ', incorrect' :
                       state === 'revealed' ? ', correct answer revealed' : '';
    return `${prefix}${condition}${stateLabel}`;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || state !== 'default'}
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityState={{
        disabled: disabled || state !== 'default',
        selected: state === 'correct' || state === 'incorrect',
      }}
      style={[
        styles.card,
        Shadows.light.sm,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: getBorderWidth(),
          borderBottomColor: getBottomBorderColor(),
          opacity: state === 'faded' ? 0.4 : (disabled && state === 'default' ? 0.4 : 1),
        },
        animatedStyle,
        style,
      ]}
    >
      {letter && (
        <View style={[styles.letterBadge, { backgroundColor: theme.colors.brand.primary }]}>
          <Text variant="footnote" color="inverse" weight="bold">{letter}</Text>
        </View>
      )}
      <Text
        variant="label"
        color={getTextColor()}
        style={styles.text}
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
    height: 58,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    // Duolingo-style hard border
    borderBottomWidth: 4,
  },
  letterBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'left',
    flex: 1,
  },
});
