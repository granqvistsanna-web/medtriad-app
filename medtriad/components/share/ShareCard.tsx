import { StyleSheet, View, Image } from 'react-native';
import { Text } from '@/components/primitives';
import { theme, Spacing, Radius } from '@/constants/theme';
import { QUESTION_COUNT } from '@/types/quiz-state';

const triShare = require('@/assets/images/tri-share.png');

type ShareCardProps = {
  score: number;
  correctCount?: number;
  totalQuestions?: number;
  variant?: 'share' | 'challenge' | 'highscore';
};

/**
 * Get performance headline based on accuracy
 */
function getHeadline(correctCount: number, total: number): string {
  const accuracy = (correctCount / total) * 100;
  if (accuracy === 100) return 'Perfect!';
  if (accuracy >= 90) return 'Incredible!';
  if (accuracy >= 70) return 'Great job!';
  if (accuracy >= 50) return 'Good effort!';
  return 'Keep practicing!';
}

/**
 * Get competitive challenge message based on accuracy
 */
function getChallengeMessage(correctCount: number, total: number): string {
  const accuracy = (correctCount / total) * 100;
  if (accuracy === 100) return 'Beat my perfect score!';
  if (accuracy >= 90) return 'Think you can beat this?';
  if (accuracy >= 70) return 'Challenge accepted?';
  if (accuracy >= 50) return 'Can you do better?';
  return "Let's see what you've got!";
}

/**
 * Get challenge message for high score sharing
 */
function getHighScoreMessage(score: number): string {
  if (score >= 10000) return 'Beat my high score!';
  if (score >= 5000) return 'Think you can top this?';
  if (score >= 1000) return 'Can you beat my score?';
  return 'Challenge me on MedTriads!';
}

/**
 * ShareCard - Visual card component for sharing quiz results
 *
 * Fixed dimensions for consistent image capture.
 * Uses solid background and collapsable={false} for reliable view-shot capture.
 */
export function ShareCard({ score, correctCount, totalQuestions, variant = 'share' }: ShareCardProps) {
  const isHighScore = variant === 'highscore';
  const headline = isHighScore ? 'My High Score' : getHeadline(correctCount!, totalQuestions!);
  const challengeMessage = isHighScore
    ? getHighScoreMessage(score)
    : variant === 'challenge'
      ? getChallengeMessage(correctCount!, totalQuestions!)
      : null;

  return (
    <View style={styles.card} collapsable={false}>
      {/* Performance Headline */}
      <Text variant="titleLarge" style={styles.headline}>
        {headline}
      </Text>

      {/* Challenge Message (when variant='challenge') */}
      {challengeMessage && (
        <Text variant="body" color={theme.colors.brand.primary} style={styles.challengeMessage}>
          {challengeMessage}
        </Text>
      )}

      {/* Mascot Hero */}
      <View style={styles.mascotContainer}>
        <Image source={triShare} style={styles.mascot} resizeMode="contain" />
      </View>

      {/* Score */}
      <Text variant="display" color={theme.colors.brand.primary} style={styles.score}>
        {score.toLocaleString()}
      </Text>

      {/* Correct Count (hidden for highscore variant) */}
      {!isHighScore && correctCount !== undefined && totalQuestions !== undefined && (
        <Text variant="body" color="secondary" style={styles.correctCount}>
          {correctCount}/{totalQuestions} correct
        </Text>
      )}

      {/* Branding Bar */}
      <View style={[styles.brandingBar, { backgroundColor: theme.colors.surface.brand }]}>
        <Text variant="label" color={theme.colors.brand.primary} weight="semibold">
          MedTriads
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    height: 450,
    backgroundColor: theme.colors.surface.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  headline: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  challengeMessage: {
    textAlign: 'center',
    marginBottom: Spacing.base,
    fontWeight: '600',
  },
  mascotContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  mascot: {
    width: 160,
    height: 160,
  },
  score: {
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -2,
    textAlign: 'center',
  },
  correctCount: {
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  brandingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
});
