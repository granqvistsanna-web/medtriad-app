import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  FadeIn,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { CountUp } from 'use-count-up';
import ConfettiCannon from 'react-native-confetti-cannon';
import { CheckCircle, Fire, Cup } from '@solar-icons/react-native/Bold';

import { Text, Button, Icon } from '@/components/primitives';
import { HighScoreBadge } from '@/components/results/HighScoreBadge';
import { TierUpCelebration } from '@/components/results/TierUpCelebration';
import { ShareCard } from '@/components/share/ShareCard';
import { useStats } from '@/hooks/useStats';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useShareCard } from '@/hooks/useShareCard';
import { saveQuizHistory } from '@/services/stats-storage';
import { theme, Typography, Spacing, Radius, Durations, Easings } from '@/constants/theme';
import { QUESTION_COUNT } from '@/types/quiz-state';
import { getTierForLevel, TIERS } from '@/services/mastery';

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

/**
 * Animated glow effect behind the score
 */
function ScoreGlow({ isGoodScore, reduceMotion }: { isGoodScore: boolean; reduceMotion: boolean }) {
  const pulseValue = useSharedValue(0);

  useEffect(() => {
    if (isGoodScore && !reduceMotion) {
      pulseValue.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [isGoodScore, reduceMotion]);

  const glowStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseValue.value, [0, 1], [1, 1.15]);
    const opacity = interpolate(pulseValue.value, [0, 1], [0.4, 0.7]);
    return {
      transform: [{ scale }],
      opacity: isGoodScore ? opacity : 0.2,
    };
  });

  return (
    <Animated.View style={[styles.scoreGlow, glowStyle]}>
      <LinearGradient
        colors={[
          'rgba(139, 34, 82, 0.3)',
          'rgba(139, 34, 82, 0.1)',
          'transparent',
        ]}
        style={styles.glowGradient}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0.5, y: 1 }}
      />
    </Animated.View>
  );
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
  // Use || with fallback to handle empty strings and NaN from parseInt
  const score = parseInt(params.score || '0', 10) || 0;
  const correctCount = parseInt(params.correctCount || '0', 10) || 0;
  const bestStreak = parseInt(params.bestStreak || '1', 10) || 1;
  const isPerfect = params.isPerfect === 'true';
  const isNewHighScore = params.isNewHighScore === 'true';
  const tierUp = params.tierUp === 'true';
  const newTierName = params.newTierName ?? '';
  const newTierNumber = parseInt(params.newTierNumber || '0', 10) || 0;
  const oldTierNumber = newTierNumber > 1 ? newTierNumber - 1 : 1;

  // Track celebration completion
  const [celebrationComplete, setCelebrationComplete] = useState(!tierUp);

  // Save quiz history when results are displayed (once per mount)
  // ERR-05: Fire-and-forget save - don't retry on failure to avoid repeated I/O
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
  // Hide result message during tier-up celebration (TierUpCelebration shows its own)
  const resultMessage = tierUp && !celebrationComplete
    ? ''
    : getResultMessage(correctCount, isPerfect);

  // Calculate progress to next tier for encouragement
  const progressToNextTier = nextTier && stats
    ? Math.round((((stats.totalCorrect ?? 0) % 50) / 50) * 100)
    : 100;

  // Determine if this is a "good" score for celebratory effects
  const isGoodScore = accuracy >= 70 || isPerfect;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
      {/* Subtle background gradient for premium feel */}
      <LinearGradient
        colors={[
          theme.colors.surface.primary,
          isGoodScore ? 'rgba(139, 34, 82, 0.03)' : theme.colors.surface.primary,
          theme.colors.surface.primary,
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      <View style={styles.content}>
        {/* Tier-Up Celebration - Full screen overlay when active */}
        {tierUp && !celebrationComplete ? (
          <View style={styles.celebrationOverlay}>
            <TierUpCelebration
              oldTier={oldTierNumber}
              newTier={newTierNumber}
              newTierName={newTierName}
              onComplete={async () => {
                await clearPendingTierUp();
                setCelebrationComplete(true);
              }}
            />
          </View>
        ) : (
          <View style={styles.resultsContent}>
            {/* Result Message - larger and bolder for good scores */}
            {resultMessage ? (
              <Animated.View
                entering={FadeInUp.delay(Durations.staggerMedium).duration(Durations.normal).springify()}
              >
                <Text
                  variant={isGoodScore ? 'title' : 'titleLarge'}
                  align="center"
                  color={isGoodScore ? theme.colors.brand.primary : undefined}
                >
                  {resultMessage}
                </Text>
              </Animated.View>
            ) : null}

            {/* Score Display with glow effect */}
            <Animated.View
              entering={FadeInUp.delay(Durations.staggerMedium * 2).duration(Durations.normal).springify()}
              style={[styles.scoreSection, scoreAnimatedStyle]}
            >
              <ScoreGlow isGoodScore={isGoodScore} reduceMotion={reduceMotion} />
              <Text variant="display" color={theme.colors.brand.primary} style={styles.score}>
                <CountUp
                  isCounting
                  start={0}
                  end={score}
                  duration={1}
                  thousandsSeparator=","
                />
              </Text>
              <Text variant="label" color="muted" style={styles.scoreLabel}>
                points
              </Text>
            </Animated.View>

            {/* New High Score Badge */}
            {isNewHighScore && (
              <Animated.View
                entering={ZoomIn.delay(Durations.staggerMedium * 3).springify().damping(12)}
              >
                <HighScoreBadge />
              </Animated.View>
            )}

            {/* Stats Row - Enhanced with 3D depth and icons */}
            <Animated.View
              entering={FadeInUp.delay(Durations.staggerMedium * 4).duration(Durations.normal).springify()}
              style={styles.statsRow}
            >
              <View style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.success.light,
                  borderColor: theme.colors.success.main,
                  borderBottomColor: theme.colors.success.dark,
                },
              ]}>
                <Icon icon={CheckCircle} size="sm" color={theme.colors.success.main} />
                <Text variant="heading" color={theme.colors.success.text}>
                  {correctCount}/{QUESTION_COUNT}
                </Text>
                <Text variant="footnote" color={theme.colors.success.text} style={{ opacity: 0.8 }}>
                  Correct
                </Text>
              </View>
              <View style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.streak.light,
                  borderColor: theme.colors.streak.main,
                  borderBottomColor: theme.colors.streak.dark,
                },
              ]}>
                <Icon icon={Fire} size="sm" color={theme.colors.streak.main} />
                <Text variant="heading" color={theme.colors.streak.text}>
                  {bestStreak}x
                </Text>
                <Text variant="footnote" color={theme.colors.streak.text} style={{ opacity: 0.8 }}>
                  Best Streak
                </Text>
              </View>
            </Animated.View>

            {/* Tier Badge - Enhanced with trophy icon */}
            <Animated.View
              entering={FadeInUp.delay(Durations.staggerMedium * 5).duration(Durations.normal).springify()}
              style={styles.tierSection}
            >
              <View style={[styles.tierBadge, { backgroundColor: theme.colors.surface.brand }]}>
                <Icon icon={Cup} size="xs" color={theme.colors.brand.primary} />
                <Text variant="label" color={theme.colors.brand.primary}>
                  {tier.name}
                </Text>
              </View>
              {nextTier && (
                <View style={styles.progressHint}>
                  <View style={[styles.progressBar, { backgroundColor: theme.colors.border.default }]}>
                    <Animated.View
                      entering={FadeIn.delay(Durations.staggerMedium * 6)}
                      style={[
                        styles.progressFill,
                        { width: `${progressToNextTier}%` },
                      ]}
                    >
                      <LinearGradient
                        colors={[theme.colors.brand.primary, theme.colors.brand.primaryDark]}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </Animated.View>
                  </View>
                  <Text variant="footnote" color="muted">
                    {progressToNextTier}% to {nextTier.name}
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>
        )}
      </View>

      {/* Buttons - hidden during celebration */}
      {celebrationComplete || !tierUp ? (
        <Animated.View
          entering={FadeInUp.delay(Durations.staggerMedium * 6).duration(Durations.normal).springify()}
          style={styles.buttons}
        >
          <Button label="Play Again" onPress={() => router.replace('/quiz')} />
          <View style={styles.secondaryButtons}>
            <Button
              label={isSharing ? 'Sharing...' : 'Challenge'}
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
      ) : null}

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
    paddingHorizontal: Spacing.lg,
  },
  resultsContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  celebrationOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scoreSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  score: {
    fontSize: 72,
    lineHeight: 80,
    fontWeight: '800' as const,
    letterSpacing: -2,
  },
  scoreLabel: {
    marginTop: -Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  statCard: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    minWidth: 110,
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  tierSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  progressHint: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  progressBar: {
    width: 140,
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    overflow: 'hidden',
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
