/**
 * Developer Tools Service
 *
 * Storage manipulation functions for dev testing.
 * These functions should ONLY be used in __DEV__ mode.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadStats, saveStats, StoredStats } from './stats-storage';
import { TIERS } from './mastery';

// Storage keys (matching existing services)
const STATS_KEY = '@medtriad_stats';
const HISTORY_KEY = '@medtriad_quiz_history';
const SETTINGS_KEY = '@medtriad_settings';

// All app storage keys for clearing
const ALL_APP_KEYS = [STATS_KEY, HISTORY_KEY, SETTINGS_KEY];

/**
 * Reset onboarding state
 * Sets gamesPlayed to 0 so app shows onboarding on next launch.
 * Preserves other stats (totalAnswered, bestStreak, etc.)
 */
export async function resetOnboarding(): Promise<void> {
  const stats = await loadStats();
  const updated: StoredStats = {
    ...stats,
    gamesPlayed: 0,
    totalPoints: 0,
  };
  await saveStats(updated);
}

/**
 * Set user to a specific tier level
 * @param tierNumber - Tier number 1-6 (Student to Chief)
 * @throws Error if tierNumber is invalid
 */
export async function setUserTier(tierNumber: number): Promise<void> {
  const tier = TIERS.find(t => t.tier === tierNumber);
  if (!tier) {
    throw new Error(`Invalid tier number: ${tierNumber}. Must be 1-6.`);
  }

  const stats = await loadStats();
  const updated: StoredStats = {
    ...stats,
    // Set points to just past the tier threshold
    totalPoints: tier.pointsRequired + 50,
    // Ensure not treated as new user
    gamesPlayed: Math.max(stats.gamesPlayed, 1),
  };
  await saveStats(updated);
}

/**
 * Set a pending tier-up celebration
 * Used to test tier-up animation without earning it.
 * @param tier - Tier number to celebrate
 * @param name - Tier name (e.g., "Intern")
 */
export async function setPendingTierUp(tier: number, name: string): Promise<void> {
  const stats = await loadStats();
  const updated: StoredStats = {
    ...stats,
    pendingTierUp: { tier, name },
    // Ensure not treated as new user
    gamesPlayed: Math.max(stats.gamesPlayed, 1),
  };
  await saveStats(updated);
}

/**
 * Clear all app data
 * Removes stats, quiz history, and settings.
 * Does NOT use AsyncStorage.clear() which would affect other apps.
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(ALL_APP_KEYS);
  } catch (error) {
    console.error('Failed to clear all data:', error);
    // Rethrow to let caller handle (UI shows error state)
    throw error;
  }
}
