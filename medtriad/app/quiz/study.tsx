import { StyleSheet, View, useWindowDimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useCallback, useMemo } from 'react';
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
import { generateQuestionSet, generateQuestionSetByCategories } from '@/services/question-generator';
import { toggleTrickyQuestion, saveStudySession } from '@/services/study-storage';
import { recordTriadAnswer } from '@/services/triad-performance-storage';

import { QuizOption, TriadCategory } from '@/types';
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
  const params = useLocalSearchParams<{ categories?: string }>();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { playSound } = useSoundEffects();
  const { triggerHaptic } = useHaptics();

  // Parse categories from URL params
  const selectedCategories = useMemo(() => {
    if (!params.categories) return [];
    return params.categories.split(',').filter(Boolean) as TriadCategory[];
  }, [params.categories]);

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

  // Initialize study session on mount with category filtering
  useEffect(() => {
    const generatedQuestions =
      selectedCategories.length > 0
        ? generateQuestionSetByCategories(STUDY_QUESTION_COUNT, selectedCategories)
        : generateQuestionSet(STUDY_QUESTION_COUNT);
    dispatch({ type: 'START_STUDY', questions: generatedQuestions });
  }, [dispatch, selectedCategories]);

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

      // Record triad performance (fire-and-forget)
      // Study mode is untimed, so responseTimeMs = 0
      recordTriadAnswer(currentQuestion.triad.id, option.isCorrect, 0).catch((error) => {
        console.error('Failed to record triad performance:', error);
      });

      // Play appropriate sound
      if (option.isCorrect) {
        playSound('correct');
      } else {
        playSound('incorrect');
      }
    },
    [status, dispatch, triggerHaptic, playSound, currentQuestion.triad.id]
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
                ? 'Finish Study'
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
});
