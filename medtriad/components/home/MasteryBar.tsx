import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  FadeInUp,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { theme, Spacing, Radius, Durations } from '@/constants/theme';
import { Text } from '@/components/primitives';
import { calculateLevel, getTotalProgress, MAX_QUESTIONS } from '@/services/mastery';

type MasteryBarProps = {
  totalAnswered: number;
  delay?: number;
};

export function MasteryBar({ totalAnswered, delay = 0 }: MasteryBarProps) {
  const level = calculateLevel(totalAnswered);
  const progress = getTotalProgress(totalAnswered);

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="caption" color="primary" weight="medium">
          Mastery Level {level}
        </Text>
        <Text variant="footnote" color="muted">
          {totalAnswered}/{MAX_QUESTIONS}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  track: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: theme.colors.border.default,
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: theme.colors.brand.primary,
  },
});
