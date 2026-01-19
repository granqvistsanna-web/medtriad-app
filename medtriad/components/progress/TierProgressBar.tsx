import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors, Radius } from '@/constants/theme';

const BAR_HEIGHT = 4; // Thin, understated per CONTEXT.md

type TierProgressBarProps = {
  progress: number; // 0-1
};

/**
 * Thin progress bar for tier progression display.
 *
 * Features:
 * - 4px height (thin, understated)
 * - No percentage text (bar only)
 * - Uses colors.primary for fill
 * - Uses colors.border for track background
 * - Animated fill using withTiming
 *
 * Usage:
 *   <TierProgressBar progress={tierProgress} />
 */
export function TierProgressBar({ progress }: TierProgressBarProps) {
  const colors = Colors.light;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { backgroundColor: colors.border }]}>
      <Animated.View
        style={[styles.fill, { backgroundColor: colors.primary }, fillStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
