import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { StatsCard } from '@/components/progress/StatsCard';
import { QuizHistoryList } from '@/components/progress/QuizHistoryList';
import { TierProgressBar } from '@/components/progress/TierProgressBar';
import { useStats } from '@/hooks/useStats';
import { loadQuizHistory, QuizHistoryEntry } from '@/services/stats-storage';
import { Colors, Typography, Spacing, Durations, CardStyle, Radius } from '@/constants/theme';

export default function ProgressScreen() {
  const colors = Colors.light;
  const { stats, loading, tier, tierProgress, nextTier, accuracy, refresh } = useStats();
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    const load = async () => {
      const loadedHistory = await loadQuizHistory();
      setHistory(loadedHistory);
      setHistoryLoading(false);
    };
    load();
  }, []);

  // Reload data when tab is focused
  useFocusEffect(
    useCallback(() => {
      const reload = async () => {
        await refresh();
        const loadedHistory = await loadQuizHistory();
        setHistory(loadedHistory);
      };
      reload();
    }, [refresh])
  );

  if (loading || historyLoading || !stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer} />
      </SafeAreaView>
    );
  }

  // Games needed to reach next tier (only show if not at max tier)
  // Use Math.max to ensure never negative, fallback to 0 if calculation fails
  const gamesToNext = nextTier
    ? Math.max(0, (nextTier.gamesRequired ?? nextTier.pointsRequired ?? 0) - (stats?.gamesPlayed ?? 0))
    : 0;

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

        {/* Tier Header - Card with hard border */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger).duration(Durations.normal).springify()}
          style={[styles.tierCard, { backgroundColor: colors.backgroundCard }]}
        >
          <Text style={[styles.tierName, { color: colors.text }]}>
            {tier.name}
          </Text>
          <Text style={[styles.tierSubtext, { color: colors.textMuted }]}>
            {nextTier
              ? `${gamesToNext} ${gamesToNext === 1 ? 'game' : 'games'} to ${nextTier.name}`
              : 'Mastery achieved'}
          </Text>
          <View style={styles.progressBarContainer}>
            <TierProgressBar progress={tierProgress} />
          </View>
        </Animated.View>

        {/* Section header */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 2).duration(Durations.normal).springify()}
          style={styles.sectionHeader}
        >
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>YOUR STATS</Text>
          <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
        </Animated.View>

        {/* Stats Grid - 2x2 */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 3).duration(Durations.normal).springify()}
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
          entering={FadeInUp.delay(Durations.stagger * 4).duration(Durations.normal).springify()}
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
  tierCard: {
    ...CardStyle,
    padding: Spacing.xl,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  tierName: {
    ...Typography.heading,
    fontSize: 24,
    fontWeight: '700',
  },
  tierSubtext: {
    ...Typography.footnote,
    marginBottom: Spacing.sm,
  },
  progressBarContainer: {
    width: '100%',
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
