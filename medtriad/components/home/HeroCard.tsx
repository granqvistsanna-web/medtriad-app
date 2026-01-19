import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { TriMascot, MascotMood } from './TriMascot';
import { ProgressRing } from './ProgressRing';
import { TierDefinition } from '@/services/mastery';
import { Colors, Typography, Radius, Spacing, Durations, Shadows } from '@/constants/theme';

type HeroCardProps = {
  isNewUser: boolean;
  accuracy: number;
  dailyStreak: number;
  lastPlayed?: Date | null;
  delay?: number;
  masteryLevel?: number;
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
): string {
  if (!nextTier) {
    return 'Max level reached!';
  }

  return `${pointsToNextTier.toLocaleString()} pts to ${nextTier.name}`;
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
  masteryLevel = 0,
  tier,
  tierProgress,
  nextTier,
  totalPoints = 0,
  pointsToNextTier = 0,
  onTierPress,
  showTierUpGlow = false,
}: HeroCardProps) {
  const colors = Colors.light;

  // Override mood to 'tierUp' for catch-up celebration glow
  const mascotMood = showTierUpGlow
    ? 'tierUp'
    : getMascotMood(isNewUser, accuracy, dailyStreak);

  const progressMessage = getProgressMessage(nextTier, pointsToNextTier);

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}
    >
        {/* Progress Ring with Mascot inside */}
        <View style={styles.ringContainer}>
          <ProgressRing
            size={164}
            strokeWidth={12}
            progress={tierProgress}
          >
            <TriMascot
              mood={mascotMood}
              size="md"
              masteryLevel={masteryLevel}
              tier={tier.tier}
              context="home"
            />
          </ProgressRing>

          {/* Progress percentage badge */}
          <Animated.View
            entering={FadeInUp.delay(delay + 300).duration(Durations.normal)}
            style={styles.percentBadge}
          >
            <Text style={styles.percentText}>
              {Math.round(tierProgress * 100)}%
            </Text>
          </Animated.View>
        </View>

        {/* Tier name */}
        <Animated.View
          entering={FadeInUp.delay(delay + Durations.stagger).duration(Durations.normal).springify()}
          style={styles.tierContainer}
        >
          <Text style={[styles.tierName, { color: colors.text }]}>
            {tier.name}
          </Text>
        </Animated.View>

        {/* Progress message */}
        <Animated.View
          entering={FadeInUp.delay(delay + Durations.stagger * 1.5).duration(Durations.normal).springify()}
        >
          <Text style={[styles.progressMessage, { color: colors.primary }]}>
            <Text style={styles.progressHighlight}>{progressMessage.split(' ')[0]} </Text>
            {progressMessage.split(' ').slice(1).join(' ')}
          </Text>
        </Animated.View>

        {/* Stat pills */}
        <Animated.View
          entering={FadeInUp.delay(delay + Durations.stagger * 2).duration(Durations.normal).springify()}
          style={styles.statPills}
        >
          {/* Streak pill - show encouragement when 0, otherwise show count */}
          <View style={[styles.pill, styles.streakPill]}>
            <Text style={styles.pillIcon}>🔥</Text>
            <Text style={styles.streakText}>
              {dailyStreak === 0 ? 'Start a streak!' : `${dailyStreak} day${dailyStreak !== 1 ? 's' : ''}`}
            </Text>
          </View>

          {/* Accuracy pill */}
          <View style={[styles.pill, styles.accuracyPill]}>
            <Text style={styles.pillIcon}>🎯</Text>
            <Text style={styles.accuracyText}>
              {Math.round(accuracy)}%
            </Text>
          </View>
        </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderBottomWidth: 4,
    borderBottomColor: Colors.light.borderStrong,
    ...Shadows.light.sm,
  },
  ringContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  percentBadge: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: [{ translateX: -24 }],
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  percentText: {
    color: Colors.light.textInverse,
    ...Typography.tiny,
    fontWeight: '700',
  },
  tierContainer: {
    marginBottom: Spacing.xs,
  },
  tierName: {
    ...Typography.heading,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  progressMessage: {
    ...Typography.caption,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  progressHighlight: {
    fontWeight: '700',
  },
  statPills: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
  },
  streakPill: {
    backgroundColor: '#FFEDD5',
  },
  streakText: {
    color: '#C2410C',
    ...Typography.footnote,
    fontWeight: '600',
  },
  pillIcon: {
    fontSize: 14,
  },
  accuracyPill: {
    backgroundColor: '#CCFBF1',
  },
  accuracyText: {
    color: '#0F766E',
    ...Typography.footnote,
    fontWeight: '600',
  },
});
