import AsyncStorage from '@react-native-async-storage/async-storage';
import { TriadPerformance, TriadPerformanceRecord } from '@/types/triad-performance';

const TRIAD_PERFORMANCE_KEY = '@medtriad_triad_performance';

/**
 * Load all triad performance data from AsyncStorage
 */
export async function loadTriadPerformance(): Promise<TriadPerformanceRecord> {
  try {
    const json = await AsyncStorage.getItem(TRIAD_PERFORMANCE_KEY);
    if (json) {
      return JSON.parse(json);
    }
    return {};
  } catch (error) {
    console.error('Failed to load triad performance:', error);
    return {};
  }
}

/**
 * Save triad performance record to AsyncStorage
 */
export async function saveTriadPerformance(record: TriadPerformanceRecord): Promise<void> {
  try {
    await AsyncStorage.setItem(TRIAD_PERFORMANCE_KEY, JSON.stringify(record));
  } catch (error) {
    console.error('Failed to save triad performance:', error);
  }
}

/**
 * Record an answer for a specific triad
 * Updates correctCount/incorrectCount, lastSeenAt, and rolling average response time
 */
export async function recordTriadAnswer(
  triadId: string,
  isCorrect: boolean,
  responseTimeMs: number
): Promise<void> {
  try {
    const record = await loadTriadPerformance();

    // Get existing performance or initialize
    const existing = record[triadId] ?? {
      correctCount: 0,
      incorrectCount: 0,
      lastSeenAt: '',
      avgResponseTimeMs: 0,
      responseCount: 0,
      interval: 0,
      repetition: 0,
      efactor: 2.5,
      nextReviewDate: null,
    };

    // Update counts
    const correctCount = isCorrect ? existing.correctCount + 1 : existing.correctCount;
    const incorrectCount = isCorrect ? existing.incorrectCount : existing.incorrectCount + 1;

    // Update rolling average response time
    const oldAvg = existing.avgResponseTimeMs;
    const oldCount = existing.responseCount;
    const newAvg = ((oldAvg * oldCount) + responseTimeMs) / (oldCount + 1);

    // Create updated performance
    const updated: TriadPerformance = {
      correctCount,
      incorrectCount,
      lastSeenAt: new Date().toISOString(),
      avgResponseTimeMs: newAvg,
      responseCount: oldCount + 1,
      interval: existing.interval,
      repetition: existing.repetition,
      efactor: existing.efactor,
      nextReviewDate: existing.nextReviewDate,
    };

    // Save updated record
    record[triadId] = updated;
    await saveTriadPerformance(record);
  } catch (error) {
    console.error('Failed to record triad answer:', error);
  }
}

/**
 * Get performance data for a specific triad
 * Returns null if triad has not been tracked yet
 */
export async function getTriadPerformance(triadId: string): Promise<TriadPerformance | null> {
  try {
    const record = await loadTriadPerformance();
    return record[triadId] ?? null;
  } catch (error) {
    console.error('Failed to get triad performance:', error);
    return null;
  }
}
