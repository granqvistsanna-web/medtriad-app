import { SafeAreaView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { HighScoreBadge } from '@/components/results/HighScoreBadge';
import { Colors, Typography, Spacing } from '@/constants/theme';

type ResultsParams = {
  score: string;
  correctCount: string;
  bestStreak: string;
  isNewHighScore: string;
};

export default function ResultsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const params = useLocalSearchParams<ResultsParams>();

  // Parse params with safe defaults
  const score = parseInt(params.score ?? '0', 10);
  const correctCount = parseInt(params.correctCount ?? '0', 10);
  const bestStreak = parseInt(params.bestStreak ?? '1', 10);
  const isNewHighScore = params.isNewHighScore === 'true';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* New High Score Badge */}
        {isNewHighScore && (
          <View style={styles.badgeContainer}>
            <HighScoreBadge />
          </View>
        )}

        {/* Score Display */}
        <View style={styles.scoreSection}>
          <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>
            Final Score
          </Text>
          <Text style={[styles.score, { color: colors.text }]}>
            {score.toLocaleString()}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {correctCount}/10
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Correct
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {bestStreak}x
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Best Streak
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          label="Play Again"
          onPress={() => router.replace('/quiz')}
        />
        <Button
          label="Home"
          variant="secondary"
          onPress={() => router.replace('/(tabs)')}
        />
      </View>
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
  badgeContainer: {
    marginBottom: Spacing.md,
  },
  scoreSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  score: {
    ...Typography.display,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  stat: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    ...Typography.heading,
  },
  statLabel: {
    ...Typography.footnote,
  },
  divider: {
    width: 1,
    height: 40,
  },
  buttons: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
});
