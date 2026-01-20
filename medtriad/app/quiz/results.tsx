import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { CountUp } from 'use-count-up';
import ConfettiCannon from 'react-native-confetti-cannon';

import { Text, Button } from '@/components/primitives';
import { TriMascot } from '@/components/home/TriMascot';
import { HighScoreBadge } from '@/components/results/HighScoreBadge';
import { TierUpCelebration } from '@/components/results/TierUpCelebration';
import { ShareCard } from '@/components/share/ShareCard';
import { useStats } from '@/hooks/useStats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useShareCard } from '@/hooks/useShareCard';
import { saveQuizHistory } from '@/services/stats-storage';
import { theme, Typography, Spacing, Radius, Durations, Easings } from '@/constants/theme';
import { QUESTION_COUNT } from '@/types/quiz-state';

type ResultsParams = {
  score: string;
  correctCount: string;
  bestStreak: string;
  isNewHighScore: string;
  isPerfect: string;
  tierUp: string;
  newTierName: string;
  newTierNumber: string;
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
  const { stats, tier, nextTier, clearPendingTierUp } = useStats();
  const { width } = useWindowDimensions();
  const confettiRef = useRef<ConfettiCannon>(null);
  const reduceMotion = useReducedMotion();
  const { cardRef, share, isSharing } = useShareCard();

  const params = useLocalSearchParams<ResultsParams>();

  // Parse params with safe defaults
  const score = parseInt(params.score ?? '0', 10);
  const correctCount = parseInt(params.correctCount ?? '0', 10);
  const bestStreak = parseInt(params.bestStreak ?? '1', 10);
  const isPerfect = params.isPerfect === 'true';
  const isNewHighScore = params.isNewHighScore === 'true';
  const tierUp = params.tierUp === 'true';
  const newTierName = params.newTierName ?? '';
  const newTierNumber = parseInt(params.newTierNumber ?? '0', 10);
  const oldTierNumber = newTierNumber > 1 ? newTierNumber - 1 : 1;

  // Track celebration completion
  const [celebrationComplete, setCelebrationComplete] = useState(!tierUp);

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
      }).catch(() => {
        // Reset flag so save can be retried on next render
        historySaved.current = false;
      });
    }
  }, [score, correctCount]);

  // Trigger confetti for perfect rounds (only if not showing tier-up celebration)
  // Skip confetti for users with reduced motion preference
  useEffect(() => {
    if (isPerfect && !tierUp && !reduceMotion) {
      // Delay to let count-up animation finish
      const timeout = setTimeout(() => {
        confettiRef.current?.start();
      }, 1200); // After 1s count-up + 200ms buffer
      return () => clearTimeout(timeout);
    }
  }, [isPerfect, tierUp, reduceMotion]);

  // Score settle animation after count-up completes
  const scoreScale = useSharedValue(1);

  useEffect(() => {
    // CountUp takes 1 second, add small buffer
    const timeout = setTimeout(() => {
      scoreScale.value = withSequence(
        withSpring(1.08, Easings.pop),    // Slight overshoot
        withSpring(1, Easings.gentle)     // Settle
      );
    }, 1100);
    return () => clearTimeout(timeout);
  }, []);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const accuracy = (correctCount / QUESTION_COUNT) * 100;
  const mascotMood = accuracy >= 70 || isPerfect ? 'happy' : 'neutral';
  // Hide result message during tier-up celebration (TierUpCelebration shows its own)
  const resultMessage = tierUp && !celebrationComplete
    ? ''
    : getResultMessage(correctCount, isPerfect);


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
      <View style={styles.content}>
        {/* Mascot or Tier-Up Celebration */}
        <Animated.View
          entering={FadeInUp.delay(0).duration(Durations.normal).springify()}
        >
          {tierUp && !celebrationComplete ? (
            <TierUpCelebration
              oldTier={oldTierNumber}
              newTier={newTierNumber}
              newTierName={newTierName}
              onComplete={async () => {
                await clearPendingTierUp();
                setCelebrationComplete(true);
              }}
            />
          ) : (
            <TriMascot mood={mascotMood} size="md" tier={tier.tier} context="results" />
          )}
        </Animated.View>

        {/* Result Message */}
        {resultMessage ? (
          <Animated.View
            entering={FadeInUp.delay(Durations.staggerMedium).duration(Durations.normal).springify()}
          >
            <Text variant="titleLarge" align="center">
              {resultMessage}
            </Text>
          </Animated.View>
        ) : null}

        {/* Score Display */}
        <Animated.View
          entering={FadeInUp.delay(Durations.staggerMedium * 2).duration(Durations.normal).springify()}
          style={[styles.scoreSection, scoreAnimatedStyle]}
        >
          <Text variant="display" color={theme.colors.brand.primary} style={styles.score}>
            <CountUp
              isCounting
              start={0}
              end={score}
              duration={1}
              thousandsSeparator=","
            />
          </Text>
          <Text variant="caption" color="muted" style={styles.scoreLabel}>
            points
          </Text>
        </Animated.View>

        {/* New High Score Badge */}
        {isNewHighScore && (
          <Animated.View
            entering={FadeInUp.delay(Durations.staggerMedium * 3).duration(Durations.normal).springify()}
          >
            <HighScoreBadge />
          </Animated.View>
        )}

        {/* Stats Row */}
        <Animated.View
          entering={FadeInUp.delay(Durations.staggerMedium * 4).duration(Durations.normal).springify()}
          style={styles.statsRow}
        >
          <View style={styles.stat}>
            <Text variant="heading">
              {correctCount}/{QUESTION_COUNT}
            </Text>
            <Text variant="footnote" color="muted">
              Correct
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border.default }]} />
          <View style={styles.stat}>
            <Text variant="heading">
              {bestStreak}x
            </Text>
            <Text variant="footnote" color="muted">
              Best Streak
            </Text>
          </View>
        </Animated.View>

        {/* Tier Badge */}
        <Animated.View
          entering={FadeInUp.delay(Durations.staggerMedium * 5).duration(Durations.normal).springify()}
          style={[styles.masteryBadge, { backgroundColor: theme.colors.surface.brand }]}
        >
          <Text variant="footnote" color={theme.colors.brand.primary} weight="semibold">
            {nextTier ? `Playing as ${tier.name}` : tier.name}
          </Text>
        </Animated.View>
      </View>

      {/* Buttons */}
      <Animated.View
        entering={FadeInUp.delay(Durations.staggerMedium * 6).duration(Durations.normal).springify()}
        style={styles.buttons}
      >
        <Button label="Play Again" onPress={() => router.replace('/quiz')} />
        <View style={styles.secondaryButtons}>
          <Button
            label={isSharing ? 'Challenging...' : 'Challenge a Friend'}
            variant="outline"
            onPress={() => share('Challenge a Friend')}
            disabled={isSharing}
            fullWidth={false}
            style={styles.secondaryButton}
          />
          <Button
            label="Home"
            variant="outline"
            onPress={() => router.replace('/(tabs)')}
            fullWidth={false}
            style={styles.secondaryButton}
          />
        </View>
      </Animated.View>

      {/* Hidden share card for capture */}
      <View style={styles.offscreen}>
        <View ref={cardRef} collapsable={false}>
          <ShareCard
            score={score}
            correctCount={correctCount}
            totalQuestions={QUESTION_COUNT}
            variant="challenge"
          />
        </View>
      </View>

      {/* Confetti for perfect rounds (skip for reduced motion users) */}
      {isPerfect && !reduceMotion && (
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: width / 2, y: -10 }}
          fallSpeed={3500}
          fadeOut
          autoStart={false}
          colors={[
            theme.colors.brand.primary,
            theme.colors.success.main,
            theme.colors.gold.main,
            theme.colors.brand.accent,
            theme.colors.streak.main,
          ]}
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
  scoreSection: {
    alignItems: 'center',
  },
  score: {
    fontSize: 56,
  },
  scoreLabel: {
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
  divider: {
    width: 1,
    height: 40,
  },
  masteryBadge: {
    paddingHorizontal: Spacing.base,
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
  secondaryButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
  },
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
});
