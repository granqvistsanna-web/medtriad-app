import { StyleSheet, View, useWindowDimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useCallback } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text, Button } from '@/components/primitives';
import { FindingsCard } from '@/components/quiz/FindingsCard';
import { AnswerCard } from '@/components/quiz/AnswerCard';
import { StudyHeader } from '@/components/quiz/StudyHeader';
import { ExplanationCard } from '@/components/quiz/ExplanationCard';
import { TrickyButton } from '@/components/quiz/TrickyButton';

import { useReviewReducer } from '@/hooks/use-review-reducer';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { generateQuestion } from '@/services/question-generator';
import { getDueTriads, recordReviewAnswer } from '@/services/spaced-repetition';
import { toggleTrickyQuestion } from '@/services/study-storage';

import { QuizOption } from '@/types';
import { theme, Spacing, Durations } from '@/constants/theme';

/**
 * Review Mode Screen
 *
 * Provides spaced repetition practice for triads due for review.
 * Users answer questions from due triads only, at their own pace.
 * Each answer updates SM-2 scheduling via recordReviewAnswer.
 */
export default function ReviewScreen() {
  const [state, dispatch] = useReviewReducer();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { playSound } = useSoundEffects();
  const { triggerHaptic } = useHaptics();

  const {
    status,
    questions,
    currentIndex,
    correctCount,
    selectedOptionId,
    showExplanation,
    trickyQuestionIds,
    allCaughtUp,
  } = state;

  const currentQuestion = questions[currentIndex];

  // Initialize review session on mount - load due triads
  useEffect(() => {
    async function loadDueTriads() {
      const dueTriads = await getDueTriads();

      if (dueTriads.length === 0) {
        dispatch({ type: 'NO_REVIEWS_DUE' });
        return;
      }

      // Generate questions from due triads only
      const questions = dueTriads.map(triad => generateQuestion(triad));
      dispatch({ type: 'START_REVIEW', questions });
    }

    loadDueTriads();
  }, [dispatch]);

  // Handle answer selection
  const handleAnswerSelect = useCallback(
    (option: QuizOption) => {
      if (status !== 'playing') return;

      triggerHaptic();
      dispatch({
        type: 'SELECT_ANSWER',
        optionId: option.id,
        isCorrect: option.isCorrect,
      });

      // Record review answer - updates SM-2 scheduling (fire-and-forget)
      recordReviewAnswer(currentQuestion.triad.id, option.isCorrect).catch((error) => {
        console.error('Failed to record review answer:', error);
      });

      // Play appropriate sound
      if (option.isCorrect) {
        playSound('correct');
      } else {
        playSound('incorrect');
      }
    },
    [status, dispatch, triggerHaptic, playSound, currentQuestion]
  );

  // Handle continue to next question
  const handleContinue = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      // Last question - navigate to results
      router.replace({
        pathname: '/quiz/review-results',
        params: {
          correctCount: correctCount.toString(),
          totalQuestions: questions.length.toString(),
          trickyCount: trickyQuestionIds.length.toString(),
        },
      });
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }, [
    currentIndex,
    questions.length,
    correctCount,
    trickyQuestionIds.length,
    router,
    dispatch,
  ]);

  // Handle marking question as tricky
  const handleToggleTricky = useCallback(() => {
    if (!currentQuestion) return;

    dispatch({ type: 'TOGGLE_TRICKY', triadId: currentQuestion.triad.id });

    // Persist to storage (fire and forget)
    toggleTrickyQuestion(
      currentQuestion.triad.id,
      currentQuestion.triad.category
    ).catch((error) => {
      console.error('Failed to toggle tricky question:', error);
    });
  }, [currentQuestion, dispatch]);

  // Determine answer card state
  const getAnswerState = (
    option: QuizOption
  ): 'default' | 'correct' | 'incorrect' | 'revealed' | 'faded' => {
    if (status !== 'answered') return 'default';

    if (option.id === selectedOptionId) {
      return option.isCorrect ? 'correct' : 'incorrect';
    }
    if (option.isCorrect) {
      return 'revealed';
    }
    return 'faded';
  };

  // Check if current question is marked as tricky
  const isCurrentQuestionTricky = currentQuestion
    ? trickyQuestionIds.includes(currentQuestion.triad.id)
    : false;

  // All caught up state - no triads due for review
  if (allCaughtUp) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface.primary,
            paddingTop: insets.top,
            height: windowHeight,
          },
        ]}
      >
        <View style={styles.caughtUpContainer}>
          <Text variant="title" color="primary" align="center">
            All Caught Up!
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.caughtUpText}>
            No triads are due for review right now. Keep practicing in Quiz or Study mode!
          </Text>
          <Button
            label="Back to Home"
            variant="primary"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      </View>
    );
  }

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
          height: windowHeight,
        },
      ]}
    >
      {/* Header */}
      <StudyHeader
        currentIndex={currentIndex}
        totalQuestions={questions.length}
      />

      {/* Main content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.main}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Explanation - shown after answering */}
        {showExplanation && (
          <Animated.View
            entering={FadeIn.duration(Durations.normal)}
            style={styles.explanationSection}
          >
            <ExplanationCard triad={currentQuestion.triad} />
          </Animated.View>
        )}
      </ScrollView>

      {/* Fixed footer with tricky button and continue - shown after answering */}
      {showExplanation && (
        <Animated.View
          entering={FadeIn.duration(Durations.normal)}
          style={[
            styles.fixedFooter,
            {
              paddingBottom: Math.max(insets.bottom, Spacing.md),
              borderTopColor: theme.colors.border.default,
            },
          ]}
        >
          <TrickyButton
            isMarked={isCurrentQuestionTricky}
            onToggle={handleToggleTricky}
          />

          <Button
            label={
              currentIndex >= questions.length - 1
                ? 'Finish Review'
                : 'Continue'
            }
            variant="primary"
            size="lg"
            onPress={handleContinue}
            style={styles.continueButton}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  main: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 120, // Space for fixed footer
  },
  answersSection: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  explanationSection: {
    marginTop: Spacing.lg,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: theme.colors.surface.primary,
    borderTopWidth: 1,
  },
  continueButton: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  caughtUpContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  caughtUpText: {
    marginTop: Spacing.md,
  },
});
