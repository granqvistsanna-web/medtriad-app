import { StyleSheet, View, Image } from 'react-native';
import { Text } from '@/components/primitives';
import { theme, Spacing, Radius } from '@/constants/theme';

const triShare = require('@/assets/images/tri-share.png');

type ShareCardProps = {
  score: number;
  correctCount?: number;
  totalQuestions?: number;
  variant?: 'share' | 'challenge' | 'highscore';
  userName?: string | null;
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
 * Get competitive challenge message based on accuracy and name
 */
function getChallengeMessage(correctCount: number, total: number, userName?: string | null): string {
  const accuracy = (correctCount / total) * 100;
  const namePrefix = userName ? `${userName}'s challenge: ` : '';

  if (accuracy === 100) return `${namePrefix}Beat my perfect score!`;
  if (accuracy >= 90) return `${namePrefix}Think you can beat this?`;
  if (accuracy >= 70) return `${namePrefix}Challenge accepted?`;
  if (accuracy >= 50) return `${namePrefix}Can you do better?`;
  return `${namePrefix}Let's see what you've got!`;
}

/**
 * Get headline for high score sharing - competitive and score-aware
 */
function getHighScoreHeadline(score: number, userName?: string | null): string {
  if (userName) {
    if (score >= 10000) return `${userName}'s Record`;
    if (score >= 5000) return `${userName}'s Score`;
    return `${userName}'s Score`;
  }

  if (score >= 10000) return 'Triads Master';
  if (score >= 5000) return 'Triads Expert';
  if (score >= 1000) return 'Know Your Triads?';
  return 'Know Your Triads?';
}

/**
 * Get challenge message for high score sharing
 */
function getHighScoreMessage(score: number, userName?: string | null): string {
  const challengeIntro = userName ? '' : '';

  if (score >= 10000) return 'Think you can beat this?';
  if (score >= 5000) return 'Can you top my score?';
  if (score >= 1000) return 'Beat my high score!';
  return 'Can you beat my score?';
}

/**
 * ShareCard - Visual card component for sharing quiz results
 *
 * Fixed dimensions for consistent image capture.
 * Uses solid background and collapsable={false} for reliable view-shot capture.
 */
export function ShareCard({ score, correctCount, totalQuestions, variant = 'share', userName }: ShareCardProps) {
  const isHighScore = variant === 'highscore';

  // Safe headline computation - use defaults for missing values in non-highscore variants
  const safeCorrectCount = correctCount ?? 0;
  const safeTotalQuestions = totalQuestions ?? 1; // Avoid division by zero

  const headline = isHighScore
    ? getHighScoreHeadline(score, userName)
    : getHeadline(safeCorrectCount, safeTotalQuestions);

  const challengeMessage = isHighScore
    ? getHighScoreMessage(score, userName)
    : variant === 'challenge'
      ? getChallengeMessage(safeCorrectCount, safeTotalQuestions, userName)
      : null;

  return (
    <View style={styles.card} collapsable={false}>
      {/* Headline */}
      <Text variant="titleLarge" weight="bold" style={styles.headline}>
        {headline}
      </Text>

      {/* Mascot */}
      <View style={styles.mascotContainer}>
        <Image source={triShare} style={styles.mascot} resizeMode="contain" />
      </View>

      {/* Score - the hero */}
      <Text variant="display" color={theme.colors.brand.primary} style={styles.score}>
        {score.toLocaleString()}
      </Text>

      {/* Challenge Message - prominent call to action */}
      {challengeMessage && (
        <Text variant="heading" color={theme.colors.brand.primary} weight="semibold" style={styles.challengeMessage}>
          {challengeMessage}
        </Text>
      )}

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
    marginBottom: Spacing.sm,
  },
  mascotContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mascot: {
    width: 140,
    height: 140,
  },
  score: {
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: -2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  challengeMessage: {
    textAlign: 'center',
    marginBottom: Spacing.md,
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
