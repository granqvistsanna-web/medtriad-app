import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '@/components/primitives';
import { Triad } from '@/types';
import { theme, Spacing, Radius, Durations } from '@/constants/theme';

type ExplanationCardProps = {
  /** The triad to display explanation for */
  triad: Triad;
};

/**
 * ExplanationCard displays triad information after the user answers a question.
 * Shows the condition name and classic triad findings in a calm blue-themed card.
 *
 * For MVP, we use the triad's existing data as the "explanation".
 * Real explanations can be added to triads.json in a future phase.
 */
export function ExplanationCard({ triad }: ExplanationCardProps) {
  const findingsText = `Classic triad: ${triad.findings.join(', ')}`;

  return (
    <Animated.View
      entering={FadeInUp.duration(Durations.normal)}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.blue.light,
          borderColor: theme.colors.blue.main,
          borderBottomColor: theme.colors.blue.dark,
        },
      ]}
    >
      {/* Category label */}
      <Text
        variant="tiny"
        color={theme.colors.blue.text}
        style={styles.category}
      >
        {triad.category.toUpperCase()}
      </Text>

      {/* Condition name */}
      <Text variant="heading" color="primary" weight="semibold">
        {triad.condition}
      </Text>

      {/* Findings summary */}
      <Text variant="body" color="secondary">
        {findingsText}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  category: {
    letterSpacing: 1,
  },
});
