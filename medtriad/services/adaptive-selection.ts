import { loadTriadPerformance } from '@/services/triad-performance-storage';
import { loadTrickyQuestions } from '@/services/study-storage';
import { getAllTriads } from '@/services/triads';
import { Triad, TriadCategory } from '@/types/triad';
import { TriadPerformance, TriadPerformanceRecord } from '@/types/triad-performance';

/**
 * Difficulty level for a triad based on user's historical performance
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'new';

/**
 * Parameters for calculating triad weight
 */
export interface CalculateTriadWeightParams {
  triad: Triad;
  performance: TriadPerformance | null;
  trickyIds: Set<string>;
  weakCategories: Set<TriadCategory>;
  userTier: number;
}

/**
 * Classify triad difficulty based on user's historical performance
 * ADPT-03: easy/medium/hard classification
 * ADPT-05: Requires minimum 3 attempts
 *
 * @param performance - Performance data for the triad, or null if never seen
 * @returns Difficulty level: 'new' (< 3 attempts), 'easy' (>= 85%), 'medium' (51-84%), 'hard' (<= 50%)
 */
export function classifyDifficulty(performance: TriadPerformance | null): DifficultyLevel {
  // No performance data means triad is new
  if (performance === null) {
    return 'new';
  }

  const totalAttempts = performance.correctCount + performance.incorrectCount;

  // ADPT-05: Minimum 3 attempts required for classification
  if (totalAttempts < 3) {
    return 'new';
  }

  const accuracy = performance.correctCount / totalAttempts;

  // Standard thresholds from educational testing research
  // Source: https://www.washington.edu/assessment/scanning-scoring/scoring/reports/item-analysis/
  if (accuracy >= 0.85) return 'easy';   // 85%+ accuracy
  if (accuracy >= 0.51) return 'medium'; // 51-84% accuracy
  return 'hard';                          // <= 50% accuracy
}

/**
 * Identify categories where user has below-average accuracy
 * ADPT-01: Weak category detection
 *
 * @param performanceRecord - Map of triad ID to performance data
 * @param allTriads - All available triads for category grouping
 * @returns Set of categories with accuracy below overall average
 */
export function getWeakCategories(
  performanceRecord: TriadPerformanceRecord,
  allTriads: Triad[]
): Set<TriadCategory> {
  const weakCategories = new Set<TriadCategory>();

  // Group triads by category and aggregate performance
  const categoryStats: Record<string, { correct: number; total: number }> = {};

  // Initialize stats for each category that has triads
  allTriads.forEach(triad => {
    if (!categoryStats[triad.category]) {
      categoryStats[triad.category] = { correct: 0, total: 0 };
    }

    const performance = performanceRecord[triad.id];
    if (performance) {
      const attempts = performance.correctCount + performance.incorrectCount;
      categoryStats[triad.category].correct += performance.correctCount;
      categoryStats[triad.category].total += attempts;
    }
  });

  // Calculate overall accuracy
  let totalCorrect = 0;
  let totalAttempts = 0;
  Object.values(categoryStats).forEach(({ correct, total }) => {
    totalCorrect += correct;
    totalAttempts += total;
  });

  // No data yet - return empty set
  if (totalAttempts === 0) {
    return weakCategories;
  }

  const overallAccuracy = totalCorrect / totalAttempts;

  // Mark categories with accuracy below overall average as weak
  Object.entries(categoryStats).forEach(([category, { correct, total }]) => {
    // Skip categories with no attempts yet
    if (total === 0) return;

    const categoryAccuracy = correct / total;
    if (categoryAccuracy < overallAccuracy) {
      weakCategories.add(category as TriadCategory);
    }
  });

  return weakCategories;
}

/**
 * Calculate weight for a triad based on multiple factors
 * ADPT-01: Weak categories get 2x weight
 * ADPT-02: Tricky questions get 3x weight
 * ADPT-04: Tier-based difficulty weighting
 *
 * Multipliers stack multiplicatively.
 *
 * @param params - Weight calculation parameters
 * @returns Weight value (minimum 1.0)
 */
export function calculateTriadWeight(params: CalculateTriadWeightParams): number {
  const { triad, performance, trickyIds, weakCategories, userTier } = params;

  let weight = 1.0; // Base weight - every triad has a chance

  // ADPT-01: Prioritize weak categories (2x)
  if (weakCategories.has(triad.category)) {
    weight *= 2.0;
  }

  // ADPT-02: Prioritize tricky-marked questions (3x)
  if (trickyIds.has(triad.id)) {
    weight *= 3.0;
  }

  // ADPT-04: Tier-based difficulty adjustment
  // For tiers 1-2 (beginners): no adjustment - even distribution
  // For tiers 3-4: hard triads get 1.3x
  // For tiers 5-6: hard triads get 1.5x, medium triads get 1.2x
  const difficulty = classifyDifficulty(performance);

  if (userTier >= 5) {
    // Advanced users (tier 5-6) - prioritize hard and medium
    if (difficulty === 'hard') {
      weight *= 1.5;
    } else if (difficulty === 'medium') {
      weight *= 1.2;
    }
  } else if (userTier >= 3) {
    // Intermediate users (tier 3-4) - prioritize hard
    if (difficulty === 'hard') {
      weight *= 1.3;
    }
  }
  // Tiers 1-2: no difficulty adjustment (beginners get even distribution)

  return weight;
}

/**
 * Weighted random selection using cumulative weights method
 * Selects `count` unique items without replacement
 *
 * Source: https://trekhleb.medium.com/weighted-random-in-javascript-4748ab3a1500
 *
 * @param items - Array of items to select from
 * @param weights - Corresponding weights for each item
 * @param count - Number of items to select
 * @returns Array of selected items
 */
export function weightedRandomSelect<T>(items: T[], weights: number[], count: number): T[] {
  // Edge case: if count exceeds items, return all items
  if (count >= items.length) {
    return [...items];
  }

  const selected: T[] = [];
  const remainingItems = [...items];
  const remainingWeights = [...weights];

  while (selected.length < count && remainingItems.length > 0) {
    // Calculate cumulative weights
    const cumulativeWeights: number[] = [];
    remainingWeights.reduce((sum, weight, i) => {
      const cumulative = sum + weight;
      cumulativeWeights[i] = cumulative;
      return cumulative;
    }, 0);

    // Get random number between 0 and total weight
    const totalWeight = cumulativeWeights[cumulativeWeights.length - 1];
    const random = Math.random() * totalWeight;

    // Find first cumulative weight >= random
    const index = cumulativeWeights.findIndex(w => w >= random);

    // Add selected item
    selected.push(remainingItems[index]);

    // Remove selected item from remaining pool
    remainingItems.splice(index, 1);
    remainingWeights.splice(index, 1);
  }

  return selected;
}

/**
 * Select triads using adaptive weighting based on user performance
 *
 * Prioritizes:
 * - ADPT-01: Weak categories (below-average accuracy)
 * - ADPT-02: Tricky-marked questions
 * - ADPT-04: Difficulty based on user tier
 *
 * @param count - Number of triads to select
 * @param userTier - User's current tier (1-6)
 * @returns Array of selected triads
 */
export async function selectAdaptiveTriads(count: number, userTier: number): Promise<Triad[]> {
  try {
    // Load all required data
    const performanceRecord = await loadTriadPerformance();
    const trickyQuestions = await loadTrickyQuestions();
    const allTriads = getAllTriads();

    // Build tricky IDs set for efficient lookup
    const trickyIds = new Set(trickyQuestions.map(q => q.triadId));

    // Calculate weak categories based on performance
    const weakCategories = getWeakCategories(performanceRecord, allTriads);

    // Calculate weights for all triads
    const weights = allTriads.map(triad =>
      calculateTriadWeight({
        triad,
        performance: performanceRecord[triad.id] ?? null,
        trickyIds,
        weakCategories,
        userTier,
      })
    );

    // Select triads using weighted random selection
    const selectedTriads = weightedRandomSelect(allTriads, weights, count);

    // Dev logging for verification
    if (__DEV__) {
      console.log('[Adaptive] Selected triads:', selectedTriads.map(t => t.id));
    }

    return selectedTriads;
  } catch (error) {
    console.error('Failed to select adaptive triads:', error);
    // Fallback to random selection on error
    const allTriads = getAllTriads();
    const shuffled = [...allTriads].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
