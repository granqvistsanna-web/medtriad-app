import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius, Easings } from '@/constants/theme';

type ScoreDisplayProps = {
  score: number;
  combo?: number;
};

export function ScoreDisplay({ score, combo = 1 }: ScoreDisplayProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  // Track previous combo for pulse animation
  const previousCombo = useRef(combo);
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(0);

  // Pop animation when combo increases
  useEffect(() => {
    if (combo > previousCombo.current) {
      // Pop animation: dramatic overshoot then gentle settle
      scale.value = withSequence(
        withSpring(1.35, Easings.pop),
        withSpring(1, Easings.gentle)
      );

      // Brief background flash for glow effect
      bgOpacity.value = withSequence(
        withSpring(1, Easings.pop),
        withSpring(0, { damping: 20, stiffness: 100 })
      );
    }
    previousCombo.current = combo;
  }, [combo, scale, bgOpacity]);

  const comboBadgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value * 0.3,
  }));

  return (
    <View style={styles.container}>
      <Text style={[styles.score, { color: colors.text }]}>
        {score.toLocaleString()}
      </Text>
      {combo > 1 && (
        <View style={styles.comboWrapper}>
          {/* Glow layer */}
          <Animated.View
            style={[
              styles.comboGlow,
              { backgroundColor: colors.primary },
              bgAnimatedStyle,
            ]}
          />
          {/* Badge */}
          <Animated.View
            style={[
              styles.comboBadge,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
              comboBadgeAnimatedStyle,
            ]}
          >
            <Text style={[styles.comboText, { color: colors.text }]}>×{combo}</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  score: {
    ...Typography.heading,
    fontVariant: ['tabular-nums'],
  },
  comboWrapper: {
    position: 'relative',
  },
  comboGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: Radius.full,
  },
  comboBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  comboText: {
    ...Typography.label,
    fontSize: 14,
  },
});
