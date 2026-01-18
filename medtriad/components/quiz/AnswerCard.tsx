import { StyleSheet, Text, useColorScheme, type ViewStyle, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, Typography, Shadows, Radius, Spacing } from '@/constants/theme';

type AnswerState = 'default' | 'correct' | 'incorrect' | 'revealed';

type AnswerCardProps = {
  condition: string;
  onPress: () => void;
  state?: AnswerState;
  disabled?: boolean;
  style?: ViewStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnswerCard({
  condition,
  onPress,
  state = 'default',
  disabled,
  style,
}: AnswerCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const shadow = Shadows[scheme].md;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && state === 'default') {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const getBackgroundColor = () => {
    switch (state) {
      case 'correct':
        return colors.successBg;
      case 'incorrect':
        return colors.errorBg;
      case 'revealed':
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
      default:
        return colors.border;
    }
  };

  const getTextColor = () => {
    switch (state) {
      case 'revealed':
        return colors.success;
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
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: state === 'default' ? 1 : 2,
          ...shadow,
          opacity: disabled && state === 'default' ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      <Text style={[styles.text, { color: getTextColor() }]}>{condition}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.label,
    textAlign: 'center',
  },
});
