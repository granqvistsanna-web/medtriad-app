import { ComponentType } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
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

interface SettingsRowProps {
  label: string;
  onPress: () => void;
  icon?: ComponentType<SolarIconProps>;
  destructive?: boolean;
}

export function SettingsRow({ label, onPress, icon, destructive = false }: SettingsRowProps) {
  const textColor = destructive ? theme.colors.danger.main : 'primary';
  const iconColor = destructive ? theme.colors.danger.main : theme.colors.icon.default;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.colors.surface.pressed },
      ]}
    >
      <View style={styles.leftContent}>
        {icon && (
          <View style={styles.icon}>
            <Icon icon={icon} size="md" color={iconColor} />
          </View>
        )}
        <Text variant="body" color={textColor}>{label}</Text>
      </View>
    </Pressable>
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
});
