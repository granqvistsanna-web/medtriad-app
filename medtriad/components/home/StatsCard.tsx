import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Colors, Typography, Shadows, Radius, Spacing } from '@/constants/theme';

type StatsCardProps = {
  value: number | string;
  label: string;
  icon?: React.ReactNode;
};

export function StatsCard({ value, label, icon }: StatsCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const shadow = Shadows[scheme].sm;

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
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconContainer: {
    marginBottom: Spacing.xs,
  },
  value: {
    ...Typography.heading,
  },
  label: {
    ...Typography.footnote,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
