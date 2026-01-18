import { useState, useEffect, useCallback } from 'react';
import {
  StoredStats,
  loadStats,
  updateAfterQuiz,
  getAccuracy,
  checkHighScore as checkHighScoreStorage,
} from '@/services/stats-storage';
import {
  calculateLevel,
  getProgressInLevel,
  getQuestionsToNextLevel,
  getLevelTitle,
} from '@/services/mastery';

export interface StatsData {
  stats: StoredStats | null;
  loading: boolean;
  isNewUser: boolean;
  accuracy: number;
  masteryLevel: number;
  masteryProgress: number;
  questionsToNextLevel: number;
  levelTitle: string;
  dailyStreak: number;
  highScore: number;
  refresh: () => Promise<void>;
  recordQuizResult: (correct: number, total: number, streak: number, score: number) => Promise<void>;
  checkHighScore: (score: number) => Promise<boolean>;
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
    async (correct: number, total: number, streak: number, score: number) => {
      const updated = await updateAfterQuiz(correct, total, streak, score);
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

  // Derived values
  const isNewUser = stats?.gamesPlayed === 0;
  const accuracy = stats ? getAccuracy(stats) : 0;
  const totalAnswered = stats?.totalAnswered ?? 0;
  const masteryLevel = calculateLevel(totalAnswered);
  const masteryProgress = getProgressInLevel(totalAnswered);
  const questionsToNextLevel = getQuestionsToNextLevel(totalAnswered);
  const levelTitle = getLevelTitle(masteryLevel);
  const dailyStreak = stats?.dailyStreak ?? 0;
  const highScore = stats?.highScore ?? 0;

  return {
    stats,
    loading,
    isNewUser,
    accuracy,
    masteryLevel,
    masteryProgress,
    questionsToNextLevel,
    levelTitle,
    dailyStreak,
    highScore,
    refresh: fetchStats,
    recordQuizResult,
    checkHighScore,
  };
}
