import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Star, Fire } from '@solar-icons/react-native/Bold';
import { TriMascot, MascotMood } from './TriMascot';
import { ProgressRing } from './ProgressRing';
import { TierDefinition } from '@/services/mastery';
import { theme, Radius, Spacing, Durations } from '@/constants/theme';
import { Text, Badge } from '@/components/primitives';

type HeroCardProps = {
  isNewUser: boolean;
  accuracy: number;
  dailyStreak: number;
  lastPlayed?: Date | null;
  delay?: number;
  tier: TierDefinition;
  tierProgress: number;
  nextTier?: TierDefinition | null;
  totalPoints?: number;
  pointsToNextTier?: number;
  onTierPress?: () => void;
  showTierUpGlow?: boolean;
};

/**
 * Get progress message based on tier state
 */
function getProgressMessage(
  nextTier: TierDefinition | null | undefined,
  pointsToNextTier: number
): { points: string; rest: string } {
  if (!nextTier) {
    return { points: '', rest: 'Max level reached!' };
  }

  if (pointsToNextTier === undefined || pointsToNextTier < 0 || isNaN(pointsToNextTier)) {
    return { points: '', rest: 'Keep going!' };
  }

  return {
    points: `${pointsToNextTier.toLocaleString()} pts`,
    rest: `to ${nextTier.name} - Lvl ${nextTier.tier}`,
  };
}

/**
 * Determine mascot mood based on user state
 */
function getMascotMood(
  isNewUser: boolean,
  accuracy: number,
  dailyStreak: number
): MascotMood {
  if (isNewUser) return 'neutral';
  if (dailyStreak >= 7) return 'streak';
  if (accuracy >= 70 || dailyStreak >= 3) return 'happy';
  return 'neutral';
}

export function HeroCard({
  isNewUser,
  accuracy,
  dailyStreak,
  lastPlayed,
  delay = 0,
  tier,
  tierProgress,
  nextTier,
  totalPoints = 0,
  pointsToNextTier = 0,
  onTierPress,
  showTierUpGlow = false,
}: HeroCardProps) {
  const mascotMood = showTierUpGlow
    ? 'tierUp'
    : getMascotMood(isNewUser, accuracy, dailyStreak);

  const progressMessage = getProgressMessage(nextTier, pointsToNextTier);

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.card}
    >
      {/* Mascot with progress ring */}
      <View style={styles.mascotContainer}>
        <ProgressRing size={140} strokeWidth={10} progress={tierProgress}>
          <TriMascot
            mood={mascotMood}
            size="md"
            tier={tier.tier}
            context="home"
          />
        </ProgressRing>
      </View>

      {/* Tier name with level */}
      <Animated.View
        entering={FadeInUp.delay(delay + Durations.stagger).duration(Durations.normal).springify()}
        style={styles.tierContainer}
      >
        <Text variant="heading" color="primary" weight="extrabold" style={styles.tierName}>
          {tier.name} • Lvl {tier.tier}
        </Text>
      </Animated.View>

      {/* Progress message */}
      <Animated.View
        entering={FadeInUp.delay(delay + Durations.stagger * 1.5).duration(Durations.normal).springify()}
      >
        <Text variant="footnote" color="brand" weight="semibold" style={styles.progressMessage}>
          {progressMessage.points && (
            <Text variant="footnote" color="brand" weight="bold">{progressMessage.points} </Text>
          )}
          {progressMessage.rest}
        </Text>
      </Animated.View>

      {/* XP and Streak badges - centered */}
      <Animated.View
        entering={FadeInUp.delay(delay + Durations.stagger * 2).duration(Durations.normal).springify()}
        style={styles.badgesContainer}
      >
        <Badge
          label={totalPoints.toLocaleString()}
          icon={Star}
          variant="gold"
          size="sm"
        />
        {dailyStreak > 0 && (
          <Badge
            label={dailyStreak.toString()}
            icon={Fire}
            variant="streak"
            size="sm"
          />
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: Radius.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.border.strong,
    backgroundColor: theme.colors.surface.card,
  },
  mascotContainer: {
    marginBottom: Spacing.lg,
  },
  tierContainer: {
    marginBottom: Spacing.xs,
  },
  tierName: {
    fontSize: 28,
    letterSpacing: -0.8,
  },
  progressMessage: {
    marginBottom: Spacing.sm,
    opacity: 0.85,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: `${theme.colors.border.default}15`,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
});
