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

import { useStudyReducer } from '@/hooks/use-study-reducer';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { generateQuestionSet } from '@/services/question-generator';
import { toggleTrickyQuestion, saveStudySession } from '@/services/study-storage';

import { QuizOption } from '@/types';
import { STUDY_QUESTION_COUNT } from '@/types/study-state';
import { theme, Spacing, Durations } from '@/constants/theme';

/**
 * Study Mode Screen
 *
 * Provides a relaxed learning experience without time pressure.
 * Users answer questions at their own pace and see explanations after each answer.
 * Questions can be marked as "tricky" for later review.
 */
export default function StudyScreen() {
  const [state, dispatch] = useStudyReducer();
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
  } = state;

  const currentQuestion = questions[currentIndex];

  // Initialize study session on mount
  useEffect(() => {
    const generatedQuestions = generateQuestionSet(STUDY_QUESTION_COUNT);
    dispatch({ type: 'START_STUDY', questions: generatedQuestions });
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

      // Play appropriate sound
      if (option.isCorrect) {
        playSound('correct');
      } else {
        playSound('incorrect');
      }
    },
    [status, dispatch, triggerHaptic, playSound]
  );

  // Handle continue to next question
  const handleContinue = useCallback(async () => {
    if (currentIndex >= questions.length - 1) {
      // Last question - save session and navigate to results
      try {
        await saveStudySession({
          completedAt: new Date().toISOString(),
          correctCount,
          totalQuestions: questions.length,
          trickyCount: trickyQuestionIds.length,
        });
      } catch (error) {
        // Silent fallback - user sees their results even if save fails
        console.error('Failed to save study session:', error);
      }

      // Navigate to study results screen
      router.replace({
        pathname: '/quiz/study-results',
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
      <StudyHeader
        currentIndex={currentIndex}
        totalQuestions={STUDY_QUESTION_COUNT}
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

        {/* Explanation and footer - shown after answering */}
        {showExplanation && (
          <Animated.View
            entering={FadeIn.duration(Durations.normal)}
            style={styles.explanationSection}
          >
            <ExplanationCard triad={currentQuestion.triad} />

            {/* Footer with tricky button and continue */}
            <View style={styles.footer}>
              <TrickyButton
                isMarked={isCurrentQuestionTricky}
                onToggle={handleToggleTricky}
              />

              <Button
                label={
                  currentIndex >= questions.length - 1
                    ? 'Finish Study'
                    : 'Continue'
                }
                variant="primary"
                size="lg"
                onPress={handleContinue}
                style={styles.continueButton}
              />
            </View>
          </Animated.View>
        )}
      </ScrollView>
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
    paddingBottom: Spacing.xl,
  },
  answersSection: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  explanationSection: {
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  continueButton: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
