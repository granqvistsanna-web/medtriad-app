/**
 * Performance data for a single triad
 */
export interface TriadPerformance {
  /** Number of times answered correctly */
  correctCount: number;

  /** Number of times answered incorrectly (including timeouts) */
  incorrectCount: number;

  /** ISO date string of when this triad was last answered */
  lastSeenAt: string;

  /** Average response time in milliseconds (rolling average) */
  avgResponseTimeMs: number;

  /** Number of responses used to calculate avgResponseTimeMs */
  responseCount: number;

  /** Days between reviews (SM-2 interval) */
  interval: number;

  /** Count of consecutive correct reviews (SM-2 repetition) */
  repetition: number;

  /** Ease factor for interval calculation (min 1.3, default 2.5) */
  efactor: number;

  /** ISO date string of next scheduled review date, null if never reviewed */
  nextReviewDate: string | null;
}

/**
 * Map of triad ID to performance data
 */
export type TriadPerformanceRecord = Record<string, TriadPerformance>;
