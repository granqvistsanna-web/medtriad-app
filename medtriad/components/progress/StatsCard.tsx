import { StyleSheet, View } from 'react-native';
import { ComponentType } from 'react';
import { SvgProps } from 'react-native-svg';
import { Cup, Target, Gamepad, Fire } from '@solar-icons/react-native/Bold';
import { theme, Shadows, Radius, Spacing, CardStyle } from '@/constants/theme';
import { Text, Icon } from '@/components/primitives';

// Solar icon type
type SolarIconComponent = ComponentType<SvgProps & { size?: number; color?: string }>;

// Map icon names to Solar icons
const ICON_MAP: Record<string, SolarIconComponent> = {
  trophy: Cup,
  target: Target,
  gamepad: Gamepad,
  fire: Fire,
};

// Duolingo-style color schemes for each stat type using theme tokens
const STAT_THEMES: Record<string, {
  headerColor: string;
  borderColor: string;
  iconColor: string;
  valueColor: string;
}> = {
  'High Score': {
    headerColor: theme.colors.purple.main,
    borderColor: theme.colors.purple.dark,
    iconColor: theme.colors.purple.text,
    valueColor: theme.colors.purple.text,
  },
  'Accuracy': {
    headerColor: '#2DD4BF',    // Teal - keeping for visual variety
    borderColor: '#14B8A6',
    iconColor: '#0D9488',
    valueColor: '#0D9488',
  },
  'Games Played': {
    headerColor: theme.colors.blue.main,
    borderColor: theme.colors.blue.dark,
    iconColor: theme.colors.blue.text,
    valueColor: theme.colors.blue.text,
  },
  'Best Streak': {
    headerColor: theme.colors.streak.main,
    borderColor: theme.colors.streak.dark,
    iconColor: theme.colors.streak.text,
    valueColor: theme.colors.streak.text,
  },
};

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof ICON_MAP;
  description?: string;
}

export function StatsCard({ label, value, icon, description }: StatsCardProps) {
  const statTheme = STAT_THEMES[label] || {
    headerColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primaryDark,
    iconColor: theme.colors.brand.primary,
    valueColor: theme.colors.text.primary,
  };

  const IconComponent = icon ? ICON_MAP[icon] : null;

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: statTheme.borderColor,
          borderBottomColor: statTheme.borderColor,
        },
      ]}
    >
      {/* Colored header bar - Duolingo style */}
      <View style={[styles.headerBar, { backgroundColor: statTheme.headerColor }]}>
        <Text variant="tiny" color="inverse" weight="bold" style={styles.headerLabel}>
          {label.toUpperCase()}
        </Text>
      </View>

      {/* Card body */}
      <View style={styles.cardBody}>
        {/* Value row with icon */}
        <View style={styles.valueRow}>
          {IconComponent && (
            <Icon icon={IconComponent} size="md" color={statTheme.iconColor} />
          )}
          <Text variant="stat" color={statTheme.valueColor} weight="extrabold" style={styles.value}>
            {value}
          </Text>
        </View>
        {description && (
          <Text variant="footnote" color="muted" align="center">
            {description}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...CardStyle,
    flex: 1,
    padding: 0,
    overflow: 'hidden',
    minHeight: 100,
  },
  headerBar: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderTopLeftRadius: Radius.lg - 2,
    borderTopRightRadius: Radius.lg - 2,
  },
  headerLabel: {
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  cardBody: {
    padding: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  value: {
    fontSize: 36,
    lineHeight: 42,
  },
});
