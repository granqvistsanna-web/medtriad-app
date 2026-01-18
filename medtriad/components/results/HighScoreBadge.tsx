import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';

export function HighScoreBadge() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const shadow = Shadows[scheme].md;

  return (
    <View
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
    </View>
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
