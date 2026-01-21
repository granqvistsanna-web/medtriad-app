import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTierForPoints, checkTierUp } from './mastery';
import { TriadCategory } from '@/types/triad';

const STATS_KEY = '@medtriad_stats';
const HISTORY_KEY = '@medtriad_quiz_history';
const MAX_HISTORY_ENTRIES = 50;

export interface StoredStats {
  totalAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  gamesPlayed: number;
  lastPlayedAt: string | null;
  // Persistence fields
  highScore: number;
  dailyStreak: number;
  lastPlayedDate: string | null;
  // Points-based progression
  totalPoints: number;
  // Tier-up celebration
  pendingTierUp: { tier: number; name: string } | null;
  // Category mastery tracking
  categoryMastery: Record<TriadCategory, CategoryMasteryData>;
  // User personalization
  userName: string | null;
  hasCompletedOnboarding: boolean;
}

export interface QuizHistoryEntry {
  date: string;          // ISO date string
  score: number;         // Final score
  correct: number;       // Questions answered correctly
  total: number;         // Total questions (always 10)
}

export interface CategoryMasteryData {
  correct: number;
  total: number;
}

const DEFAULT_CATEGORY_MASTERY: Record<TriadCategory, CategoryMasteryData> = {
  cardiology: { correct: 0, total: 0 },
  neurology: { correct: 0, total: 0 },
  endocrine: { correct: 0, total: 0 },
  pulmonary: { correct: 0, total: 0 },
  gastroenterology: { correct: 0, total: 0 },
  infectious: { correct: 0, total: 0 },
  hematology: { correct: 0, total: 0 },
  rheumatology: { correct: 0, total: 0 },
  renal: { correct: 0, total: 0 },
  obstetrics: { correct: 0, total: 0 },
};

const DEFAULT_STATS: StoredStats = {
  totalAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  lastPlayedAt: null,
  highScore: 0,
  dailyStreak: 0,
  lastPlayedDate: null,
  totalPoints: 0,
  pendingTierUp: null,
  categoryMastery: DEFAULT_CATEGORY_MASTERY,
  userName: null,
  hasCompletedOnboarding: false,
};

/**
 * Load stats from AsyncStorage
 */
export async function loadStats(): Promise<StoredStats> {
  try {
    const json = await AsyncStorage.getItem(STATS_KEY);
    if (json) {
      return { ...DEFAULT_STATS, ...JSON.parse(json) };
    }
    return DEFAULT_STATS;
  } catch (error) {
    console.error('Failed to load stats:', error);
    return DEFAULT_STATS;
  }
}

/**
 * Save stats to AsyncStorage
 */
export async function saveStats(stats: StoredStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}

/**
 * Calculate new streak based on last played date
 * Uses local date strings to handle timezones correctly
 */
export function calculateStreak(
  currentStreak: number,
  lastPlayedDate: string | null
): { newStreak: number; isNewDay: boolean } {
  const today = new Date().toDateString(); // "Sat Jan 18 2026"

  if (lastPlayedDate === null) {
    // First time playing
    return { newStreak: 1, isNewDay: true };
  }

  if (lastPlayedDate === today) {
    // Already played today - streak unchanged
    return { newStreak: currentStreak, isNewDay: false };
  }

  // Check if last played was yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();

  if (lastPlayedDate === yesterdayString) {
    // Consecutive day - increment streak
    return { newStreak: currentStreak + 1, isNewDay: true };
  }

  // Streak broken - reset to 1
  return { newStreak: 1, isNewDay: true };
}

/**
 * Check if new score is a high score (without saving)
 * Returns whether it would be a new high score
 *
 * Note: This function only checks - it does NOT save.
 * The actual highScore update happens in updateAfterQuiz() which
 * uses Math.max to ensure the highest score is preserved.
 * This avoids race conditions when checkHighScore and updateAfterQuiz
 * are called in sequence.
 */
export async function checkHighScore(newScore: number): Promise<boolean> {
  const stats = await loadStats();
  return newScore > stats.highScore;
}

/**
 * Update stats after completing a quiz
 */
export async function updateAfterQuiz(
  correctCount: number,
  totalQuestions: number,
  maxStreak: number,
  score: number,
  categoryResults?: Record<TriadCategory, CategoryMasteryData>
): Promise<StoredStats> {
  const currentStats = await loadStats();

  // Check for tier-up using points BEFORE adding new score
  const { willTierUp, newTier } = checkTierUp(currentStats.totalPoints, score);

  // Calculate streak
  const { newStreak } = calculateStreak(
    currentStats.dailyStreak,
    currentStats.lastPlayedDate
  );

  // Merge category results if provided
  const mergedCategoryMastery = categoryResults
    ? Object.entries(categoryResults).reduce(
        (acc, [category, { correct, total }]) => {
          const current = currentStats.categoryMastery[category as TriadCategory] ?? { correct: 0, total: 0 };
          return {
            ...acc,
            [category]: {
              correct: current.correct + correct,
              total: current.total + total,
            },
          };
        },
        { ...currentStats.categoryMastery }
      )
    : currentStats.categoryMastery;

  const updatedStats: StoredStats = {
    totalAnswered: currentStats.totalAnswered + totalQuestions,
    totalCorrect: currentStats.totalCorrect + correctCount,
    bestStreak: Math.max(currentStats.bestStreak, maxStreak),
    gamesPlayed: currentStats.gamesPlayed + 1,
    lastPlayedAt: new Date().toISOString(),
    highScore: Math.max(currentStats.highScore, score),
    dailyStreak: newStreak,
    lastPlayedDate: new Date().toDateString(),
    // Accumulate total points for tier progression
    totalPoints: currentStats.totalPoints + score,
    // Set pendingTierUp if tier-up occurred, otherwise preserve existing
    pendingTierUp: willTierUp && newTier
      ? { tier: newTier.tier, name: newTier.name }
      : currentStats.pendingTierUp,
    // Category mastery
    categoryMastery: mergedCategoryMastery,
    // User personalization (preserve from current)
    userName: currentStats.userName,
    hasCompletedOnboarding: currentStats.hasCompletedOnboarding,
  };

  await saveStats(updatedStats);
  return updatedStats;
}

/**
 * Calculate accuracy percentage
 */
export function getAccuracy(stats: StoredStats): number {
  if (stats.totalAnswered === 0) return 0;
  return Math.round((stats.totalCorrect / stats.totalAnswered) * 100);
}

/**
 * Clear all stats (for testing/reset)
 */
export async function clearStats(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STATS_KEY);
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear stats:', error);
  }
}

/**
 * Clear the pending tier-up flag after celebration is shown
 */
export async function clearPendingTierUp(): Promise<void> {
  const stats = await loadStats();
  await saveStats({ ...stats, pendingTierUp: null });
}

/**
 * Load quiz history from AsyncStorage
 */
export async function loadQuizHistory(): Promise<QuizHistoryEntry[]> {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    if (json) return JSON.parse(json);
    return [];
  } catch (error) {
    console.error('Failed to load quiz history:', error);
    return [];
  }
}

/**
 * Save a quiz round to history
 * Prepends new entry (most recent first) and limits to MAX_HISTORY_ENTRIES
 */
export async function saveQuizHistory(entry: QuizHistoryEntry): Promise<void> {
  try {
    const history = await loadQuizHistory();
    const updated = [entry, ...history].slice(0, MAX_HISTORY_ENTRIES);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save quiz history:', error);
  }
}

/**
 * Save user name (from onboarding)
 */
export async function saveUserName(name: string): Promise<void> {
  const stats = await loadStats();
  await saveStats({ ...stats, userName: name });
}

/**
 * Get user name
 */
export async function getUserName(): Promise<string | null> {
  const stats = await loadStats();
  return stats.userName;
}

/**
 * Mark onboarding as completed
 */
export async function completeOnboarding(): Promise<void> {
  const stats = await loadStats();
  await saveStats({ ...stats, hasCompletedOnboarding: true });
}

/**
 * Check if onboarding has been completed
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const stats = await loadStats();
  return stats.hasCompletedOnboarding;
}

export { DEFAULT_CATEGORY_MASTERY };
