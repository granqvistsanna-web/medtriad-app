import { getAllTriads } from '@/services/triads';
import { loadTriadPerformance, saveTriadPerformance } from '@/services/triad-performance-storage';
import { loadTrickyQuestions } from '@/services/study-storage';
import type { Triad } from '@/types/triad';

// Constants for SM-2 algorithm and application constraints
const MAX_REVIEW_INTERVAL_DAYS = 14;      // SR-05: Cap review intervals
const TRICKY_INTERVAL_MULTIPLIER = 0.5;   // SR-06: Reduce interval for tricky items
const MIN_EASE_FACTOR = 1.3;              // SM-2 minimum ease factor
const DEFAULT_EASE_FACTOR = 2.5;          // SM-2 default ease factor

/**
 * Result of SM-2 algorithm calculation
 */
interface SM2Result {
  /** Days until next review */
  interval: number;
  /** Count of consecutive correct reviews */
  repetition: number;
  /** Ease factor for future interval calculations */
  efactor: number;
  /** ISO date string of next scheduled review */
  nextReviewDate: string;
}

/**
 * Calculate next review scheduling using SM-2 algorithm with binary quality mapping
 *
 * Binary quality mapping:
 * - Correct answer: quality = 4 (EF adjustment neutral)
 * - Incorrect answer: quality = 1 (EF decreases, reset interval)
 *
 * SM-2 interval progression:
 * - First correct (repetition 0): interval = 1 day
 * - Second correct (repetition 1): interval = 6 days
 * - Subsequent correct: interval = previous interval * EF
 * - Any incorrect: reset to interval = 1, repetition = 0
 *
 * Constraints:
 * - Maximum interval: 14 days (SR-05)
 * - Tricky items: 0.5x multiplier if interval > 1 (SR-06)
 * - Minimum EF: 1.3
 *
 * @param interval - Current interval in days
 * @param repetition - Count of consecutive correct reviews
 * @param efactor - Current ease factor
 * @param isCorrect - Whether the user answered correctly
 * @param isTricky - Whether this triad is marked as tricky
 * @returns SM2Result with updated scheduling parameters
 */
export function calculateSM2(
  interval: number,
  repetition: number,
  efactor: number,
  isCorrect: boolean,
  isTricky: boolean
): SM2Result {
  // Binary quality mapping: correct = 4, incorrect = 1
  const quality = isCorrect ? 4 : 1;

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  const efAdjustment = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  let newEF = efactor + efAdjustment;

  // Clamp ease factor to minimum
  if (newEF < MIN_EASE_FACTOR) {
    newEF = MIN_EASE_FACTOR;
  }

  let newInterval: number;
  let newRepetition: number;

  if (quality >= 3) {
    // Correct answer - advance interval
    if (repetition === 0) {
      newInterval = 1;
      newRepetition = 1;
    } else if (repetition === 1) {
      newInterval = 6;
      newRepetition = 2;
    } else {
      newInterval = Math.round(interval * newEF);
      newRepetition = repetition + 1;
    }
  } else {
    // Incorrect answer - reset
    newInterval = 1;
    newRepetition = 0;
  }

  // Apply 14-day cap (SR-05)
  if (newInterval > MAX_REVIEW_INTERVAL_DAYS) {
    newInterval = MAX_REVIEW_INTERVAL_DAYS;
  }

  // Apply tricky multiplier (SR-06) - only if interval > 1
  if (isTricky && newInterval > 1) {
    newInterval = Math.round(newInterval * TRICKY_INTERVAL_MULTIPLIER);
    // Ensure tricky items still get at least 1 day interval
    if (newInterval < 1) {
      newInterval = 1;
    }
  }

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  return {
    interval: newInterval,
    repetition: newRepetition,
    efactor: newEF,
    nextReviewDate: nextDate.toISOString(),
  };
}

/**
 * Get all triads that are due for review
 *
 * A triad is due if:
 * - It has been seen before (performance record exists)
 * - It has a scheduled review date (nextReviewDate is not null)
 * - The review date is in the past or today
 *
 * Never-seen triads are not included (they need Quiz Mode first)
 *
 * @returns Array of triads due for review
 */
export async function getDueTriads(): Promise<Triad[]> {
  const performanceRecord = await loadTriadPerformance();
  const allTriads = getAllTriads();
  const now = new Date();

  return allTriads.filter(triad => {
    const performance = performanceRecord[triad.id];

    // Skip if never seen
    if (!performance) {
      return false;
    }

    // Skip if no review date scheduled
    if (!performance.nextReviewDate) {
      return false;
    }

    // Check if due
    const reviewDate = new Date(performance.nextReviewDate);
    return reviewDate <= now;
  });
}

/**
 * Get count of triads due for review
 *
 * @returns Number of triads due for review
 */
export async function getDueTriadCount(): Promise<number> {
  const dueTriads = await getDueTriads();
  return dueTriads.length;
}

/**
 * Record a review answer and update SM-2 scheduling
 *
 * Updates:
 * - SM-2 fields (interval, repetition, efactor, nextReviewDate)
 * - correctCount/incorrectCount
 * - lastSeenAt
 * - avgResponseTimeMs is NOT updated (Review Mode is untimed)
 *
 * Storage is fire-and-forget with try/catch to avoid blocking UI
 *
 * @param triadId - ID of the triad being reviewed
 * @param isCorrect - Whether the user answered correctly
 */
export async function recordReviewAnswer(
  triadId: string,
  isCorrect: boolean
): Promise<void> {
  try {
    const performanceRecord = await loadTriadPerformance();
    const trickyQuestions = await loadTrickyQuestions();

    // Check if this triad is marked as tricky
    const isTricky = trickyQuestions.some(q => q.triadId === triadId);

    // Get existing performance or create defaults
    const existing = performanceRecord[triadId] ?? {
      correctCount: 0,
      incorrectCount: 0,
      lastSeenAt: '',
      avgResponseTimeMs: 0,
      responseCount: 0,
      interval: 0,
      repetition: 0,
      efactor: DEFAULT_EASE_FACTOR,
      nextReviewDate: null,
    };

    // Calculate new SM-2 values
    const sm2Result = calculateSM2(
      existing.interval,
      existing.repetition,
      existing.efactor,
      isCorrect,
      isTricky
    );

    // Update performance record
    performanceRecord[triadId] = {
      ...existing,
      correctCount: isCorrect ? existing.correctCount + 1 : existing.correctCount,
      incorrectCount: isCorrect ? existing.incorrectCount : existing.incorrectCount + 1,
      lastSeenAt: new Date().toISOString(),
      // avgResponseTimeMs unchanged - Review Mode is untimed
      interval: sm2Result.interval,
      repetition: sm2Result.repetition,
      efactor: sm2Result.efactor,
      nextReviewDate: sm2Result.nextReviewDate,
    };

    // Fire-and-forget save
    saveTriadPerformance(performanceRecord).catch(err => {
      console.error('Failed to save review answer:', err);
    });
  } catch (error) {
    console.error('Failed to record review answer:', error);
  }
}
