import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { SymbolViewProps } from 'expo-symbols';

interface SettingsRowProps {
  label: string;
  onPress: () => void;
  icon?: SymbolViewProps['name'];
  destructive?: boolean;
}

export function SettingsRow({ label, onPress, icon, destructive = false }: SettingsRowProps) {
  const colors = Colors.light;
  const textColor = destructive ? colors.error : colors.text;
  const iconColor = destructive ? colors.error : colors.icon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: colors.pressed },
      ]}
    >
      <View style={styles.leftContent}>
        {icon && (
          <IconSymbol
            name={icon}
            size={22}
            color={iconColor}
            style={styles.icon}
          />
        )}
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
      <IconSymbol
        name="chevron.right"
        size={16}
        color={colors.textMuted}
      />
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
  label: {
    ...Typography.body,
  },
});
