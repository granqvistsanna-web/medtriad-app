import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { StatsCard } from '@/components/progress/StatsCard';
import { QuizHistoryList } from '@/components/progress/QuizHistoryList';
import {
  loadStats,
  loadQuizHistory,
  getAccuracy,
  StoredStats,
  QuizHistoryEntry,
} from '@/services/stats-storage';
import { Colors, Typography, Spacing, Durations } from '@/constants/theme';

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
        <Animated.Text
          entering={FadeInUp.duration(Durations.normal).springify()}
          style={[styles.title, { color: colors.text }]}
        >
          Progress
        </Animated.Text>

        {/* Section header */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger).duration(Durations.normal).springify()}
          style={styles.sectionHeader}
        >
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>YOUR STATS</Text>
          <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
        </Animated.View>

        {/* Stats Grid - 2x2 */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 2).duration(Durations.normal).springify()}
          style={styles.statsGrid}
        >
          <View style={styles.statsRow}>
            <StatsCard
              label="High Score"
              value={stats.highScore.toLocaleString()}
              icon="trophy.fill"
              description="personal best"
            />
            <StatsCard
              label="Accuracy"
              value={`${accuracy}%`}
              icon="percent"
              description="overall score"
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard
              label="Games Played"
              value={stats.gamesPlayed}
              icon="gamecontroller.fill"
              description="total sessions"
            />
            <StatsCard
              label="Best Streak"
              value={`${stats.bestStreak}x`}
              icon="flame.fill"
              description="in a row"
            />
          </View>
        </Animated.View>

        {/* Quiz History */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 3).duration(Durations.normal).springify()}
          style={styles.historySection}
        >
          <QuizHistoryList history={history} />
        </Animated.View>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  title: {
    ...Typography.title,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.tiny,
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  statsGrid: {
    gap: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  historySection: {},
});
