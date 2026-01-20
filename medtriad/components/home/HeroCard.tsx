import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { TriMascot, MascotMood } from './TriMascot';
import { ProgressRing } from './ProgressRing';
import { TierDefinition } from '@/services/mastery';
import { theme, Radius, Spacing, Durations, Easings } from '@/constants/theme';
import { Text } from '@/components/primitives';

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
  onStartQuiz?: () => void;
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

  if (pointsToNextTier < 0 || isNaN(pointsToNextTier)) {
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
  onStartQuiz,
  showTierUpGlow = false,
}: HeroCardProps) {
  const mascotMood = showTierUpGlow
    ? 'tierUp'
    : getMascotMood(isNewUser, accuracy, dailyStreak);

  const progressMessage = getProgressMessage(nextTier, pointsToNextTier);

  // Button animation
  const buttonScale = useSharedValue(1);
  const buttonBorderBottom = useSharedValue(4);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    borderBottomWidth: buttonBorderBottom.value,
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.98, Easings.press);
    buttonBorderBottom.value = withSpring(2, Easings.press);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, Easings.press);
    buttonBorderBottom.value = withSpring(4, Easings.press);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.card}
    >
      {/* Mascot with progress ring */}
      <View style={styles.mascotContainer}>
        <ProgressRing size={140} strokeWidth={8} progress={tierProgress}>
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
        <Text variant="heading" color="primary" weight="bold" style={styles.tierName}>
          {tier.name} - Lvl {tier.tier}
        </Text>
      </Animated.View>

      {/* Progress message */}
      <Animated.View
        entering={FadeInUp.delay(delay + Durations.stagger * 1.5).duration(Durations.normal).springify()}
      >
        <Text variant="caption" color="brand" weight="semibold" style={styles.progressMessage}>
          {progressMessage.points && (
            <Text variant="caption" color="brand" weight="bold">{progressMessage.points} </Text>
          )}
          {progressMessage.rest}
        </Text>
      </Animated.View>

      {/* Start Quiz button inside card - keeping custom for shine animation */}
      <Animated.View
        entering={FadeInUp.delay(delay + Durations.stagger * 2).duration(Durations.normal).springify()}
        style={styles.buttonContainer}
      >
        <AnimatedPressable
          onPress={onStartQuiz}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.startButton, buttonAnimatedStyle]}
        >
          <Text variant="label" color="inverse" weight="bold" style={styles.startButtonText}>
            START QUIZ
          </Text>
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
    paddingHorizontal: Spacing.xl,
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
    marginBottom: Spacing.xs,
  },
  tierName: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  progressMessage: {
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    width: '100%',
  },
  startButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
    borderBottomColor: theme.colors.brand.primaryDark,
  },
  startButtonText: {
    letterSpacing: 1,
  },
});
