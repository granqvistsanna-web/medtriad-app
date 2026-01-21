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
}

/**
 * Map of triad ID to performance data
 */
export type TriadPerformanceRecord = Record<string, TriadPerformance>;
