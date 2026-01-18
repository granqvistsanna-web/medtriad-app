import { StyleSheet, Text, useColorScheme } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';

export function HighScoreBadge() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const shadow = Shadows[scheme].md;

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(12)}
      style={[
        styles.badge,
        {
          backgroundColor: colors.text,
          ...shadow,
        },
      ]}
    >
      <Text style={styles.star}>★</Text>
      <Text style={[styles.text, { color: colors.textInverse }]}>New High Score!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    gap: Spacing.sm,
  },
  star: {
    fontSize: 18,
    color: '#FACC15', // Gold star
  },
  text: {
    ...Typography.label,
  },
});
