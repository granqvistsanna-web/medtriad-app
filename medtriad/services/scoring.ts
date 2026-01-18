import { QUESTION_TIME } from '@/types/quiz-state';

/**
 * Scoring constants for quiz game mechanics
 */
export const SCORING = {
  /** Base points for a correct answer */
  BASE_POINTS: 100,
  /** Maximum speed bonus for answering immediately */
  MAX_SPEED_BONUS: 50,
  /** Bonus points for getting all questions correct in a round */
  PERFECT_ROUND_BONUS: 500,
  /** Number of consecutive correct answers to increase combo tier */
  COMBO_THRESHOLD: 3,
  /** Maximum combo multiplier tier (1x, 2x, 3x) */
  MAX_COMBO_TIER: 3,
  /** Total time per question (matches QUESTION_TIME) */
  TOTAL_TIME: QUESTION_TIME,
} as const;

/**
 * Calculate speed bonus based on remaining time
 * Uses a front-loaded quadratic curve that rewards fast answers more heavily
 *
 * @param timeRemaining - Seconds remaining when answer was submitted
 * @param totalTime - Total seconds allowed for the question
 * @returns Speed bonus points (0 to MAX_SPEED_BONUS)
 *
 * @example
 * calculateSpeedBonus(12, 12) // 50 (full time remaining = max bonus)
 * calculateSpeedBonus(6, 12)  // 12 (half time = ~25% of max due to quadratic)
 * calculateSpeedBonus(0, 12)  // 0 (timeout = no bonus)
 */
export function calculateSpeedBonus(timeRemaining: number, totalTime: number): number {
  if (timeRemaining <= 0 || totalTime <= 0) {
    return 0;
  }

  const ratio = timeRemaining / totalTime;
  // Quadratic curve: faster answers get disproportionately higher bonus
  return Math.floor(SCORING.MAX_SPEED_BONUS * ratio * ratio);
}

/**
 * Get combo tier based on consecutive correct answers
 * Tier increases every COMBO_THRESHOLD correct answers
 *
 * @param consecutiveCorrect - Number of consecutive correct answers
 * @returns Combo tier (1, 2, or 3)
 *
 * @example
 * getComboTier(0)  // 1 (tier 1: 1x multiplier)
 * getComboTier(2)  // 1 (still tier 1)
 * getComboTier(3)  // 2 (tier 2: 2x multiplier)
 * getComboTier(5)  // 2 (still tier 2)
 * getComboTier(6)  // 3 (tier 3: 3x multiplier)
 * getComboTier(10) // 3 (max tier)
 */
export function getComboTier(consecutiveCorrect: number): number {
  if (consecutiveCorrect < SCORING.COMBO_THRESHOLD) {
    return 1;
  }
  if (consecutiveCorrect < SCORING.COMBO_THRESHOLD * 2) {
    return 2;
  }
  return SCORING.MAX_COMBO_TIER;
}

/**
 * Points breakdown for a single answer
 */
export interface PointsBreakdown {
  /** Base points (100) */
  base: number;
  /** Speed bonus (0-50) */
  speedBonus: number;
  /** Combo multiplier (1, 2, or 3) */
  multiplier: number;
  /** Total points earned: (base + speedBonus) * multiplier */
  total: number;
}

/**
 * Calculate total points for a correct answer
 * Combines base points, speed bonus, and applies combo multiplier
 *
 * @param timeRemaining - Seconds remaining when answer was submitted
 * @param totalTime - Total seconds allowed for the question
 * @param comboTier - Current combo multiplier tier (1, 2, or 3)
 * @returns Points breakdown with base, speedBonus, multiplier, and total
 *
 * @example
 * calculateAnswerPoints(12, 12, 1) // { base: 100, speedBonus: 50, multiplier: 1, total: 150 }
 * calculateAnswerPoints(12, 12, 3) // { base: 100, speedBonus: 50, multiplier: 3, total: 450 }
 * calculateAnswerPoints(0, 12, 1)  // { base: 100, speedBonus: 0, multiplier: 1, total: 100 }
 */
export function calculateAnswerPoints(
  timeRemaining: number,
  totalTime: number,
  comboTier: number
): PointsBreakdown {
  const base = SCORING.BASE_POINTS;
  const speedBonus = calculateSpeedBonus(timeRemaining, totalTime);
  const multiplier = comboTier;
  const total = (base + speedBonus) * multiplier;

  return { base, speedBonus, multiplier, total };
}

/**
 * Check if round was perfect (all questions correct)
 *
 * @param correctCount - Number of correct answers
 * @param totalQuestions - Total number of questions in round
 * @returns True if all answers were correct
 */
export function isPerfectRound(correctCount: number, totalQuestions: number): boolean {
  return correctCount === totalQuestions && totalQuestions > 0;
}
