import { QuizQuestion } from './question';

/**
 * Default time allowed per question in seconds
 * @deprecated Use getTimerForTier() from mastery.ts for tier-based timing
 */
export const QUESTION_TIME = 15;

/**
 * Default time for backwards compatibility
 */
export const DEFAULT_QUESTION_TIME = 15;

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

  /** Number of consecutive correct answers (0-based counter) */
  consecutiveCorrect: number;

  /** Current combo multiplier tier (1, 2, or 3) for display */
  combo: number;

  /** Points earned on the last answer (for floating points display) */
  lastPointsEarned: number;

  /** Seconds remaining for current question */
  timeRemaining: number;

  /** Time allowed per question (tier-based) */
  questionTime: number;

  /** ID of selected answer option, null if none selected */
  selectedOptionId: string | null;
}

/**
 * Actions that can be dispatched to the quiz reducer
 */
export type QuizAction =
  | { type: 'START_QUIZ'; questions: QuizQuestion[]; questionTime?: number }
  | { type: 'SELECT_ANSWER'; optionId: string; isCorrect: boolean; timeRemaining: number }
  | { type: 'TICK_TIMER' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET' };
