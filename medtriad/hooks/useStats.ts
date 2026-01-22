import { useState, useEffect, useCallback } from 'react';
import {
  StoredStats,
  CategoryMasteryData,
  DEFAULT_CATEGORY_MASTERY,
  loadStats,
  updateAfterQuiz,
  getAccuracy,
  checkHighScore as checkHighScoreStorage,
  clearPendingTierUp as clearPendingTierUpStorage,
} from '@/services/stats-storage';
import { TriadCategory } from '@/types/triad';
import {
  calculateLevel,
  getProgressInLevel,
  getQuestionsToNextLevel,
  getLevelTitle,
  // Points-based tier system
  TierDefinition,
  getTierForPoints,
  getProgressToNextTier,
  getNextTier,
  getPointsToNextTier,
} from '@/services/mastery';
import { getDueTriadCount } from '@/services/spaced-repetition';
import { getDailyChallengeState } from '@/services/daily-challenge';
import { DailyChallengeState } from '@/types/daily-challenge';

export interface StatsData {
  stats: StoredStats | null;
  loading: boolean;
  error: Error | null;
  isNewUser: boolean;
  accuracy: number;
  // Legacy (question-based) - kept for backward compatibility
  masteryLevel: number;
  masteryProgress: number;
  questionsToNextLevel: number;
  levelTitle: string;
  // Points-based tier system
  tier: TierDefinition;
  tierProgress: number;
  nextTier: TierDefinition | null;
  totalPoints: number;
  pointsToNextTier: number;
  // Tier-up celebration
  pendingTierUp: { tier: number; name: string } | null;
  clearPendingTierUp: () => Promise<void>;
  // Other stats
  dailyStreak: number;
  highScore: number;
  refresh: () => Promise<void>;
  recordQuizResult: (
    correct: number,
    total: number,
    streak: number,
    score: number,
    categoryResults?: Record<TriadCategory, CategoryMasteryData>
  ) => Promise<void>;
  checkHighScore: (score: number) => Promise<boolean>;
  // Category mastery
  categoryMastery: Record<TriadCategory, CategoryMasteryData>;
  getCategoryPercent: (category: TriadCategory) => number;
  // User personalization
  userName: string | null;
  // Spaced repetition
  dueCount: number;
  // Daily challenge
  dailyChallengeState: DailyChallengeState | null;
  dailyChallengeLoading: boolean;
  refreshDailyChallenge: () => Promise<void>;
}

export function useStats(): StatsData {
  const [stats, setStats] = useState<StoredStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [dailyChallengeState, setDailyChallengeState] = useState<DailyChallengeState | null>(null);
  const [dailyChallengeLoading, setDailyChallengeLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadStats();
      setStats(loaded);

      // Fetch due triads count
      const count = await getDueTriadCount();
      setDueCount(count);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load stats');
      console.error('Failed to load stats:', error);
      setError(error);
      setDueCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDailyChallenge = useCallback(async () => {
    setDailyChallengeLoading(true);
    try {
      const state = await getDailyChallengeState();
      setDailyChallengeState(state);
    } catch (err) {
      console.error('Failed to load daily challenge state:', err);
      setDailyChallengeState(null);
    } finally {
      setDailyChallengeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchDailyChallenge();
  }, [fetchStats, fetchDailyChallenge]);

  const recordQuizResult = useCallback(
    async (
      correct: number,
      total: number,
      streak: number,
      score: number,
      categoryResults?: Record<TriadCategory, CategoryMasteryData>
    ) => {
      const updated = await updateAfterQuiz(correct, total, streak, score, categoryResults);
      setStats(updated);
    },
    []
  );

  const checkHighScore = useCallback(
    async (score: number): Promise<boolean> => {
      const isNew = await checkHighScoreStorage(score);
      if (isNew) {
        await fetchStats(); // Refresh to get updated high score
      }
      return isNew;
    },
    [fetchStats]
  );

  const handleClearPendingTierUp = useCallback(async () => {
    await clearPendingTierUpStorage();
    await fetchStats(); // Refresh to reflect cleared state
  }, [fetchStats]);

  // Derived values - Legacy (question-based)
  const isNewUser = stats?.gamesPlayed === 0;
  const accuracy = stats ? getAccuracy(stats) : 0;
  const totalAnswered = stats?.totalAnswered ?? 0;
  const masteryLevel = calculateLevel(totalAnswered);
  const masteryProgress = getProgressInLevel(totalAnswered);
  const questionsToNextLevel = getQuestionsToNextLevel(totalAnswered);
  const levelTitle = getLevelTitle(masteryLevel);
  const dailyStreak = stats?.dailyStreak ?? 0;
  const highScore = stats?.highScore ?? 0;
  const userName = stats?.userName ?? null;

  // Derived values - Points-based tier system
  const totalPoints = stats?.totalPoints ?? 0;
  const tier = getTierForPoints(totalPoints);
  const tierProgress = getProgressToNextTier(totalPoints);
  const nextTier = getNextTier(tier.tier);
  const pointsToNextTier = getPointsToNextTier(totalPoints);

  // Tier-up celebration
  const pendingTierUp = stats?.pendingTierUp ?? null;

  // Category mastery
  const categoryMastery = stats?.categoryMastery ?? DEFAULT_CATEGORY_MASTERY;

  const getCategoryPercent = useCallback((category: TriadCategory): number => {
    const data = categoryMastery[category];
    if (!data || data.total === 0) return 0;
    return Math.round((data.correct / data.total) * 100);
  }, [categoryMastery]);

  return {
    stats,
    loading,
    error,
    isNewUser,
    accuracy,
    // Legacy
    masteryLevel,
    masteryProgress,
    questionsToNextLevel,
    levelTitle,
    // Points-based tier system
    tier,
    tierProgress,
    nextTier,
    totalPoints,
    pointsToNextTier,
    // Tier-up celebration
    pendingTierUp,
    clearPendingTierUp: handleClearPendingTierUp,
    // Other stats
    dailyStreak,
    highScore,
    refresh: fetchStats,
    recordQuizResult,
    checkHighScore,
    // Category mastery
    categoryMastery,
    getCategoryPercent,
    // User personalization
    userName,
    // Spaced repetition
    dueCount,
    // Daily challenge
    dailyChallengeState,
    dailyChallengeLoading,
    refreshDailyChallenge: fetchDailyChallenge,
  };
}
