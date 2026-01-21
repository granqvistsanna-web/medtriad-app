import { StyleSheet, View } from 'react-native';
import { theme, Spacing } from '@/constants/theme';
import { Text } from '@/components/primitives';

interface StatsCardProps {
  label: string;
  value: string | number;
  description?: string;
}

/**
 * Minimal stats display - typography-focused, no colors.
 * Part of the refined Progress page redesign.
 */
export function StatsCard({ label, value, description }: StatsCardProps) {
  return (
    <View style={styles.container}>
      <Text variant="stat" color="primary" weight="bold" style={styles.value}>
        {value}
      </Text>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  value: {
    fontSize: 32,
    lineHeight: 38,
    marginBottom: Spacing.xs,
  },
});
