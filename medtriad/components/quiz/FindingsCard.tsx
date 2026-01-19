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
          backgroundColor: colors.backgroundSecondary,
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

      {/* Findings as pills */}
      <View style={styles.findingsContainer}>
        {findings.map((finding, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.delay(index * Durations.stagger).duration(Durations.normal).springify()}
            style={[styles.findingPill, { backgroundColor: colors.primaryLight }]}
          >
            <View style={[styles.numberBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.number, { color: colors.textInverse }]}>{index + 1}</Text>
            </View>
            <Text style={[styles.finding, { color: colors.text }]} numberOfLines={2}>
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
  },
  category: {
    ...Typography.tiny,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  findingsContainer: {
    gap: Spacing.sm,
  },
  findingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 12,
    fontWeight: '700',
  },
  finding: {
    ...Typography.caption,
    fontWeight: '500',
    flex: 1,
  },
});
