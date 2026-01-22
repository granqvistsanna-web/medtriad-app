import { QuizQuestion } from './question';

/**
 * Possible states of the review mode state machine
 * - idle: Review session not started, waiting to begin
 * - playing: Active question, user can select answer (no timer)
 * - answered: Answer selected, showing explanation
 * - completed: All questions answered, review session finished
 */
export type ReviewStatus = 'idle' | 'playing' | 'answered' | 'completed';

/**
 * Complete review mode state - relaxed learning without time pressure
 */
export interface ReviewState {
  /** Current review status */
  status: ReviewStatus;

  /** Array of review questions for the current session */
  questions: QuizQuestion[];

  /** Index of the current question (0-based) */
  currentIndex: number;

  /** Number of questions answered correctly */
  correctCount: number;

  /** ID of selected answer option, null if none selected */
  selectedOptionId: string | null;

  /** Whether to show the explanation card after answering */
  showExplanation: boolean;

  /** Triad IDs marked as tricky during this session */
  trickyQuestionIds: string[];

  /** Whether all triads are caught up (no reviews due) */
  allCaughtUp: boolean;
}

/**
 * Actions that can be dispatched to the review reducer
 */
export type ReviewAction =
  | { type: 'START_REVIEW'; questions: QuizQuestion[] }
  | { type: 'SELECT_ANSWER'; optionId: string; isCorrect: boolean }
  | { type: 'TOGGLE_TRICKY'; triadId: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'NO_REVIEWS_DUE' }
  | { type: 'RESET' };

/**
 * Summary of a completed review session
 */
export interface ReviewSessionResult {
  /** When the session was completed */
  completedAt: string;

  /** Number of questions answered correctly */
  correctCount: number;

  /** Total number of questions in the session */
  totalQuestions: number;

  /** Triad IDs marked as tricky during the session */
  trickyQuestionIds: string[];
}
