import { useReducer } from 'react';
import {
  QuizState,
  QuizAction,
  QUESTION_TIME,
} from '@/types/quiz-state';

/**
 * Initial state for a new quiz round
 */
const initialState: QuizState = {
  status: 'idle',
  questions: [],
  currentIndex: 0,
  score: 0,
  combo: 1,
  timeRemaining: QUESTION_TIME,
  selectedOptionId: null,
};

/**
 * Quiz state reducer handling all state transitions
 *
 * State machine:
 * - idle -> playing (START_QUIZ)
 * - playing -> answered (SELECT_ANSWER or timer reaches 0)
 * - answered -> playing (NEXT_QUESTION if more questions)
 * - answered -> completed (NEXT_QUESTION if no more questions)
 * - any -> idle (RESET)
 */
function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...initialState,
        status: 'playing',
        questions: action.questions,
        timeRemaining: QUESTION_TIME,
      };

    case 'SELECT_ANSWER':
      // Only allow selection when playing
      if (state.status !== 'playing') return state;
      return {
        ...state,
        status: 'answered',
        selectedOptionId: action.optionId,
        score: action.isCorrect
          ? state.score + 100 * state.combo
          : state.score,
        combo: action.isCorrect ? state.combo + 1 : 1,
      };

    case 'TICK_TIMER':
      // Only tick when playing
      if (state.status !== 'playing') return state;

      const newTime = state.timeRemaining - 1;
      if (newTime <= 0) {
        // Time expired - treat as incorrect answer
        return {
          ...state,
          status: 'answered',
          timeRemaining: 0,
          combo: 1, // Reset combo on timeout
        };
      }
      return {
        ...state,
        timeRemaining: newTime,
      };

    case 'NEXT_QUESTION':
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        // No more questions - quiz complete
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
        timeRemaining: QUESTION_TIME,
        selectedOptionId: null,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/**
 * Custom hook that provides quiz state management via useReducer
 *
 * Returns a tuple of [state, dispatch] similar to useReducer.
 * dispatch is a stable reference and safe to use in dependencies.
 *
 * @example
 * ```tsx
 * const [state, dispatch] = useQuizReducer();
 *
 * // Start quiz
 * dispatch({ type: 'START_QUIZ', questions });
 *
 * // Select answer
 * dispatch({ type: 'SELECT_ANSWER', optionId: 'abc', isCorrect: true });
 *
 * // Timer tick
 * dispatch({ type: 'TICK_TIMER' });
 * ```
 */
export function useQuizReducer() {
  return useReducer(quizReducer, initialState);
}
