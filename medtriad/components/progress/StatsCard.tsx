import { StyleSheet, Text, View } from 'react-native';
import { SymbolViewProps } from 'expo-symbols';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography, Shadows, Radius, Spacing } from '@/constants/theme';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: SymbolViewProps['name'];
  description?: string;
}

export function StatsCard({ label, value, icon, description }: StatsCardProps) {
  const colors = Colors.light;
  const shadow = Shadows.light.sm;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundSecondary,
          ...shadow,
        },
      ]}
    >
      {icon && (
        <IconSymbol
          name={icon}
          size={20}
          color={colors.primary}
        />
      )}
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: Spacing.xs,
    minHeight: 100,
  },
  label: {
    ...Typography.tiny,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  description: {
    ...Typography.footnote,
  },
});
