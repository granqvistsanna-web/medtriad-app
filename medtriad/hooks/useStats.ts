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

export interface StatsData {
  stats: StoredStats | null;
  loading: boolean;
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
}

export function useStats(): StatsData {
  const [stats, setStats] = useState<StoredStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await loadStats();
      setStats(loaded);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
  };
}
