import { TriadCategory } from './triad';

/**
 * Daily challenge variant types
 */
export type DailyChallengeType = 'speed' | 'category' | 'full';

/**
 * Configuration for a daily challenge
 */
export interface DailyChallengeConfig {
  /** Challenge variant type */
  type: DailyChallengeType;

  /** Number of questions in this challenge */
  questionCount: number;

  /** Time limit per question (seconds) */
  questionTime: number;

  /** Category to focus on (only for 'category' type) */
  category?: TriadCategory;

  /** Human-readable name for the challenge */
  displayName: string;
}

/**
 * Current state of today's daily challenge
 */
export interface DailyChallengeState {
  /** Whether the user has completed today's challenge */
  completedToday: boolean;

  /** ISO timestamp of when the challenge was completed (null if not completed) */
  completedAt: string | null;

  /** Configuration for today's challenge */
  challengeConfig: DailyChallengeConfig;
}

/**
 * Streak freeze state - earned after completing 7 daily challenges in a week
 */
export interface StreakFreezeState {
  /** Number of streak freezes available (0 or 1, max 1) */
  count: number;

  /** ISO week string when the freeze was last earned (e.g., "2026-W04") */
  lastEarnedWeek: string | null;
}
