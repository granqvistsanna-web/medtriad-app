/**
 * Mastery System
 *
 * Levels are earned by answering questions:
 * - 1 level per 10 questions answered
 * - Maximum level 10 (100 questions)
 */

export const MAX_LEVEL = 10;
export const QUESTIONS_PER_LEVEL = 10;
export const MAX_QUESTIONS = MAX_LEVEL * QUESTIONS_PER_LEVEL; // 100

/**
 * Calculate current mastery level from total questions answered
 * @returns Level 0-10
 */
export function calculateLevel(totalAnswered: number): number {
  if (totalAnswered <= 0) return 0;
  const level = Math.floor(totalAnswered / QUESTIONS_PER_LEVEL);
  return Math.min(level, MAX_LEVEL);
}

/**
 * Get progress within current level (0-1)
 * Returns progress toward next level
 */
export function getProgressInLevel(totalAnswered: number): number {
  if (totalAnswered >= MAX_QUESTIONS) return 1; // Maxed out
  const questionsInCurrentLevel = totalAnswered % QUESTIONS_PER_LEVEL;
  return questionsInCurrentLevel / QUESTIONS_PER_LEVEL;
}

/**
 * Get questions needed to reach next level
 */
export function getQuestionsToNextLevel(totalAnswered: number): number {
  if (totalAnswered >= MAX_QUESTIONS) return 0; // Already maxed
  const questionsInCurrentLevel = totalAnswered % QUESTIONS_PER_LEVEL;
  return QUESTIONS_PER_LEVEL - questionsInCurrentLevel;
}

/**
 * Get total progress toward mastery (0-1)
 * Based on questions answered out of 100
 */
export function getTotalProgress(totalAnswered: number): number {
  return Math.min(totalAnswered / MAX_QUESTIONS, 1);
}

/**
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
