import { StyleSheet, Text, View, type ViewStyle, Pressable } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  FadeInUp,
} from 'react-native-reanimated';
import { Colors, Typography, Radius, Spacing, Durations } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

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

  // Shake animation when incorrect
  useEffect(() => {
    if (state === 'incorrect') {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shakeX.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && state === 'default') {
      scale.value = withSpring(0.95, { damping: 12, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
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

  const getIcon = () => {
    switch (state) {
      case 'correct':
        return 'checkmark';
      case 'incorrect':
        return 'xmark';
      default:
        return null;
    }
  };

  const icon = getIcon();

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
      {icon && (
        <View style={styles.iconContainer}>
          <IconSymbol
            name={icon as any}
            size={18}
            color={state === 'correct' ? colors.success : colors.error}
          />
        </View>
      )}
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
  iconContainer: {
    marginLeft: Spacing.sm,
  },
});
