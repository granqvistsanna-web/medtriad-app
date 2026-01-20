import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { theme, Typography, Spacing, Radius, Easings, Durations } from '@/constants/theme';
import { TriMascot, MascotMood } from '@/components/home/TriMascot';

type TimerBarProps = {
  seconds: number;
  totalSeconds: number;
  mascotMood?: MascotMood;
};

export function TimerBar({ seconds, totalSeconds, mascotMood = 'neutral' }: TimerBarProps) {
  const progress = seconds / totalSeconds;
  const isLow = seconds <= 5;
  const isCritical = seconds <= 3;

  // Animation values
  const animatedProgress = useSharedValue(progress);
  const pulse = useSharedValue(1);

  // Smooth progress animation for both width and color
  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: Durations.fast,
      easing: Easings.easeOut,
    });
  }, [progress]);

  // Pulse animation when time is low - spring-based for organic feel
  useEffect(() => {
    if (isCritical) {
      // Faster, more urgent pulse at critical
      pulse.value = withRepeat(
        withSequence(
          withSpring(1.25, Easings.pop),
          withSpring(1, Easings.gentle)
        ),
        -1,
        false
      );
    } else if (isLow) {
      // Gentler pulse at warning
      pulse.value = withRepeat(
        withSequence(
          withSpring(1.15, Easings.bouncy),
          withSpring(1, Easings.gentle)
        ),
        -1,
        false
      );
    } else {
      pulse.value = withSpring(1, Easings.gentle);
    }
  }, [isLow, isCritical]);

  // Color interpolation: teal (1.0) -> yellow (0.33) -> red (0.2) -> red (0)
  const barAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedProgress.value,
      [0, 0.2, 0.33, 1],
      [theme.colors.timer.danger, theme.colors.timer.danger, theme.colors.timer.warning, theme.colors.brand.primary]
    );

    return {
      width: `${animatedProgress.value * 100}%`,
      backgroundColor,
    };
  });

  // Text color also animates smoothly with progress
  const textAnimatedStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      animatedProgress.value,
      [0, 0.2, 0.33, 1],
      [theme.colors.timer.danger, theme.colors.timer.danger, theme.colors.timer.warning, theme.colors.text.primary]
    );

    return {
      transform: [{ scale: pulse.value }],
      color: textColor,
    };
  });

  return (
    <View style={styles.container}>
      {/* Small Tri mascot */}
      <View style={styles.mascotContainer}>
        <TriMascot mood={mascotMood} size="sm" animate={true} />
      </View>

      {/* Timer bar */}
      <View style={styles.barSection}>
        <View style={[styles.track, { backgroundColor: theme.colors.border.default }]}>
          <Animated.View style={[styles.fill, barAnimatedStyle]} />
        </View>
      </View>

      {/* Countdown number - Animated.Text for smooth color transitions */}
      <Animated.Text style={[styles.countdown, textAnimatedStyle]}>
        {seconds}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  mascotContainer: {
    width: 56,
    height: 56,
  },
  barSection: {
    flex: 1,
  },
  track: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  countdown: {
    ...Typography.heading,
    minWidth: 32,
    textAlign: 'center',
  },
});
