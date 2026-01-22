import seedrandom from 'seedrandom';
import { TriadCategory, Triad } from '@/types/triad';
import { QuizQuestion } from '@/types';
import { DailyChallengeType, DailyChallengeConfig, DailyChallengeState } from '@/types/daily-challenge';
import { loadStats, saveStats, getISOWeek, getWeekStartDate, calculateStreak } from './stats-storage';
import { getAllTriads } from './triads';
import { generateQuestion } from './question-generator';

/**
 * Convert Date to ISO date string (YYYY-MM-DD) in local timezone
 * This is locale-safe and ensures consistent date comparison
 */
function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as a seed string (YYYY-MM-DD format)
 */
export function getDateSeed(date?: Date): string {
  const d = date || new Date();
  return d.toISOString().split('T')[0];
}

/**
 * Get current ISO week string (e.g., "2026-W04")
 */
export function getCurrentWeek(): string {
  return getISOWeek(new Date());
}

/**
 * Deterministically select challenge type based on date
 * Returns 'speed', 'category', or 'full' with roughly equal distribution
 */
export function getChallengeTypeForDate(dateSeed?: string): DailyChallengeType {
  const seed = dateSeed || getDateSeed();
  const rng = seedrandom(seed);
  const value = Math.floor(rng() * 3);

  if (value === 0) return 'speed';
  if (value === 1) return 'category';
  return 'full';
}

/**
 * Deterministically select category for 'category' challenge type
 */
export function getCategoryForDate(dateSeed?: string): TriadCategory {
  const seed = dateSeed || getDateSeed();
  const rng = seedrandom(`${seed}-category`);

  const categories: TriadCategory[] = [
    'cardiology',
    'neurology',
    'endocrine',
    'pulmonary',
    'gastroenterology',
    'infectious',
    'hematology',
    'rheumatology',
    'renal',
    'obstetrics',
  ];

  const index = Math.floor(rng() * categories.length);
  return categories[index];
}

/**
 * Get configuration for today's daily challenge
 */
export function getDailyChallengeConfig(dateSeed?: string): DailyChallengeConfig {
  const type = getChallengeTypeForDate(dateSeed);

  if (type === 'speed') {
    return {
      type: 'speed',
      questionCount: 5,
      questionTime: 7,
      displayName: 'Speed Round',
    };
  }

  if (type === 'category') {
    const category = getCategoryForDate(dateSeed);
    const categoryNames: Record<TriadCategory, string> = {
      cardiology: 'Cardiology',
      neurology: 'Neurology',
      endocrine: 'Endocrine',
      pulmonary: 'Pulmonary',
      gastroenterology: 'Gastroenterology',
      infectious: 'Infectious Disease',
      hematology: 'Hematology',
      rheumatology: 'Rheumatology',
      renal: 'Renal',
      obstetrics: 'Obstetrics',
    };

    return {
      type: 'category',
      questionCount: 10,
      questionTime: 15,
      category,
      displayName: `${categoryNames[category]} Focus`,
    };
  }

  // type === 'full'
  return {
    type: 'full',
    questionCount: 10,
    questionTime: 15,
    displayName: 'Full Challenge',
  };
}

/**
 * Generate questions for daily challenge using deterministic shuffle
 */
export function generateDailyChallengeQuestions(
  config: DailyChallengeConfig,
  dateSeed?: string
): QuizQuestion[] {
  const seed = dateSeed || getDateSeed();
  const rng = seedrandom(seed);

  let allTriads = getAllTriads();

  // Filter by category if needed
  if (config.category) {
    allTriads = allTriads.filter(t => t.category === config.category);
  }

  // Seeded shuffle using Fisher-Yates
  const shuffled = [...allTriads];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Take the required number of questions
  const selectedTriads = shuffled.slice(0, Math.min(config.questionCount, shuffled.length));

  // Generate questions
  return selectedTriads.map(triad => generateQuestion(triad));
}

/**
 * Get the state of today's daily challenge
 */
export async function getDailyChallengeState(): Promise<DailyChallengeState> {
  const stats = await loadStats();
  const today = getDateSeed();

  const completedToday = stats.dailyChallengeCompletedDate === today;

  return {
    completedToday,
    completedAt: completedToday ? stats.dailyChallengeCompletedDate : null,
    challengeConfig: getDailyChallengeConfig(),
  };
}

/**
 * Complete today's daily challenge
 * Updates completion tracking, streak, and checks for streak freeze reward
 */
export async function completeDailyChallenge(): Promise<{
  newStreak: number;
  earnedStreakFreeze: boolean;
  streakMilestone: number | null;
}> {
  const stats = await loadStats();
  const today = getDateSeed();

  // Verify not already completed
  if (stats.dailyChallengeCompletedDate === today) {
    throw new Error('Daily challenge already completed today');
  }

  // Update completion date
  stats.dailyChallengeCompletedDate = today;

  // Calculate streak (using existing logic, pass streak freeze for auto-use)
  const { newStreak, usedStreakFreeze } = calculateStreak(
    stats.dailyStreak,
    stats.lastPlayedDate,
    stats.streakFreezeCount
  );
  stats.dailyStreak = newStreak;
  stats.lastPlayedDate = toISODateString(new Date());

  // Consume streak freeze if used
  if (usedStreakFreeze) {
    stats.streakFreezeCount = Math.max(0, stats.streakFreezeCount - 1);
  }

  // Check if week changed
  const currentWeekStart = getWeekStartDate(new Date());
  if (stats.weekStartDate !== currentWeekStart) {
    // New week - reset counter
    stats.dailyChallengesCompletedThisWeek = 0;
    stats.weekStartDate = currentWeekStart;
  }

  // Increment challenges completed this week
  stats.dailyChallengesCompletedThisWeek += 1;

  // Check for streak freeze reward
  let earnedStreakFreeze = false;
  const currentWeek = getCurrentWeek();

  if (
    stats.dailyChallengesCompletedThisWeek === 7 &&
    stats.streakFreezeLastEarnedWeek !== currentWeek
  ) {
    // Earned a streak freeze!
    stats.streakFreezeCount = 1;
    stats.streakFreezeLastEarnedWeek = currentWeek;
    earnedStreakFreeze = true;
  }

  // Check for streak milestones
  let streakMilestone: number | null = null;
  if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
    streakMilestone = newStreak;
  }

  // Save stats
  await saveStats(stats);

  return {
    newStreak,
    earnedStreakFreeze,
    streakMilestone,
  };
}

/**
 * Use a streak freeze to preserve the current streak
 * Returns true if freeze was used, false if not available or not needed
 */
export async function useStreakFreeze(): Promise<boolean> {
  const stats = await loadStats();

  // Check if we have a freeze available
  if (stats.streakFreezeCount <= 0) {
    return false;
  }

  // Check if streak would be lost
  const today = toISODateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = toISODateString(yesterday);

  // If last played was today or yesterday, streak is safe
  if (stats.lastPlayedDate === today || stats.lastPlayedDate === yesterdayString) {
    return false;
  }

  // Streak would be lost - use the freeze
  stats.streakFreezeCount = 0;
  // Don't reset dailyStreak - that's the point of the freeze
  await saveStats(stats);

  return true;
}

/**
 * Check if user can use a streak freeze (has one and would lose streak)
 */
export async function canUseStreakFreeze(): Promise<boolean> {
  const stats = await loadStats();

  if (stats.streakFreezeCount <= 0) {
    return false;
  }

  // Check if streak would be lost
  const today = toISODateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = toISODateString(yesterday);

  // If last played was today or yesterday, streak is safe
  if (stats.lastPlayedDate === today || stats.lastPlayedDate === yesterdayString) {
    return false;
  }

  return true;
}
