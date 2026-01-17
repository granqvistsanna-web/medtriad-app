import { Triad } from './triad';

/**
 * A single answer option in a quiz question
 */
export interface QuizOption {
  /** Unique identifier matching the triad id */
  id: string;

  /** The condition name to display as an answer choice */
  condition: string;

  /** Whether this option is the correct answer */
  isCorrect: boolean;
}

/**
 * A complete quiz question with the triad and multiple choice options
 */
export interface QuizQuestion {
  /** Unique identifier for this question instance */
  id: string;

  /** The triad representing the correct answer */
  triad: Triad;

  /** Formatted findings string for display (e.g., "Finding 1 + Finding 2 + Finding 3") */
  displayFindings: string;

  /** Array of 4 answer options including the correct answer */
  options: QuizOption[];
}
