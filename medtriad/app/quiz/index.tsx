import { SafeAreaView, StyleSheet, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';

import { FindingsCard } from '@/components/quiz/FindingsCard';
import { AnswerCard } from '@/components/quiz/AnswerCard';
import { TimerRing } from '@/components/quiz/TimerRing';
import { ScoreDisplay } from '@/components/quiz/ScoreDisplay';
import { ProgressIndicator } from '@/components/quiz/ProgressIndicator';

import { useQuizReducer } from '@/hooks/use-quiz-reducer';
import { useCountdownTimer } from '@/hooks/use-countdown-timer';
import { generateQuestionSet } from '@/services/question-generator';
import { isPerfectRound, getComboTier } from '@/services/scoring';

import { QuizOption } from '@/types';
import { QUESTION_COUNT, QUESTION_TIME } from '@/types/quiz-state';
import { Colors, Spacing } from '@/constants/theme';

/** Delay in ms before advancing to next question after answer */
const ANSWER_DELAY = 1500;

export default function QuizScreen() {
  const [state, dispatch] = useQuizReducer();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  // Track results for passing to results screen
  const correctCountRef = useRef(0);
  const maxComboRef = useRef(1);

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

  // Auto-advance after answer
  useEffect(() => {
    if (status !== 'answered') return;

    const timeout = setTimeout(() => {
      if (currentIndex >= questions.length - 1) {
        // Check for perfect round (all questions correct)
        const perfect = isPerfectRound(correctCountRef.current, QUESTION_COUNT);
        router.replace({
          pathname: '/quiz/results',
          params: {
            score: score.toString(),
            correctCount: correctCountRef.current.toString(),
            bestStreak: maxComboRef.current.toString(),
            isNewHighScore: 'false', // Phase 5 will implement actual check
            isPerfect: perfect ? 'true' : 'false',
          },
        });
      } else {
        dispatch({ type: 'NEXT_QUESTION' });
      }
    }, ANSWER_DELAY);

    return () => clearTimeout(timeout);
  }, [status, currentIndex, questions.length, dispatch, router, score]);

  // Handle answer selection
  const handleAnswerSelect = async (option: QuizOption) => {
    // Immediate haptic on tap
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Update state with timeRemaining for scoring calculation
    dispatch({
      type: 'SELECT_ANSWER',
      optionId: option.id,
      isCorrect: option.isCorrect,
      timeRemaining: state.timeRemaining,
    });

    // Track correct answers and max combo tier
    if (option.isCorrect) {
      correctCountRef.current += 1;
      // Calculate what the new combo tier will be after dispatch
      const newComboTier = getComboTier(consecutiveCorrect + 1);
      if (newComboTier > maxComboRef.current) {
        maxComboRef.current = newComboTier;
      }
    }

    // Result haptic feedback
    if (option.isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Determine answer card state
  const getAnswerState = (option: QuizOption): 'default' | 'correct' | 'incorrect' | 'revealed' => {
    if (status !== 'answered') return 'default';

    if (option.id === selectedOptionId) {
      return option.isCorrect ? 'correct' : 'incorrect';
    }
    if (option.isCorrect) {
      return 'revealed';
    }
    return 'default';
  };

  // Loading state
  if (!currentQuestion) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ProgressIndicator current={currentIndex + 1} total={QUESTION_COUNT} />
        <TimerRing seconds={timeRemaining} totalSeconds={QUESTION_TIME} />
        <ScoreDisplay score={score} combo={combo} />
      </View>

      <View style={styles.content}>
        <FindingsCard findings={currentQuestion.triad.findings} />

        <View style={styles.answers}>
          {currentQuestion.options.map((option) => (
            <AnswerCard
              key={option.id}
              condition={option.condition}
              onPress={() => handleAnswerSelect(option)}
              state={getAnswerState(option)}
              disabled={status === 'answered'}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
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
    paddingVertical: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    gap: Spacing.lg,
  },
  answers: {
    gap: Spacing.md,
  },
});
