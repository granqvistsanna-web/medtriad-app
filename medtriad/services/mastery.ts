/**
 * Mastery System
 *
 * PRIMARY: 6-tier points-based progression system
 * Tiers are earned by accumulating points (rewards skill, not just participation):
 * - Student: 0 points (Tier 1)
 * - Intern: 300 points (Tier 2)
 * - Resident: 1,000 points (Tier 3)
 * - Doctor: 2,500 points (Tier 4)
 * - Specialist: 5,000 points (Tier 5)
 * - Chief: 10,000 points (Tier 6)
 *
 * DIFFICULTY SCALING: Higher tiers have less time per question
 * - Student/Intern (Tier 1-2): 15 seconds
 * - Resident/Doctor (Tier 3-4): 12 seconds
 * - Specialist (Tier 5): 10 seconds
 * - Chief (Tier 6): 8 seconds
 *
 * Tier functions:
 * - getTierForPoints(totalPoints) - Get current tier
 * - getNextTier(tierNumber) - Get next tier or null at max
 * - getProgressToNextTier(totalPoints) - Progress 0-1 toward next
 * - getPointsToNextTier(totalPoints) - Points remaining to level up
 * - getTimerForTier(tierNumber) - Get timer duration for tier
 *
 * LEGACY: Game-based functions kept for backward compatibility
 */

// ============================================
// POINTS-BASED TIER SYSTEM
// ============================================

export interface TierDefinition {
  tier: number;
  name: string;
  pointsRequired: number;
  /** @deprecated Use pointsRequired instead */
  gamesRequired?: number;
}

export const TIERS: TierDefinition[] = [
  { tier: 1, name: 'Student', pointsRequired: 0 },
  { tier: 2, name: 'Intern', pointsRequired: 300 },
  { tier: 3, name: 'Resident', pointsRequired: 1000 },
  { tier: 4, name: 'Doctor', pointsRequired: 2500 },
  { tier: 5, name: 'Specialist', pointsRequired: 5000 },
  { tier: 6, name: 'Chief', pointsRequired: 10000 },
];

/**
 * Timer duration per tier (in seconds)
 * Higher tiers have less time, increasing difficulty
 * - Tiers 1-2 (learning): 15 seconds - forgiving for beginners
 * - Tiers 3-4 (competent): 12 seconds - moderate challenge
 * - Tier 5 (advanced): 10 seconds - increased pressure
 * - Tier 6 (mastery): 8 seconds - genuine difficulty
 */
export const TIER_TIMERS: Record<number, number> = {
  1: 15, // Student
  2: 15, // Intern
  3: 12, // Resident
  4: 12, // Doctor
  5: 10, // Specialist
  6: 8,  // Chief
};

/**
 * Get timer duration for a given tier
 * @param tierNumber - 1-indexed tier number (1=Student, 6=Chief)
 * @returns Timer duration in seconds
 */
export function getTimerForTier(tierNumber: number): number {
  return TIER_TIMERS[tierNumber] ?? 15;
}

/**
 * Get the current tier based on total points
 * Finds the highest tier where pointsRequired <= totalPoints
 */
export function getTierForPoints(totalPoints: number): TierDefinition {
  // Iterate from highest tier to lowest
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (totalPoints >= TIERS[i].pointsRequired) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

/**
 * @deprecated Use getTierForPoints instead
 */
export function getTierForGames(gamesPlayed: number): TierDefinition {
  // Legacy fallback - estimate ~100 points per game
  return getTierForPoints(gamesPlayed * 100);
}

/**
 * Get the next tier after the current one
 * @param currentTierNumber - 1-indexed tier number (1=Student, 2=Intern, etc.)
 * @returns Next tier or null if at max
 *
 * Since tiers are 1-indexed and array is 0-indexed, tier N is at TIERS[N-1].
 * So the NEXT tier (N+1) is at TIERS[N], which equals currentTierNumber.
 */
export function getNextTier(currentTierNumber: number): TierDefinition | null {
  const nextIndex = currentTierNumber; // tier N's next is at index N (since tier 1 is at index 0)
  return nextIndex < TIERS.length ? TIERS[nextIndex] : null;
}

/**
 * Get progress toward the next tier (0-1)
 * Returns 1 if at max tier (Chief)
 *
 * Examples:
 * - 0 points = Student, progress 0
 * - 500 points = Student, progress 0.5 (halfway to Intern at 1000)
 * - 1000 points = Intern, progress 0 (just reached Intern)
 * - 29999 points = Specialist, progress 0.99
 * - 30000 points = Chief, progress 1 (max tier, bar stays full)
 */
export function getProgressToNextTier(totalPoints: number): number {
  const currentTier = getTierForPoints(totalPoints);
  const nextTier = getNextTier(currentTier.tier);

  // At max tier, progress is always 1 (bar stays full)
  if (!nextTier) return 1;

  const pointsInCurrentTier = totalPoints - currentTier.pointsRequired;
  const pointsNeededForNext = nextTier.pointsRequired - currentTier.pointsRequired;

  return pointsInCurrentTier / pointsNeededForNext;
}

/**
 * Get points remaining to reach next tier
 * Returns 0 if at max tier
 */
export function getPointsToNextTier(totalPoints: number): number {
  const currentTier = getTierForPoints(totalPoints);
  const nextTier = getNextTier(currentTier.tier);

  if (!nextTier) return 0;

  return nextTier.pointsRequired - totalPoints;
}

/**
 * Check if adding points will trigger a tier-up
 * @param currentPoints - Current total points (before this quiz)
 * @param pointsToAdd - Points earned this quiz
 * @returns Object with willTierUp flag and newTier if applicable
 */
export function checkTierUp(
  currentPoints: number,
  pointsToAdd: number = 0
): { willTierUp: boolean; newTier: TierDefinition | null } {
  const pointsAfter = currentPoints + pointsToAdd;
  const tierBefore = getTierForPoints(currentPoints);
  const tierAfter = getTierForPoints(pointsAfter);

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
