import { useReducer } from 'react';
import { StudyState, StudyAction } from '@/types/study-state';

/**
 * Initial state for a new study session
 */
const initialState: StudyState = {
  status: 'idle',
  questions: [],
  currentIndex: 0,
  correctCount: 0,
  selectedOptionId: null,
  showExplanation: false,
  trickyQuestionIds: [],
};

/**
 * Study mode state reducer handling all state transitions
 *
 * State machine:
 * - idle -> playing (START_STUDY)
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
 */
function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case 'START_STUDY':
      return {
        ...initialState,
        status: 'playing',
        questions: action.questions,
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
 * Custom hook that provides study mode state management via useReducer
 *
 * Returns a tuple of [state, dispatch] similar to useReducer.
 * dispatch is a stable reference and safe to use in dependencies.
 *
 * @example
 * ```tsx
 * const [state, dispatch] = useStudyReducer();
 *
 * // Start study session
 * dispatch({ type: 'START_STUDY', questions });
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
export function useStudyReducer() {
  return useReducer(studyReducer, initialState);
}
