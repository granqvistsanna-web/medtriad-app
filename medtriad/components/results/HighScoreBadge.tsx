import { StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Star } from '@solar-icons/react-native/Bold';
import { Text, Icon } from '@/components/primitives';
import { theme, Spacing, Radius, Shadows } from '@/constants/theme';

export function HighScoreBadge() {
  return (
    <Animated.View
      entering={ZoomIn.springify().damping(12)}
      style={[
        styles.badge,
        {
          backgroundColor: theme.colors.text.primary,
          ...Shadows.light.md,
        },
      ]}
    >
      <Icon icon={Star} size="sm" color={theme.colors.gold.main} />
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
    gap: Spacing.sm,
  },
});
