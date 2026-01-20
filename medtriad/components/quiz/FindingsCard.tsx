import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '@/components/primitives';
import { theme, Radius, Spacing, Durations } from '@/constants/theme';

type FindingsCardProps = {
  findings: [string, string, string];
  category?: string;
};

export function FindingsCard({ findings, category }: FindingsCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface.brand,
          borderColor: theme.colors.surface.brand,
          borderBottomColor: theme.colors.brand.primary,
        },
      ]}
    >
      {/* Category label */}
      {category && (
        <Animated.View
          entering={FadeInUp.duration(Durations.normal)}
          style={styles.categoryContainer}
        >
          <Text variant="tiny" color={theme.colors.brand.primary} style={styles.category}>
            {category.toUpperCase()}
          </Text>
        </Animated.View>
      )}

      {/* Findings as simple list */}
      <View style={styles.findingsList}>
        {findings.map((finding, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.delay(index * Durations.stagger).duration(Durations.normal).springify()}
            style={styles.findingRow}
          >
            <View style={[styles.numberBadge, { backgroundColor: theme.colors.brand.primary }]}>
              <Text variant="footnote" color="inverse" weight="bold">{index + 1}</Text>
            </View>
            <Text variant="body" weight="medium" style={styles.finding} numberOfLines={2}>
              {finding}
            </Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  categoryContainer: {
    alignItems: 'center',
  },
  category: {
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  findingsList: {
    gap: Spacing.md,
  },
  findingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finding: {
    flex: 1,
  },
});
