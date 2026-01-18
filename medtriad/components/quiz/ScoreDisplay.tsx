import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

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

  // Pulse animation when combo increases
  useEffect(() => {
    if (combo > previousCombo.current) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 100 }),
        withTiming(1.0, { duration: 100 })
      );
    }
    previousCombo.current = combo;
  }, [combo, scale]);

  const comboBadgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Text style={[styles.score, { color: colors.text }]}>
        {score.toLocaleString()}
      </Text>
      {combo > 1 && (
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
