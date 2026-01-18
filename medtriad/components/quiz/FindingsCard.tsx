import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Colors, Typography, Shadows, Radius, Spacing } from '@/constants/theme';

type FindingsCardProps = {
  findings: [string, string, string];
};

export function FindingsCard({ findings }: FindingsCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const shadow = Shadows[scheme].lg;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundCard,
          borderColor: colors.border,
          ...shadow,
        },
      ]}
    >
      {findings.map((finding, index) => (
        <View key={index} style={styles.row}>
          <Text style={[styles.number, { color: colors.textMuted }]}>{index + 1}</Text>
          <Text style={[styles.finding, { color: colors.text }]}>{finding}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.base,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  number: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    width: 24,
  },
  finding: {
    ...Typography.body,
    flex: 1,
  },
});
