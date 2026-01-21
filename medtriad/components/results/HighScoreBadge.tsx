import { StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Star } from '@solar-icons/react-native/Bold';
import { Text, Icon } from '@/components/primitives';
import { theme, Spacing, Radius, Shadows } from '@/constants/theme';

// Warm gold color for celebratory star
const GOLD_STAR = '#FFD54F';

export function HighScoreBadge() {
  return (
    <Animated.View
      entering={ZoomIn.springify().damping(12)}
      style={[
        styles.badge,
        {
          backgroundColor: theme.colors.brand.primary,
          borderColor: theme.colors.brand.primaryDark,
          borderBottomColor: theme.colors.brand.primaryDarker,
          ...Shadows.light.md,
        },
      ]}
    >
      <Icon icon={Star} size="sm" color={GOLD_STAR} />
      <Text variant="label" color="inverse">New High Score!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderBottomWidth: 4,
    gap: Spacing.xs,
  },
});
