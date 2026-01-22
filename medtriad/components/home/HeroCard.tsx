import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { Star, Fire } from '@solar-icons/react-native/Bold';
import { TriMascot, MascotMood } from './TriMascot';
import { ProgressRing } from './ProgressRing';
import { TierDefinition } from '@/services/mastery';
import { theme, Radius, Spacing, Durations, Easings } from '@/constants/theme';
import { Text, Badge } from '@/components/primitives';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  onXPPress?: () => void;
  onStreakPress?: () => void;
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
    rest: `to ${nextTier.name} • Lvl ${nextTier.tier}`,
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
  onXPPress,
  onStreakPress,
}: HeroCardProps) {
  const mascotMood = showTierUpGlow
    ? 'tierUp'
    : getMascotMood(isNewUser, accuracy, dailyStreak);

  const progressMessage = getProgressMessage(nextTier, pointsToNextTier);

  // Animation for XP badge press
  const xpScale = useSharedValue(1);
  const xpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xpScale.value }],
  }));

  // Animation for Streak badge press
  const streakScale = useSharedValue(1);
  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  const handleXPPressIn = () => {
    xpScale.value = withSpring(0.95, Easings.press);
  };

  const handleXPPressOut = () => {
    xpScale.value = withSpring(1, Easings.press);
  };

  const handleStreakPressIn = () => {
    streakScale.value = withSpring(0.95, Easings.press);
  };

  const handleStreakPressOut = () => {
    streakScale.value = withSpring(1, Easings.press);
  };

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

      {/* Progress message - subtle hint */}
      <Animated.View
        entering={FadeInUp.delay(delay + Durations.stagger * 1.5).duration(Durations.normal).springify()}
      >
        <Text variant="footnote" color="secondary" weight="regular" style={styles.progressMessage}>
          {progressMessage.points && (
            <Text variant="footnote" color="secondary" weight="regular">{progressMessage.points} </Text>
          )}
          {progressMessage.rest}
        </Text>
      </Animated.View>

      {/* XP and Streak badges - centered */}
      <Animated.View
        entering={FadeInUp.delay(delay + Durations.stagger * 2).duration(Durations.normal).springify()}
        style={styles.badgesContainer}
      >
        <AnimatedPressable
          onPress={onXPPress}
          onPressIn={handleXPPressIn}
          onPressOut={handleXPPressOut}
          style={xpAnimatedStyle}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${totalPoints.toLocaleString()} points`}
          accessibilityHint="Tap to view progress details"
        >
          <Badge
            label={totalPoints.toLocaleString()}
            icon={Star}
            variant="gold"
            size="md"
          />
        </AnimatedPressable>
        <AnimatedPressable
          onPress={onStreakPress}
          onPressIn={handleStreakPressIn}
          onPressOut={handleStreakPressOut}
          style={streakAnimatedStyle}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${dailyStreak} day streak`}
          accessibilityHint="Tap to view streak details"
        >
          <Badge
            label={dailyStreak.toString()}
            icon={Fire}
            variant="streak"
            size="md"
          />
        </AnimatedPressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: Radius.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.border.strong,
    backgroundColor: theme.colors.surface.card,
  },
  mascotContainer: {
    marginBottom: Spacing.md,
  },
  tierContainer: {
    marginBottom: 2,
  },
  tierName: {
    fontSize: 26,
    letterSpacing: -0.6,
  },
  progressMessage: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: `${theme.colors.border.default}18`,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
});
