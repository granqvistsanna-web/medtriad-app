import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import { CheckCircle, Fire, CalendarMark, Shield } from '@solar-icons/react-native/Bold';

import { Text, Button, Icon } from '@/components/primitives';
import { useDailyChallenge } from '@/hooks/useDailyChallenge';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DailyChallengeType } from '@/types/daily-challenge';
import { theme, Typography, Spacing, Radius, Durations, Easings } from '@/constants/theme';

type ResultsParams = {
  score: string;
  correctCount: string;
  total: string;
  challengeType: DailyChallengeType;
  categoryName?: string;
};

/**
 * Streak Milestone Celebration Component
 */
function StreakMilestoneCelebration({
  milestone,
  onComplete,
}: {
  milestone: number;
  onComplete?: () => void;
}) {
  const { width } = useWindowDimensions();
  const confettiRef = useRef<ConfettiCannon>(null);
  const reduceMotion = useReducedMotion();
  const [canDismiss, setCanDismiss] = useState(false);

  // Animation values
  const fireScale = useSharedValue(0);
  const messageOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  const triggerConfetti = () => {
    if (!reduceMotion) {
      confettiRef.current?.start();
    }
  };

  const enableDismiss = () => {
    setCanDismiss(true);
    buttonOpacity.value = withDelay(400, withSpring(1, Easings.gentle));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerConfetti();

      if (reduceMotion) {
        // Simple fade for reduced motion
        fireScale.value = withTiming(1, { duration: 200 });
        messageOpacity.value = withTiming(1, { duration: 200 });
        runOnJS(enableDismiss)();
      } else {
        // Bouncy entrance
        fireScale.value = withSpring(1, Easings.bouncy);
        messageOpacity.value = withDelay(200, withSpring(1, Easings.gentle));
        setTimeout(() => {
          runOnJS(enableDismiss)();
        }, 800);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [milestone, reduceMotion]);

  const handleDismiss = () => {
    if (canDismiss) {
      onComplete?.();
    }
  };

  const fireAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  const messageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  // Milestone-specific messages
  const getMessage = () => {
    if (milestone === 7) return 'One Week Streak!';
    if (milestone === 30) return 'One Month Streak!';
    if (milestone === 100) return '100 Day Streak!';
    return 'Streak Milestone!';
  };

  const getSubMessage = () => {
    if (milestone === 7) return 'Seven days in a row!';
    if (milestone === 30) return 'Thirty days of dedication!';
    if (milestone === 100) return 'Incredible commitment!';
    return 'Keep up the great work!';
  };

  return (
    <View style={styles.celebrationContainer}>
      {/* Confetti */}
      <View style={styles.confettiWrapper} pointerEvents="none">
        <ConfettiCannon
          ref={confettiRef}
          count={milestone === 100 ? 300 : 200}
          origin={{ x: width / 2, y: -10 }}
          fallSpeed={3000}
          fadeOut
          autoStart={false}
          colors={[
            theme.colors.streak.main,
            theme.colors.brand.primary,
            theme.colors.gold.main,
            theme.colors.success.main,
            theme.colors.brand.accent,
          ]}
        />
      </View>

      {/* Content */}
      <View style={styles.celebrationContent}>
        {/* Giant fire icon */}
        <Animated.View style={[styles.fireIconWrapper, fireAnimatedStyle]}>
          <View
            style={[
              styles.fireIconBackground,
              { backgroundColor: theme.colors.streak.light },
            ]}
          >
            <Icon icon={Fire} size="xxl" color={theme.colors.streak.main} />
          </View>
        </Animated.View>

        {/* Message */}
        <Animated.View style={[styles.celebrationMessage, messageAnimatedStyle]}>
          <Text variant="display" color={theme.colors.streak.main} style={styles.milestoneText}>
            {getMessage()}
          </Text>
          <Text variant="heading" color="muted" style={styles.milestoneSubtext}>
            {getSubMessage()}
          </Text>
        </Animated.View>
      </View>

      {/* Continue button */}
      {canDismiss && (
        <Animated.View style={[styles.celebrationButtonContainer, buttonAnimatedStyle]}>
          <Button label="Continue" onPress={handleDismiss} />
        </Animated.View>
      )}
    </View>
  );
}

export default function DailyChallengeResultsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const confettiRef = useRef<ConfettiCannon>(null);
  const reduceMotion = useReducedMotion();
  const { complete } = useDailyChallenge();

  const params = useLocalSearchParams<ResultsParams>();

  // Parse params
  const score = parseInt(params.score || '0', 10) || 0;
  const correctCount = parseInt(params.correctCount || '0', 10) || 0;
  const total = parseInt(params.total || '10', 10) || 10;
  const challengeType = params.challengeType ?? 'full';
  const categoryName = params.categoryName ?? '';

  // Track completion result
  const [completionResult, setCompletionResult] = useState<{
    newStreak: number;
    earnedStreakFreeze: boolean;
    streakMilestone: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Track milestone celebration
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [celebrationComplete, setCelebrationComplete] = useState(false);

  // Complete the daily challenge on mount
  useEffect(() => {
    let mounted = true;

    const completeChallenge = async () => {
      try {
        const result = await complete();
        if (mounted) {
          setCompletionResult(result);
          // Show milestone celebration if there is one
          if (result.streakMilestone) {
            setShowMilestoneCelebration(true);
          } else {
            setCelebrationComplete(true);
          }
        }
      } catch (error) {
        console.error('Failed to complete daily challenge:', error);
        // Still show results even if completion failed
        if (mounted) {
          setCompletionResult({
            newStreak: 0,
            earnedStreakFreeze: false,
            streakMilestone: null,
          });
          setCelebrationComplete(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    completeChallenge();

    return () => {
      mounted = false;
    };
  }, [complete]);

  // Trigger confetti for good performance (not during milestone celebration)
  useEffect(() => {
    const accuracy = (correctCount / total) * 100;
    if (accuracy >= 80 && celebrationComplete && !showMilestoneCelebration && !reduceMotion) {
      const timeout = setTimeout(() => {
        confettiRef.current?.start();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [correctCount, total, celebrationComplete, showMilestoneCelebration, reduceMotion]);

  // Get challenge display name
  const getChallengeDisplayName = () => {
    if (challengeType === 'speed') return 'Speed Round';
    if (challengeType === 'category') return `${categoryName} Focus`;
    return 'Daily Challenge';
  };

  // Get challenge badge color
  const getChallengeBadgeColor = () => {
    if (challengeType === 'speed') {
      return {
        bg: theme.colors.streak.light,
        text: theme.colors.streak.main,
      };
    }
    return {
      bg: theme.colors.surface.brand,
      text: theme.colors.brand.primary,
    };
  };

  const accuracy = (correctCount / total) * 100;
  const badgeColor = getChallengeBadgeColor();

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
        <View style={styles.centerContent}>
          <Text variant="body" color="muted">Recording completion...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show milestone celebration overlay
  if (showMilestoneCelebration && completionResult?.streakMilestone && !celebrationComplete) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
        <StreakMilestoneCelebration
          milestone={completionResult.streakMilestone}
          onComplete={() => {
            setShowMilestoneCelebration(false);
            setCelebrationComplete(true);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
      {/* Subtle background gradient */}
      <LinearGradient
        colors={[
          theme.colors.surface.primary,
          accuracy >= 70 ? 'rgba(139, 34, 82, 0.03)' : theme.colors.surface.primary,
          theme.colors.surface.primary,
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      <View style={styles.content}>
        <View style={styles.resultsContent}>
          {/* Challenge type badge */}
          <Animated.View
            entering={FadeInUp.delay(Durations.staggerMedium).duration(Durations.normal).springify()}
          >
            <View style={[styles.challengeBadge, { backgroundColor: badgeColor.bg }]}>
              <Icon icon={CalendarMark} size="xs" color={badgeColor.text} />
              <Text variant="label" color={badgeColor.text}>
                {getChallengeDisplayName()}
              </Text>
            </View>
          </Animated.View>

          {/* Result message */}
          <Animated.View
            entering={FadeInUp.delay(Durations.staggerMedium * 2).duration(Durations.normal).springify()}
          >
            <Text variant="title" align="center" color={accuracy >= 80 ? theme.colors.brand.primary : undefined}>
              {accuracy >= 90 ? 'Excellent!' : accuracy >= 70 ? 'Great job!' : 'Challenge complete!'}
            </Text>
          </Animated.View>

          {/* Score display */}
          <Animated.View
            entering={FadeInUp.delay(Durations.staggerMedium * 3).duration(Durations.normal).springify()}
            style={styles.scoreSection}
          >
            <View style={[
              styles.statCard,
              {
                backgroundColor: theme.colors.success.light,
                borderColor: theme.colors.success.main,
                borderBottomColor: theme.colors.success.dark,
              },
            ]}>
              <Icon icon={CheckCircle} size="md" color={theme.colors.success.main} />
              <Text variant="display" color={theme.colors.success.text}>
                {correctCount}/{total}
              </Text>
              <Text variant="footnote" color={theme.colors.success.text} style={{ opacity: 0.8 }}>
                Correct
              </Text>
            </View>
          </Animated.View>

          {/* Streak section */}
          {completionResult && (
            <Animated.View
              entering={FadeInUp.delay(Durations.staggerMedium * 4).duration(Durations.normal).springify()}
              style={styles.streakSection}
            >
              <View style={[
                styles.streakCard,
                {
                  backgroundColor: theme.colors.streak.light,
                  borderColor: theme.colors.streak.main,
                },
              ]}>
                <Icon icon={Fire} size="lg" color={theme.colors.streak.main} />
                <Text variant="heading" color={theme.colors.streak.text}>
                  {completionResult.newStreak} Day Streak!
                </Text>
                <Text variant="footnote" color={theme.colors.streak.text} style={{ opacity: 0.8 }}>
                  Keep it going!
                </Text>
              </View>

              {/* Streak Freeze Earned */}
              {completionResult.earnedStreakFreeze && (
                <Animated.View
                  entering={ZoomIn.delay(Durations.staggerMedium * 5).springify().damping(12)}
                  style={[
                    styles.freezeBadge,
                    {
                      backgroundColor: theme.colors.surface.brand,
                      borderColor: theme.colors.brand.primary,
                    },
                  ]}
                >
                  <Icon icon={Shield} size="sm" color={theme.colors.brand.primary} />
                  <View style={styles.freezeText}>
                    <Text variant="label" color={theme.colors.brand.primary} weight="bold">
                      Streak Freeze Earned!
                    </Text>
                    <Text variant="footnote" color={theme.colors.brand.primary} style={{ opacity: 0.8 }}>
                      Miss a day without losing your streak
                    </Text>
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </View>
      </View>

      {/* Buttons */}
      <Animated.View
        entering={FadeInUp.delay(Durations.staggerMedium * 6).duration(Durations.normal).springify()}
        style={styles.buttons}
      >
        <Button
          label="Back to Home"
          onPress={() => router.replace('/(tabs)')}
        />
      </Animated.View>

      {/* Confetti for good performance */}
      {accuracy >= 80 && !reduceMotion && (
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  challengeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  scoreSection: {
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  statCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    minWidth: 160,
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  streakSection: {
    alignItems: 'center',
    gap: Spacing.base,
    marginTop: Spacing.base,
    width: '100%',
  },
  streakCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 2,
  },
  freezeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 2,
  },
  freezeText: {
    flex: 1,
    gap: Spacing.xs,
  },
  buttons: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  // Celebration styles
  celebrationContainer: {
    flex: 1,
  },
  confettiWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  celebrationContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  fireIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireIconBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationMessage: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  milestoneText: {
    fontSize: 36,
  },
  milestoneSubtext: {
    marginTop: Spacing.xs,
  },
  celebrationButtonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
