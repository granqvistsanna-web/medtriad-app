/**
 * Tag Primitive
 *
 * Flat label/category component without 3D depth.
 * Used for category labels, filters, and tags.
 *
 * Usage:
 * ```tsx
 * import { Tag } from '@/components/primitives';
 * import { Bookmark } from '@solar-icons/react-native/Bold';
 *
 * <Tag label="Cardiology" variant="brand" />
 * <Tag label="Filter" icon={Bookmark} onPress={() => {}} />
 * <Tag label="Selected" onRemove={() => {}} />
 * ```
 */

import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import { theme } from '@/constants/theme';
import { Text } from './Text';
import { Icon } from './Icon';
import { CloseCircle } from '@solar-icons/react-native/Bold';

// Tag variants for different contexts
export type TagVariant = 'default' | 'brand' | 'success' | 'info' | 'purple';

// Solar Icon component type
type SolarIconProps = SvgProps & {
  size?: number;
  color?: string;
  mirrored?: boolean;
  alt?: string;
};

export type TagProps = {
  /** Tag label text */
  label: string;
  /** Optional Solar Icon component */
  icon?: ComponentType<SolarIconProps>;
  /** Visual variant */
  variant?: TagVariant;
  /** Press handler - makes tag tappable */
  onPress?: () => void;
  /** Remove handler - shows X button */
  onRemove?: () => void;
  /** Additional styles */
  style?: ViewStyle;
};

// Variant configurations - subtle backgrounds with tonal text
const VARIANTS: Record<TagVariant, {
  backgroundColor: string;
  textColor: string;
  iconColor: string;
}> = {
  default: {
    backgroundColor: theme.colors.surface.secondary,
    textColor: theme.colors.text.secondary,
    iconColor: theme.colors.text.muted,
  },
  brand: {
    backgroundColor: theme.colors.surface.brand,
    textColor: theme.colors.text.brand,
    iconColor: theme.colors.brand.primary,
  },
  success: {
    backgroundColor: theme.colors.success.light,
    textColor: theme.colors.success.text,
    iconColor: theme.colors.success.main,
  },
  info: {
    backgroundColor: theme.colors.blue.light,
    textColor: theme.colors.blue.text,
    iconColor: theme.colors.blue.main,
  },
  purple: {
    backgroundColor: theme.colors.purple.light,
    textColor: theme.colors.purple.text,
    iconColor: theme.colors.purple.main,
  },
};

/**
 * Renders a flat tag/label component.
 *
 * @example
 * // Basic category tag
 * <Tag label="Cardiology" variant="brand" />
 *
 * @example
 * // Tappable filter tag with icon
 * import { Filter } from '@solar-icons/react-native/Bold';
 * <Tag label="Filter" icon={Filter} onPress={() => {}} />
 *
 * @example
 * // Removable tag
 * <Tag label="Selected" onRemove={() => {}} />
 */
export function Tag({
  label,
  icon,
  variant = 'default',
  onPress,
  onRemove,
  style,
}: TagProps) {
  const colors = VARIANTS[variant];
  const isInteractive = !!onPress;

  const content = (
    <View
      style={[
        styles.tag,
        { backgroundColor: colors.backgroundColor },
        style,
      ]}
    >
      {icon && (
        <Icon
          icon={icon}
          size="sm"
          color={colors.iconColor}
          style={styles.icon}
        />
      )}
      <Text variant="tiny" color={colors.textColor} weight="semibold">
        {label.toUpperCase()}
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeButton}>
          <Icon icon={CloseCircle} size="sm" color={colors.iconColor} />
        </Pressable>
      )}
    </View>
  );

  if (isInteractive) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm,
  },
  icon: {
    marginRight: 4,
  },
  removeButton: {
    marginLeft: 6,
  },
});
