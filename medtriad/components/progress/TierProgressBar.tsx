import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { theme, Radius } from '@/constants/theme';
import { clampProgress } from '@/services/validation';

const BAR_HEIGHT = 8; // Thicker, more prominent Duolingo style

type TierProgressBarProps = {
  progress: number; // 0-1
};

/**
 * Thin progress bar for tier progression display.
 *
 * Features:
 * - 8px height (Duolingo style)
 * - No percentage text (bar only)
 * - Uses theme.colors.brand.primary for fill
 * - Uses theme.colors.border.default for track background
 * - Animated fill using withTiming
 *
 * Usage:
 *   <TierProgressBar progress={tierProgress} />
 */
export function TierProgressBar({ progress }: TierProgressBarProps) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const safeProgress = clampProgress(progress);
    animatedProgress.value = withTiming(safeProgress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
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
