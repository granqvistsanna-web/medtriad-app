import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

type ScoreDisplayProps = {
  score: number;
  combo?: number;
};

export function ScoreDisplay({ score, combo = 1 }: ScoreDisplayProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={styles.container}>
      <Text style={[styles.score, { color: colors.text }]}>
        {score.toLocaleString()}
      </Text>
      {combo > 1 && (
        <View
          style={[
            styles.comboBadge,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.comboText, { color: colors.text }]}>×{combo}</Text>
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
