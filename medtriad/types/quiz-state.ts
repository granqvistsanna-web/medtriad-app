import { QuizQuestion } from './question';

/**
 * Time allowed per question in seconds
 */
export const QUESTION_TIME = 12;

/**
 * Number of questions per quiz round
 */
export const QUESTION_COUNT = 10;

/**
 * Possible states of the quiz state machine
 * - idle: Quiz not started, waiting to begin
 * - playing: Active question, timer running
 * - answered: Answer selected or time expired, showing result
 * - completed: All questions answered, quiz finished
 */
export type QuizStatus = 'idle' | 'playing' | 'answered' | 'completed';

/**
 * Complete quiz state containing all game data
 */
export interface QuizState {
  /** Current quiz status */
  status: QuizStatus;

  /** Array of quiz questions for the current round */
  questions: QuizQuestion[];

  /** Index of the current question (0-based) */
  currentIndex: number;

  /** Cumulative score for the current round */
  score: number;

  /** Current combo multiplier (resets on incorrect/timeout) */
  combo: number;

  /** Seconds remaining for current question */
  timeRemaining: number;

  /** ID of selected answer option, null if none selected */
  selectedOptionId: string | null;
}

/**
 * Actions that can be dispatched to the quiz reducer
 */
export type QuizAction =
  | { type: 'START_QUIZ'; questions: QuizQuestion[] }
  | { type: 'SELECT_ANSWER'; optionId: string; isCorrect: boolean }
  | { type: 'TICK_TIMER' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET' };
