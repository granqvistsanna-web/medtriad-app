import { useReducer } from 'react';
import { ReviewState, ReviewAction } from '@/types/review-state';

/**
 * Initial state for a new review session
 */
const initialState: ReviewState = {
  status: 'idle',
  questions: [],
  currentIndex: 0,
  correctCount: 0,
  selectedOptionId: null,
  showExplanation: false,
  trickyQuestionIds: [],
  allCaughtUp: false,
};

/**
 * Review mode state reducer handling all state transitions
 *
 * State machine:
 * - idle -> playing (START_REVIEW)
 * - idle -> completed (NO_REVIEWS_DUE)
 * - playing -> answered (SELECT_ANSWER)
 * - answered -> playing (NEXT_QUESTION if more questions)
 * - answered -> completed (NEXT_QUESTION if no more questions)
 * - any -> idle (RESET)
 *
 * Key differences from quiz reducer:
 * - No timer logic (untimed, relaxed learning)
 * - No scoring/combo system (simple correct count only)
 * - showExplanation set to true immediately on answer
 * - trickyQuestionIds tracking for marked questions
 * - allCaughtUp state for when no triads are due
 */
function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  switch (action.type) {
    case 'START_REVIEW':
      return {
        ...initialState,
        status: 'playing',
        questions: action.questions,
      };

    case 'NO_REVIEWS_DUE':
      return {
        ...initialState,
        status: 'completed',
        allCaughtUp: true,
      };

    case 'SELECT_ANSWER': {
      // Only allow selection when playing
      if (state.status !== 'playing') return state;

      return {
        ...state,
        status: 'answered',
        selectedOptionId: action.optionId,
        showExplanation: true,
        correctCount: action.isCorrect
          ? state.correctCount + 1
          : state.correctCount,
      };
    }

    case 'TOGGLE_TRICKY': {
      const { triadId } = action;
      const isCurrentlyTricky = state.trickyQuestionIds.includes(triadId);

      return {
        ...state,
        trickyQuestionIds: isCurrentlyTricky
          ? state.trickyQuestionIds.filter((id) => id !== triadId)
          : [...state.trickyQuestionIds, triadId],
      };
    }

    case 'NEXT_QUESTION': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        // No more questions - session complete
        return {
          ...state,
          status: 'completed',
        };
      }
      // Move to next question
      return {
        ...state,
        status: 'playing',
        currentIndex: nextIndex,
        selectedOptionId: null,
        showExplanation: false,
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/**
 * Custom hook that provides review mode state management via useReducer
 *
 * Returns a tuple of [state, dispatch] similar to useReducer.
 * dispatch is a stable reference and safe to use in dependencies.
 *
 * @example
 * ```tsx
 * const [state, dispatch] = useReviewReducer();
 *
 * // Start review session
 * dispatch({ type: 'START_REVIEW', questions });
 *
 * // No reviews due
 * dispatch({ type: 'NO_REVIEWS_DUE' });
 *
 * // Select answer (no time tracking needed)
 * dispatch({ type: 'SELECT_ANSWER', optionId: 'abc', isCorrect: true });
 *
 * // Mark question as tricky
 * dispatch({ type: 'TOGGLE_TRICKY', triadId: 'becks-triad' });
 *
 * // Move to next question
 * dispatch({ type: 'NEXT_QUESTION' });
 * ```
 */
export function useReviewReducer() {
  return useReducer(reviewReducer, initialState);
}
