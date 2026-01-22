import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { BookmarkBold } from '@solar-icons/react-native';

import { Text, Button } from '@/components/primitives';
import { theme, Spacing, Durations, Radius } from '@/constants/theme';

type ReviewResultsParams = {
  correctCount: string;
  totalQuestions: string;
  trickyCount: string;
};

/**
 * Review Results Screen
 *
 * Shows a calm summary of the completed review session.
 * No scores, no tier progression, no competition - just learning reinforcement.
 */
export default function ReviewResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ReviewResultsParams>();

  // Parse params with safe defaults
  const correctCount = parseInt(params.correctCount ?? '0', 10);
  const totalQuestions = parseInt(params.totalQuestions ?? '0', 10);
  const trickyCount = parseInt(params.trickyCount ?? '0', 10);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}
    >
      <View style={styles.content}>
        {/* Hero Section */}
        <Animated.View
          entering={FadeIn.duration(Durations.normal)}
          style={styles.heroSection}
        >
          <Text variant="title" color="primary" align="center">
            Review Complete
          </Text>

          <View style={styles.scoreContainer}>
            <Text
              variant="display"
              color={theme.colors.blue.main}
              align="center"
              style={styles.scoreText}
            >
              {correctCount}/{totalQuestions}
            </Text>
            <Text variant="caption" color="secondary" align="center">
              questions reviewed
            </Text>
          </View>
        </Animated.View>

        {/* Tricky Count - only show if > 0 */}
        {trickyCount > 0 && (
          <Animated.View
            entering={FadeInUp.delay(Durations.stagger).duration(Durations.normal).springify()}
            style={[styles.trickyBadge, { backgroundColor: theme.colors.blue.light }]}
          >
            <BookmarkBold
              size={18}
              color={theme.colors.blue.main}
            />
            <Text variant="footnote" color={theme.colors.blue.text}>
              Marked {trickyCount} as tricky
            </Text>
          </Animated.View>
        )}

        {/* Encouraging message */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 2).duration(Durations.normal).springify()}
        >
          <Text variant="body" color="secondary" align="center">
            Great review session! Your scheduled intervals have been updated.
          </Text>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <Animated.View
        entering={FadeInUp.delay(Durations.stagger * 3).duration(Durations.normal).springify()}
        style={styles.buttons}
      >
        <Button
          label="Review More"
          variant="primary"
          onPress={() => router.replace('/quiz/review')}
        />
        <Button
          label="Back to Home"
          variant="outline"
          onPress={() => router.replace('/(tabs)')}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  scoreContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  scoreText: {
    fontSize: 64,
    lineHeight: 72,
  },
  trickyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  buttons: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.base,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
});
