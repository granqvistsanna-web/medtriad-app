import { ComponentType } from 'react';
import { Switch, View, StyleSheet, Platform } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { Text, Icon } from '@/components/primitives';
import { theme, Spacing } from '@/constants/theme';

// Solar Icon component type
type SolarIconProps = SvgProps & {
  size?: number;
  color?: string;
  mirrored?: boolean;
  alt?: string;
};

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: ComponentType<SolarIconProps>;
}

export function ToggleRow({ label, value, onValueChange, icon }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.leftContent}>
        {icon && (
          <View style={styles.icon}>
            <Icon icon={icon} size="md" color={theme.colors.icon.default} />
          </View>
        )}
        <Text variant="body" color="primary" style={styles.label}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.border.default,
          true: theme.colors.brand.primary,
        }}
        thumbColor={theme.colors.surface.primary}
        ios_backgroundColor={theme.colors.border.default}
        style={Platform.OS === 'web' ? { backgroundColor: 'transparent' } : undefined}
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
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  label: {
    flex: 1,
  },
});
