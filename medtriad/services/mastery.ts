/**
 * Mastery System
 *
 * PRIMARY: 6-tier game-based progression system
 * Tiers are earned by completing games (not questions):
 * - Student: 0 games
 * - Intern: 10 games
 * - Resident: 25 games
 * - Doctor: 50 games
 * - Specialist: 100 games
 * - Chief: 200 games
 *
 * Tier functions:
 * - getTierForGames(gamesPlayed) - Get current tier
 * - getNextTier(tierNumber) - Get next tier or null at max
 * - getProgressToNextTier(gamesPlayed) - Progress 0-1 toward next
 *
 * LEGACY: Question-based system kept for Home screen (Phase 12 will migrate)
 * Functions marked @deprecated - use tier functions for new code
 */

// ============================================
// NEW TIER SYSTEM (Game-based)
// ============================================

export interface TierDefinition {
  tier: number;
  name: string;
  gamesRequired: number;
}

export const TIERS: TierDefinition[] = [
  { tier: 1, name: 'Student', gamesRequired: 0 },
  { tier: 2, name: 'Intern', gamesRequired: 10 },
  { tier: 3, name: 'Resident', gamesRequired: 25 },
  { tier: 4, name: 'Doctor', gamesRequired: 50 },
  { tier: 5, name: 'Specialist', gamesRequired: 100 },
  { tier: 6, name: 'Chief', gamesRequired: 200 },
];

/**
 * Get the current tier based on games played
 * Finds the highest tier where gamesRequired <= gamesPlayed
 */
export function getTierForGames(gamesPlayed: number): TierDefinition {
  // Iterate from highest tier to lowest
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (gamesPlayed >= TIERS[i].gamesRequired) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

/**
 * Get the next tier after the current one
 * @param currentTierNumber - 1-indexed tier number
 * @returns Next tier or null if at max
 */
export function getNextTier(currentTierNumber: number): TierDefinition | null {
  const nextIndex = currentTierNumber; // tier is 1-indexed, array is 0-indexed
  return nextIndex < TIERS.length ? TIERS[nextIndex] : null;
}

/**
 * Get progress toward the next tier (0-1)
 * Returns 1 if at max tier (Chief)
 *
 * Examples:
 * - 0 games = Student, progress 0
 * - 5 games = Student, progress 0.5 (halfway to Intern at 10)
 * - 10 games = Intern, progress 0 (just reached Intern)
 * - 199 games = Specialist, progress 0.99
 * - 200 games = Chief, progress 1 (max tier, bar stays full)
 */
export function getProgressToNextTier(gamesPlayed: number): number {
  const currentTier = getTierForGames(gamesPlayed);
  const nextTier = getNextTier(currentTier.tier);

  // At max tier, progress is always 1 (bar stays full)
  if (!nextTier) return 1;

  const gamesInCurrentTier = gamesPlayed - currentTier.gamesRequired;
  const gamesNeededForNext = nextTier.gamesRequired - currentTier.gamesRequired;

  return gamesInCurrentTier / gamesNeededForNext;
}

/**
 * Check if completing the next game will trigger a tier-up
 * Call BEFORE incrementing gamesPlayed to avoid race condition
 * @param gamesPlayedBefore - Current gamesPlayed count (before this game)
 * @returns Object with willTierUp flag and newTier if applicable
 */
export function checkTierUp(
  gamesPlayedBefore: number
): { willTierUp: boolean; newTier: TierDefinition | null } {
  const gamesPlayedAfter = gamesPlayedBefore + 1;
  const tierBefore = getTierForGames(gamesPlayedBefore);
  const tierAfter = getTierForGames(gamesPlayedAfter);

  return {
    willTierUp: tierAfter.tier > tierBefore.tier,
    newTier: tierAfter.tier > tierBefore.tier ? tierAfter : null,
  };
}

// ============================================
// LEGACY SYSTEM (Question-based)
// @deprecated - Keep for Home screen/MasteryBar until Phase 12
// These functions use totalAnswered (questions), not gamesPlayed
// ============================================

export const MAX_LEVEL = 10;
export const QUESTIONS_PER_LEVEL = 10;
export const MAX_QUESTIONS = MAX_LEVEL * QUESTIONS_PER_LEVEL; // 100

/**
 * @deprecated Use getTierForGames() instead
 * Calculate current mastery level from total questions answered
 * @returns Level 0-10
 */
export function calculateLevel(totalAnswered: number): number {
  if (totalAnswered <= 0) return 0;
  const level = Math.floor(totalAnswered / QUESTIONS_PER_LEVEL);
  return Math.min(level, MAX_LEVEL);
}

/**
 * @deprecated Use getProgressToNextTier() instead
 * Get progress within current level (0-1)
 * Returns progress toward next level
 */
export function getProgressInLevel(totalAnswered: number): number {
  if (totalAnswered >= MAX_QUESTIONS) return 1; // Maxed out
  const questionsInCurrentLevel = totalAnswered % QUESTIONS_PER_LEVEL;
  return questionsInCurrentLevel / QUESTIONS_PER_LEVEL;
}

/**
 * @deprecated Tier system uses getProgressToNextTier() instead
 * Get questions needed to reach next level
 */
export function getQuestionsToNextLevel(totalAnswered: number): number {
  if (totalAnswered >= MAX_QUESTIONS) return 0; // Already maxed
  const questionsInCurrentLevel = totalAnswered % QUESTIONS_PER_LEVEL;
  return QUESTIONS_PER_LEVEL - questionsInCurrentLevel;
}

/**
 * @deprecated Tier system uses getProgressToNextTier() instead
 * Get total progress toward mastery (0-1)
 * Based on questions answered out of 100
 */
export function getTotalProgress(totalAnswered: number): number {
  return Math.min(totalAnswered / MAX_QUESTIONS, 1);
}

/**
 * @deprecated Use tier.name from getTierForGames() instead
 * Get level title based on level number
 */
export function getLevelTitle(level: number): string {
  const titles = [
    'Beginner',      // 0
    'Novice',        // 1
    'Apprentice',    // 2
    'Student',       // 3
    'Practitioner',  // 4
    'Specialist',    // 5
    'Expert',        // 6
    'Master',        // 7
    'Virtuoso',      // 8
    'Legend',        // 9
    'Grandmaster',   // 10
  ];
  return titles[Math.min(level, MAX_LEVEL)] || 'Unknown';
}
