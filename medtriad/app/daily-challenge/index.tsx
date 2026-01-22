import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useCallback, useRef } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Fire, CalendarMark } from '@solar-icons/react-native/Bold';

import { Text, Icon, Button } from '@/components/primitives';
import { FindingsCard } from '@/components/quiz/FindingsCard';
import { AnswerCard } from '@/components/quiz/AnswerCard';
import { TimerBar } from '@/components/quiz/TimerBar';
import { CancelButton } from '@/components/quiz/CancelButton';

import { useQuizReducer } from '@/hooks/use-quiz-reducer';
import { useCountdownTimer } from '@/hooks/use-countdown-timer';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { useDailyChallenge } from '@/hooks/useDailyChallenge';
import { getComboTier } from '@/services/scoring';
import { recordTriadAnswer } from '@/services/triad-performance-storage';

import { QuizOption, TriadCategory } from '@/types';
import { CategoryMasteryData } from '@/services/stats-storage';
import { theme, Typography, Spacing, Radius, Durations } from '@/constants/theme';
import { MascotMood } from '@/components/home/TriMascot';

/** Delay in ms before advancing to next question after answer */
const ANSWER_DELAY = 1200;

export default function DailyChallengeScreen() {
  const [state, dispatch] = useQuizReducer();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { playSound } = useSoundEffects();
  const { triggerHaptic } = useHaptics();

  // Daily challenge hook
  const { state: challengeState, loading, config, questions } = useDailyChallenge();

  // Track results for passing to results screen
  const correctCountRef = useRef(0);
  const categoryResultsRef = useRef<Record<TriadCategory, CategoryMasteryData>>({} as Record<TriadCategory, CategoryMasteryData>);

  const {
    status,
    questions: quizQuestions,
    currentIndex,
    score,
    combo,
    consecutiveCorrect,
    timeRemaining,
    questionTime,
    selectedOptionId,
  } = state;

  const currentQuestion = quizQuestions[currentIndex];

  // Initialize quiz when questions are loaded
  useEffect(() => {
    // Skip if already completed today
    if (challengeState?.completedToday) return;

    // Skip if still loading or no config/questions
    if (loading || !config || questions.length === 0) return;

    // Skip if quiz already started
    if (status !== 'idle') return;

    // Reset tracking refs
    correctCountRef.current = 0;
    categoryResultsRef.current = {} as Record<TriadCategory, CategoryMasteryData>;

    // Start quiz with daily challenge config
    dispatch({
      type: 'START_QUIZ',
      questions,
      questionTime: config.questionTime,
    });
  }, [dispatch, loading, config, questions, status, challengeState?.completedToday]);

  // Timer tick handler
  const handleTick = useCallback(() => {
    dispatch({ type: 'TICK_TIMER' });
  }, [dispatch]);

  // Run countdown timer when playing
  useCountdownTimer(status === 'playing', handleTick);

  // Auto-advance after answer
  useEffect(() => {
    if (status !== 'answered') return;

    // Handle timeout case - record as incorrect with full question time
    if (selectedOptionId === null) {
      recordTriadAnswer(
        currentQuestion.triad.id,
        false,
        state.questionTime * 1000
      ).catch((error) => {
        console.error('Failed to record triad performance:', error);
      });
    }

    const timeout = setTimeout(() => {
      if (currentIndex >= quizQuestions.length - 1) {
        // Quiz complete - navigate to daily challenge results
        router.replace({
          pathname: '/daily-challenge/results',
          params: {
            score: score.toString(),
            correctCount: correctCountRef.current.toString(),
            total: config?.questionCount.toString() ?? '10',
            challengeType: config?.type ?? 'full',
            categoryName: config?.category ?? '',
          },
        });
      } else {
        dispatch({ type: 'NEXT_QUESTION' });
      }
    }, ANSWER_DELAY);

    return () => clearTimeout(timeout);
  }, [status, currentIndex, quizQuestions.length, dispatch, router, score, config, selectedOptionId, currentQuestion, state.questionTime]);

  // Handle answer selection
  const handleAnswerSelect = async (option: QuizOption) => {
    triggerHaptic();

    dispatch({
      type: 'SELECT_ANSWER',
      optionId: option.id,
      isCorrect: option.isCorrect,
      timeRemaining: state.timeRemaining,
    });

    // Record triad performance (fire-and-forget)
    const triadId = currentQuestion.triad.id;
    const responseTimeMs = (state.questionTime - state.timeRemaining) * 1000;
    recordTriadAnswer(triadId, option.isCorrect, responseTimeMs).catch((error) => {
      console.error('Failed to record triad performance:', error);
    });

    // Track category result
    const category = currentQuestion.triad.category;
    const current = categoryResultsRef.current[category] ?? { correct: 0, total: 0 };
    categoryResultsRef.current[category] = {
      correct: current.correct + (option.isCorrect ? 1 : 0),
      total: current.total + 1,
    };

    // Play appropriate sound
    if (option.isCorrect) {
      playSound('correct');
      // Check for combo tier increase
      const currentTier = getComboTier(consecutiveCorrect);
      const newTier = getComboTier(consecutiveCorrect + 1);
      if (newTier > currentTier) {
        setTimeout(() => playSound('combo'), 150);
      }
      correctCountRef.current += 1;
    } else {
      playSound('incorrect');
    }
  };

  // Determine answer card state
  const getAnswerState = (option: QuizOption): 'default' | 'correct' | 'incorrect' | 'revealed' | 'faded' => {
    if (status !== 'answered') return 'default';

    if (option.id === selectedOptionId) {
      return option.isCorrect ? 'correct' : 'incorrect';
    }
    if (option.isCorrect) {
      return 'revealed';
    }
    return 'faded';
  };

  // Get mascot mood
  const getMascotMood = (): MascotMood => {
    if (status === 'answered') {
      const wasCorrect = currentQuestion.options.find(
        (o) => o.id === selectedOptionId
      )?.isCorrect;
      return wasCorrect ? 'happy' : 'reassuring';
    }
    if (consecutiveCorrect >= 3) return 'streak';
    return 'neutral';
  };

  // Get challenge badge based on type
  const getChallengeBadge = () => {
    if (!config) return null;

    let badgeColor = theme.colors.surface.brand;
    let textColor = theme.colors.brand.primary;
    let icon = CalendarMark;

    if (config.type === 'speed') {
      badgeColor = theme.colors.streak.light;
      textColor = theme.colors.streak.main;
      icon = Fire;
    }

    return (
      <View style={[styles.challengeBadge, { backgroundColor: badgeColor }]}>
        <Icon icon={icon} size="xs" color={textColor} />
        <Text variant="footnote" color={textColor} weight="bold">
          {config.displayName}
        </Text>
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          {
            backgroundColor: theme.colors.surface.primary,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Text variant="body" color="muted">Loading today's challenge...</Text>
      </View>
    );
  }

  // Already completed state
  if (challengeState?.completedToday) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          {
            backgroundColor: theme.colors.surface.primary,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.completedContainer}>
          <Icon icon={CalendarMark} size="xl" color={theme.colors.success.main} />
          <Text variant="title" align="center">Already Completed</Text>
          <Text variant="body" color="muted" align="center">
            You've completed today's challenge!
          </Text>
          <Text variant="footnote" color="muted" align="center">
            Come back tomorrow for a new challenge
          </Text>
          <Button
            label="Back to Home"
            onPress={() => router.replace('/(tabs)')}
            style={styles.completedButton}
          />
        </View>
      </View>
    );
  }

  // Error state - no config or questions
  if (!config || !currentQuestion) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          {
            backgroundColor: theme.colors.surface.primary,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Text variant="body" color="muted">Unable to load challenge</Text>
        <Button
          label="Back to Home"
          onPress={() => router.replace('/(tabs)')}
          style={styles.completedButton}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface.primary,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          height: windowHeight,
        },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border.default }]}>
        <View style={styles.cancelButton}>
          <CancelButton />
        </View>

        {/* Challenge badge - center */}
        <View style={styles.badgeContainer}>
          {getChallengeBadge()}
        </View>

        <View style={styles.headerRight}>
          {/* Streak badge */}
          {combo > 1 && (
            <Animated.View
              entering={FadeIn.duration(Durations.fast)}
              style={[styles.streakBadge, { backgroundColor: theme.colors.surface.brand }]}
            >
              <Icon icon={Fire} size="sm" color={theme.colors.brand.primary} />
              <Text variant="footnote" color={theme.colors.brand.primary} weight="bold">{combo}x</Text>
            </Animated.View>
          )}

          {/* Score display */}
          <Text variant="label">
            {correctCountRef.current}/{currentIndex + (status === 'answered' ? 1 : 0)}
          </Text>
        </View>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressRow}>
        <Text variant="footnote" color="muted" weight="medium">
          {currentIndex + 1} of {config.questionCount}
        </Text>
      </View>

      {/* Main content */}
      <View style={styles.main}>
        {/* Timer row with mascot */}
        <TimerBar
          seconds={timeRemaining}
          totalSeconds={questionTime}
          mascotMood={getMascotMood()}
        />

        {/* Question card */}
        <FindingsCard
          findings={currentQuestion.triad.findings}
          category={currentQuestion.triad.category}
        />

        {/* Answer buttons */}
        <View style={styles.answersSection}>
          {currentQuestion.options.map((option, index) => (
            <AnswerCard
              key={option.id}
              condition={option.condition}
              onPress={() => handleAnswerSelect(option)}
              state={getAnswerState(option)}
              disabled={status === 'answered'}
              delay={index * Durations.stagger}
              letter={['A', 'B', 'C', 'D'][index]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  cancelButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  badgeContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  challengeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  progressRow: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  main: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  answersSection: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  completedContainer: {
    alignItems: 'center',
    gap: Spacing.base,
    maxWidth: 300,
  },
  completedButton: {
    marginTop: Spacing.lg,
  },
});
