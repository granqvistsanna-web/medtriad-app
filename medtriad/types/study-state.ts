import { QuizQuestion } from './question';

/**
 * Number of questions per study session
 */
export const STUDY_QUESTION_COUNT = 10;

/**
 * Possible states of the study mode state machine
 * - idle: Study session not started, waiting to begin
 * - playing: Active question, user can select answer (no timer)
 * - answered: Answer selected, showing explanation
 * - completed: All questions answered, study session finished
 */
export type StudyStatus = 'idle' | 'playing' | 'answered' | 'completed';

/**
 * Complete study mode state - relaxed learning without time pressure
 */
export interface StudyState {
  /** Current study status */
  status: StudyStatus;

  /** Array of study questions for the current session */
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
}

/**
 * Actions that can be dispatched to the study reducer
 */
export type StudyAction =
  | { type: 'START_STUDY'; questions: QuizQuestion[] }
  | { type: 'SELECT_ANSWER'; optionId: string; isCorrect: boolean }
  | { type: 'TOGGLE_TRICKY'; triadId: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET' };

/**
 * Summary of a completed study session
 */
export interface StudySessionResult {
  /** When the session was completed */
  completedAt: string;

  /** Number of questions answered correctly */
  correctCount: number;

  /** Total number of questions in the session */
  totalQuestions: number;

  /** Triad IDs marked as tricky during the session */
  trickyQuestionIds: string[];
}
