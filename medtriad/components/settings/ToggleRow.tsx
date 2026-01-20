import { Switch, View, StyleSheet } from 'react-native';
import { Text } from '@/components/primitives';
import { theme, Spacing } from '@/constants/theme';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <Text variant="body" color="primary" style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.border.default,
          true: theme.colors.brand.primary,
        }}
        ios_backgroundColor={theme.colors.border.default}
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
    flex: 1,
  },
});
