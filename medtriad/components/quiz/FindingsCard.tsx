import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, Typography, Radius, Spacing, Durations } from '@/constants/theme';

type FindingsCardProps = {
  findings: [string, string, string];
  category?: string;
};

export function FindingsCard({ findings, category }: FindingsCardProps) {
  const colors = Colors.light;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.primaryLight,
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Category label */}
      {category && (
        <Animated.Text
          entering={FadeInUp.duration(Durations.normal)}
          style={[styles.category, { color: colors.primary }]}
        >
          {category.toUpperCase()}
        </Animated.Text>
      )}

      {/* Findings as compact pills */}
      <View style={styles.findingsContainer}>
        {findings.map((finding, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.delay(index * Durations.stagger).duration(Durations.normal).springify()}
            style={[styles.findingPill, { borderColor: colors.border }]}
          >
            <View style={[styles.numberBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.number, { color: colors.textInverse }]}>{index + 1}</Text>
            </View>
            <Text style={[styles.finding, { color: colors.textSecondary }]} numberOfLines={2}>
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
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  category: {
    ...Typography.tiny,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  findingsContainer: {
    gap: Spacing.sm,
  },
  findingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    ...Typography.footnote,
    fontWeight: '600',
  },
  finding: {
    ...Typography.footnote,
    fontWeight: '500',
    flex: 1,
  },
});
