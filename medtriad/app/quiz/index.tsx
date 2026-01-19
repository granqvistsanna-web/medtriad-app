import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { FindingsCard } from '@/components/quiz/FindingsCard';
import { AnswerCard } from '@/components/quiz/AnswerCard';
import { TimerBar } from '@/components/quiz/TimerBar';
import { CancelButton } from '@/components/quiz/CancelButton';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { useQuizReducer } from '@/hooks/use-quiz-reducer';
import { useCountdownTimer } from '@/hooks/use-countdown-timer';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { generateQuestionSet } from '@/services/question-generator';
import { isPerfectRound, getComboTier } from '@/services/scoring';
import { checkTierUp } from '@/services/mastery';
import { useStats } from '@/hooks/useStats';

import { QuizOption } from '@/types';
import { QUESTION_COUNT, QUESTION_TIME } from '@/types/quiz-state';
import { Colors, Typography, Spacing, Radius, Durations } from '@/constants/theme';
import { MascotMood } from '@/components/home/TriMascot';

/** Delay in ms before advancing to next question after answer */
const ANSWER_DELAY = 1500;

export default function QuizScreen() {
  const [state, dispatch] = useQuizReducer();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const colors = Colors.light;
  const { stats, recordQuizResult, checkHighScore } = useStats();
  const { playSound } = useSoundEffects();
  const { triggerHaptic } = useHaptics();

  // Track results for passing to results screen
  const correctCountRef = useRef(0);
  const maxComboRef = useRef(1);

  // Feedback text state
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

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
      setFeedbackText("Time's up!");
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
          score
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
      } else {
        setFeedbackText(null);
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
      setFeedbackText('Correct!');
    } else {
      playSound('incorrect');
      // Find correct answer
      const correctOption = currentQuestion.options.find((o) => o.isCorrect);
      setFeedbackText(`Correct: ${correctOption?.condition}`);
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
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          height: windowHeight,
        },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.cancelButton}>
          <CancelButton />
        </View>

        {/* Question progress - center */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.textMuted }]}>
            {currentIndex + 1} of {QUESTION_COUNT}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Streak badge */}
          {combo > 1 && (
            <Animated.View
              entering={FadeIn.duration(Durations.fast)}
              style={[styles.streakBadge, { backgroundColor: colors.primaryLight }]}
            >
              <IconSymbol name="flame.fill" size={14} color={colors.primary} />
              <Text style={[styles.streakText, { color: colors.primary }]}>{combo}x</Text>
            </Animated.View>
          )}

          {/* Score display */}
          <Text style={[styles.scoreText, { color: colors.text }]}>
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
        <View style={styles.questionSection}>
          <FindingsCard
            findings={currentQuestion.triad.findings}
            category={currentQuestion.triad.category}
          />
        </View>

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
            />
          ))}
        </View>

        {/* Feedback text */}
        {feedbackText && (
          <Animated.View
            entering={FadeInUp.duration(Durations.normal).springify()}
            style={styles.feedbackContainer}
          >
            <Text
              style={[
                styles.feedbackText,
                {
                  color: feedbackText === 'Correct!' ? colors.success : colors.textSecondary,
                },
              ]}
            >
              {feedbackText === 'Correct!' ? 'Correct! ✨' : feedbackText}
            </Text>
          </Animated.View>
        )}
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
  progressText: {
    ...Typography.footnote,
    fontWeight: '500',
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
  streakText: {
    ...Typography.footnote,
    fontWeight: '700',
  },
  scoreText: {
    ...Typography.label,
  },
  main: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  questionSection: {
    // Takes natural height
  },
  answersSection: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  feedbackContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  feedbackText: {
    ...Typography.label,
  },
});
