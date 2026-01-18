import { StyleSheet, Text, View } from 'react-native';
import { SymbolViewProps } from 'expo-symbols';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography, Shadows, Radius, Spacing } from '@/constants/theme';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: SymbolViewProps['name'];
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  const colors = Colors.light;
  const shadow = Shadows.light.sm;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundCard,
          ...shadow,
        },
      ]}
    >
      {icon && (
        <IconSymbol
          name={icon}
          size={24}
          color={colors.primary}
        />
      )}
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  value: {
    ...Typography.stat,
  },
  label: {
    ...Typography.caption,
  },
});
