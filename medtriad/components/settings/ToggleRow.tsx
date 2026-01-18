import { Switch, View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  const colors = Colors.light;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.border,
          true: colors.primary,
        }}
        ios_backgroundColor={colors.border}
        // thumbColor not customized - keeps native iOS appearance (per research pitfall 3)
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    minHeight: 44, // iOS tap target minimum
  },
  label: {
    ...Typography.body,
    flex: 1,
  },
});
