import { useState, useEffect, useCallback } from 'react';
import {
  getDailyChallengeState,
  completeDailyChallenge,
  getDailyChallengeConfig,
  generateDailyChallengeQuestions,
} from '@/services/daily-challenge';
import { DailyChallengeConfig, DailyChallengeState } from '@/types/daily-challenge';
import { QuizQuestion } from '@/types';

export interface UseDailyChallengeReturn {
  state: DailyChallengeState | null;
  loading: boolean;
  config: DailyChallengeConfig | null;
  questions: QuizQuestion[];
  refresh: () => Promise<void>;
  complete: () => Promise<{
    newStreak: number;
    earnedStreakFreeze: boolean;
    streakMilestone: number | null;
  }>;
}

/**
 * Hook for daily challenge state and actions
 *
 * Loads today's challenge state, config, and questions on mount.
 * If already completed today, only state is loaded (no questions generated).
 */
export function useDailyChallenge(): UseDailyChallengeReturn {
  const [state, setState] = useState<DailyChallengeState | null>(null);
  const [config, setConfig] = useState<DailyChallengeConfig | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Load challenge state and questions
  const loadChallenge = useCallback(async () => {
    try {
      setLoading(true);

      // Get today's challenge state
      const challengeState = await getDailyChallengeState();
      setState(challengeState);

      // If not completed, load config and generate questions
      if (!challengeState.completedToday) {
        const challengeConfig = getDailyChallengeConfig();
        setConfig(challengeConfig);

        const challengeQuestions = generateDailyChallengeQuestions(challengeConfig);
        setQuestions(challengeQuestions);
      } else {
        // Already completed - no questions needed
        setConfig(challengeState.challengeConfig);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Failed to load daily challenge:', error);
      // Set safe defaults on error
      setState(null);
      setConfig(null);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  // Refresh function
  const refresh = useCallback(async () => {
    await loadChallenge();
  }, [loadChallenge]);

  // Complete function
  const complete = useCallback(async () => {
    const result = await completeDailyChallenge();
    // Refresh state after completion
    await refresh();
    return result;
  }, [refresh]);

  return {
    state,
    loading,
    config,
    questions,
    refresh,
    complete,
  };
}
