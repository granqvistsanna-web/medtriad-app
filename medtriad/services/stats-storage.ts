import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

export interface QuizHistoryEntry {
  date: string;          // ISO date string
  score: number;         // Final score
  correct: number;       // Questions answered correctly
  total: number;         // Total questions (always 10)
}

const DEFAULT_STATS: StoredStats = {
  totalAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  lastPlayedAt: null,
  highScore: 0,
  dailyStreak: 0,
  lastPlayedDate: null,
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
 * Check if new score is a high score and update if so
 * Returns whether it was a new high score
 */
export async function checkHighScore(newScore: number): Promise<boolean> {
  const stats = await loadStats();
  if (newScore > stats.highScore) {
    await saveStats({ ...stats, highScore: newScore });
    return true;
  }
  return false;
}

/**
 * Update stats after completing a quiz
 */
export async function updateAfterQuiz(
  correctCount: number,
  totalQuestions: number,
  maxStreak: number,
  score: number
): Promise<StoredStats> {
  const currentStats = await loadStats();

  // Calculate streak
  const { newStreak } = calculateStreak(
    currentStats.dailyStreak,
    currentStats.lastPlayedDate
  );

  const updatedStats: StoredStats = {
    totalAnswered: currentStats.totalAnswered + totalQuestions,
    totalCorrect: currentStats.totalCorrect + correctCount,
    bestStreak: Math.max(currentStats.bestStreak, maxStreak),
    gamesPlayed: currentStats.gamesPlayed + 1,
    lastPlayedAt: new Date().toISOString(),
    // High score updated separately via checkHighScore
    highScore: Math.max(currentStats.highScore, score),
    dailyStreak: newStreak,
    lastPlayedDate: new Date().toDateString(),
  };

  await saveStats(updatedStats);
  return updatedStats;
}

/**
 * Check if user is new (no games played)
 */
export async function isNewUser(): Promise<boolean> {
  const stats = await loadStats();
  return stats.gamesPlayed === 0;
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
