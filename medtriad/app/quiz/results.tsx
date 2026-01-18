import { useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { CountUp } from 'use-count-up';
import ConfettiCannon from 'react-native-confetti-cannon';

import { Button } from '@/components/ui/Button';
import { TriMascot } from '@/components/home/TriMascot';
import { HighScoreBadge } from '@/components/results/HighScoreBadge';
import { useStats } from '@/hooks/useStats';
import { calculateLevel, getQuestionsToNextLevel } from '@/services/mastery';
import { saveQuizHistory } from '@/services/stats-storage';
import { Colors, Typography, Spacing, Radius, Durations } from '@/constants/theme';
import { QUESTION_COUNT } from '@/types/quiz-state';

type ResultsParams = {
  score: string;
  correctCount: string;
  bestStreak: string;
  isNewHighScore: string;
  isPerfect: string;
};

/**
 * Get result message based on accuracy
 */
function getResultMessage(correctCount: number, isPerfect: boolean): string {
  if (isPerfect) return 'Perfect round!';
  const accuracy = (correctCount / QUESTION_COUNT) * 100;
  if (accuracy >= 90) return 'Incredible!';
  if (accuracy >= 70) return 'Great job!';
  if (accuracy >= 50) return 'Good effort!';
  return 'Keep practicing!';
}

export default function ResultsScreen() {
  const router = useRouter();
  const colors = Colors.light;
  const { stats } = useStats();
  const { width } = useWindowDimensions();
  const confettiRef = useRef<ConfettiCannon>(null);

  const params = useLocalSearchParams<ResultsParams>();

  // Parse params with safe defaults
  const score = parseInt(params.score ?? '0', 10);
  const correctCount = parseInt(params.correctCount ?? '0', 10);
  const bestStreak = parseInt(params.bestStreak ?? '1', 10);
  const isPerfect = params.isPerfect === 'true';
  const isNewHighScore = params.isNewHighScore === 'true';

  // Save quiz history when results are displayed (once per mount)
  const historySaved = useRef(false);
  useEffect(() => {
    if (!historySaved.current && score > 0) {
      historySaved.current = true;
      saveQuizHistory({
        date: new Date().toISOString(),
        score,
        correct: correctCount,
        total: QUESTION_COUNT,
      });
    }
  }, [score, correctCount]);

  // Trigger confetti for perfect rounds
  useEffect(() => {
    if (isPerfect) {
      // Delay to let count-up animation finish
      const timeout = setTimeout(() => {
        confettiRef.current?.start();
      }, 1200); // After 1s count-up + 200ms buffer
      return () => clearTimeout(timeout);
    }
  }, [isPerfect]);

  const resultMessage = getResultMessage(correctCount, isPerfect);
  const accuracy = (correctCount / QUESTION_COUNT) * 100;
  const mascotMood = accuracy >= 70 || isPerfect ? 'happy' : 'neutral';

  // Mastery progress info
  const totalAnswered = stats?.totalAnswered ?? 0;
  const level = calculateLevel(totalAnswered);
  const questionsToNext = getQuestionsToNextLevel(totalAnswered);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Mascot */}
        <Animated.View
          entering={FadeInUp.delay(0).duration(Durations.normal).springify()}
        >
          <TriMascot mood={mascotMood} size="md" />
        </Animated.View>

        {/* Result Message */}
        <Animated.Text
          entering={FadeInUp.delay(Durations.stagger).duration(Durations.normal).springify()}
          style={[styles.message, { color: colors.text }]}
        >
          {resultMessage}
        </Animated.Text>

        {/* Score Display */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 2).duration(Durations.normal).springify()}
          style={styles.scoreSection}
        >
          <Text style={[styles.score, { color: colors.primary }]}>
            <CountUp
              isCounting
              start={0}
              end={score}
              duration={1}
              thousandsSeparator=","
            />
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>
            points
          </Text>
        </Animated.View>

        {/* New High Score Badge */}
        {isNewHighScore && (
          <Animated.View
            entering={FadeInUp.delay(Durations.stagger * 2.5).duration(Durations.normal).springify()}
          >
            <HighScoreBadge />
          </Animated.View>
        )}

        {/* Stats Row */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 3).duration(Durations.normal).springify()}
          style={styles.statsRow}
        >
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {correctCount}/{QUESTION_COUNT}
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
        </Animated.View>

        {/* Mastery Progress */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 4).duration(Durations.normal).springify()}
          style={[styles.masteryBadge, { backgroundColor: colors.primaryLight }]}
        >
          <Text style={[styles.masteryText, { color: colors.primary }]}>
            {questionsToNext > 0
              ? `+${QUESTION_COUNT} questions toward Level ${level + 1}`
              : `Level ${level} Master!`}
          </Text>
        </Animated.View>
      </View>

      {/* Buttons */}
      <Animated.View
        entering={FadeInUp.delay(Durations.stagger * 5).duration(Durations.normal).springify()}
        style={styles.buttons}
      >
        <Button label="Play Again" onPress={() => router.replace('/quiz')} />
        <Button
          label="Home"
          variant="secondary"
          onPress={() => router.replace('/(tabs)')}
        />
      </Animated.View>

      {/* Confetti for perfect rounds */}
      {isPerfect && (
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: width / 2, y: -10 }}
          fallSpeed={3500}
          fadeOut
          autoStart={false}
          colors={['#3B82F6', '#22C55E', '#FACC15', '#F97316', '#EC4899']}
        />
      )}
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
    gap: Spacing.lg,
  },
  message: {
    ...Typography.titleLarge,
    textAlign: 'center',
  },
  scoreSection: {
    alignItems: 'center',
  },
  score: {
    ...Typography.display,
    fontSize: 56,
  },
  scoreLabel: {
    ...Typography.caption,
    marginTop: -Spacing.xs,
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
  masteryBadge: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  masteryText: {
    ...Typography.footnote,
    fontWeight: '600',
  },
  buttons: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
});
