import { StyleSheet, View, Pressable } from 'react-native';
import { Refresh } from '@solar-icons/react-native/Bold';
import { theme, Radius, Spacing } from '@/constants/theme';
import { Text, Icon } from '@/components/primitives';

type ReviewDueBadgeProps = {
  dueCount: number;
  onPress: () => void;
};

export function ReviewDueBadge({ dueCount, onPress }: ReviewDueBadgeProps) {
  // Don't render anything if no triads are due
  if (dueCount === 0) {
    return null;
  }

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.content}>
        <Icon icon={Refresh} size="md" color={theme.colors.brand.primary} />
        <View style={styles.textContainer}>
          <Text variant="label" weight="bold" color="brand">
            {dueCount} triad{dueCount !== 1 ? 's' : ''} due
          </Text>
          <Text variant="footnote" color="secondary">
            Tap to review
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.brand.primary,
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.brand.primaryDark,
    backgroundColor: theme.colors.surface.brand,
    padding: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
});
