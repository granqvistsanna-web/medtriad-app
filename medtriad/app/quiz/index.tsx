import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useCallback, useRef } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Fire } from '@solar-icons/react-native/Bold';

import { Text, Icon } from '@/components/primitives';
import { FindingsCard } from '@/components/quiz/FindingsCard';
import { AnswerCard } from '@/components/quiz/AnswerCard';
import { TimerBar } from '@/components/quiz/TimerBar';
import { CancelButton } from '@/components/quiz/CancelButton';

import { useQuizReducer } from '@/hooks/use-quiz-reducer';
import { useCountdownTimer } from '@/hooks/use-countdown-timer';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { generateQuestionSet } from '@/services/question-generator';
import { isPerfectRound, getComboTier } from '@/services/scoring';
import { checkTierUp } from '@/services/mastery';
import { useStats } from '@/hooks/useStats';

import { QuizOption, TriadCategory } from '@/types';
import { QUESTION_COUNT, QUESTION_TIME } from '@/types/quiz-state';
import { CategoryMasteryData } from '@/services/stats-storage';
import { theme, Typography, Spacing, Radius, Durations } from '@/constants/theme';
import { MascotMood } from '@/components/home/TriMascot';

/** Delay in ms before advancing to next question after answer */
const ANSWER_DELAY = 1200;

export default function QuizScreen() {
  const [state, dispatch] = useQuizReducer();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { stats, recordQuizResult, checkHighScore } = useStats();
  const { playSound } = useSoundEffects();
  const { triggerHaptic } = useHaptics();

  // Track results for passing to results screen
  const correctCountRef = useRef(0);
  const maxComboRef = useRef(1);
  const categoryResultsRef = useRef<Record<TriadCategory, CategoryMasteryData>>({} as Record<TriadCategory, CategoryMasteryData>);

  const {
    status,
    questions,
    currentIndex,
    score,
    combo,
    consecutiveCorrect,
    lastPointsEarned,
    timeRemaining,
    selectedOptionId,
  } = state;

  const currentQuestion = questions[currentIndex];

  // Initialize quiz on mount
  useEffect(() => {
    const generatedQuestions = generateQuestionSet(QUESTION_COUNT);
    dispatch({ type: 'START_QUIZ', questions: generatedQuestions });
  }, [dispatch]);

  // Timer tick handler
  const handleTick = useCallback(() => {
    dispatch({ type: 'TICK_TIMER' });
  }, [dispatch]);

  // Run countdown timer when playing
  useCountdownTimer(status === 'playing', handleTick);

  // Handle timeout - no haptic, visual feedback only
  useEffect(() => {
    if (status === 'playing' && timeRemaining === 0) {
      dispatch({
        type: 'SELECT_ANSWER',
        optionId: '',
        isCorrect: false,
        timeRemaining: 0,
      });
    }
  }, [status, timeRemaining, dispatch]);

  // Auto-advance after answer
  useEffect(() => {
    if (status !== 'answered') return;

    const timeout = setTimeout(async () => {
      if (currentIndex >= questions.length - 1) {
        try {
          // Check for new high score BEFORE saving stats
          const isNewHighScore = await checkHighScore(score);

          // Check for tier-up BEFORE recording quiz result
          // stats?.gamesPlayed is the current count, quiz will increment it
          const { willTierUp, newTier } = checkTierUp(stats?.gamesPlayed ?? 0);

          // Save stats (this increments gamesPlayed and sets pendingTierUp)
          await recordQuizResult(
            correctCountRef.current,
            QUESTION_COUNT,
            maxComboRef.current,
            score,
            categoryResultsRef.current
          );

          // Navigate to results with tier-up info
          const perfect = isPerfectRound(correctCountRef.current, QUESTION_COUNT);
          router.replace({
            pathname: '/quiz/results',
            params: {
              score: score.toString(),
              correctCount: correctCountRef.current.toString(),
              bestStreak: maxComboRef.current.toString(),
              isNewHighScore: isNewHighScore ? 'true' : 'false',
              isPerfect: perfect ? 'true' : 'false',
              // Tier-up params
              tierUp: willTierUp ? 'true' : 'false',
              newTierName: newTier?.name ?? '',
              newTierNumber: newTier?.tier.toString() ?? '',
            },
          });
        } catch (error) {
          // DESIGN DECISION (ERR-04): Silent fallback is intentional for MVP.
          // Per 19-RESEARCH.md, user-friendly error messages are not needed here because:
          // 1. The quiz experience completes successfully (user sees results)
          // 2. Only persistence fails, which is invisible to user anyway
          // 3. Showing an error would confuse users ("save failed" when they see their score)
          // We log for debugging but don't interrupt the user flow.
          console.error('Failed to save quiz result:', error);

          // Still navigate to results even if save failed
          // User sees their score, just may not persist
          router.replace({
            pathname: '/quiz/results',
            params: {
              score: score.toString(),
              correctCount: correctCountRef.current.toString(),
              bestStreak: maxComboRef.current.toString(),
              isNewHighScore: 'false',
              isPerfect: isPerfectRound(correctCountRef.current, QUESTION_COUNT) ? 'true' : 'false',
              tierUp: 'false',
              newTierName: '',
              newTierNumber: '',
            },
          });
        }
      } else {
        dispatch({ type: 'NEXT_QUESTION' });
      }
    }, ANSWER_DELAY);

    return () => clearTimeout(timeout);
  }, [status, currentIndex, questions.length, dispatch, router, score, recordQuizResult, checkHighScore, stats?.gamesPlayed]);

  // Handle answer selection - single Light haptic on tap (consistent, understated)
  const handleAnswerSelect = async (option: QuizOption) => {
    triggerHaptic();

    dispatch({
      type: 'SELECT_ANSWER',
      optionId: option.id,
      isCorrect: option.isCorrect,
      timeRemaining: state.timeRemaining,
    });

    // Track category result for mastery
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
        // Play combo sound slightly delayed to not overlap
        setTimeout(() => playSound('combo'), 150);
      }
      correctCountRef.current += 1;
      if (newTier > maxComboRef.current) {
        maxComboRef.current = newTier;
      }
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
    return 'faded'; // Non-selected, non-correct answers fade
  };

  // Get mascot mood based on game state
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

  // Loading state
  if (!currentQuestion) {
    return null;
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

        {/* Question progress - center */}
        <View style={styles.progressContainer}>
          <Text variant="footnote" color="muted" weight="medium">
            {currentIndex + 1} of {QUESTION_COUNT}
          </Text>
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

      {/* Main content */}
      <View style={styles.main}>
        {/* Timer row with mascot */}
        <TimerBar
          seconds={timeRemaining}
          totalSeconds={QUESTION_TIME}
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
  progressContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
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
});
