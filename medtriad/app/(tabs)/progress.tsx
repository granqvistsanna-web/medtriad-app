import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { StatsCard } from '@/components/progress/StatsCard';
import { QuizHistoryList } from '@/components/progress/QuizHistoryList';
import {
  loadStats,
  loadQuizHistory,
  getAccuracy,
  StoredStats,
  QuizHistoryEntry,
} from '@/services/stats-storage';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function ProgressScreen() {
  const colors = Colors.light;
  const [stats, setStats] = useState<StoredStats | null>(null);
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const load = async () => {
      const [loadedStats, loadedHistory] = await Promise.all([
        loadStats(),
        loadQuizHistory(),
      ]);
      setStats(loadedStats);
      setHistory(loadedHistory);
      setIsLoading(false);
    };
    load();
  }, []);

  // Reload data when tab is focused
  useFocusEffect(
    useCallback(() => {
      const reload = async () => {
        const [loadedStats, loadedHistory] = await Promise.all([
          loadStats(),
          loadQuizHistory(),
        ]);
        setStats(loadedStats);
        setHistory(loadedHistory);
      };
      reload();
    }, [])
  );

  if (isLoading || !stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer} />
      </SafeAreaView>
    );
  }

  const accuracy = getAccuracy(stats);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Progress</Text>

        {/* Stats Grid - 2x2 */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatsCard
              label="High Score"
              value={stats.highScore.toLocaleString()}
              icon="trophy.fill"
            />
            <StatsCard
              label="Accuracy"
              value={`${accuracy}%`}
              icon="percent"
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard
              label="Games Played"
              value={stats.gamesPlayed}
              icon="gamecontroller.fill"
            />
            <StatsCard
              label="Best Streak"
              value={`${stats.bestStreak}x`}
              icon="flame.fill"
            />
          </View>
        </View>

        {/* Quiz History */}
        <View style={styles.historySection}>
          <QuizHistoryList history={history} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.title,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    gap: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  historySection: {
    marginTop: Spacing.xl,
  },
});
