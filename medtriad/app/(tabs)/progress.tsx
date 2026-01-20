import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { StatsCard } from '@/components/progress/StatsCard';
import { QuizHistoryList } from '@/components/progress/QuizHistoryList';
import { TierProgressBar } from '@/components/progress/TierProgressBar';
import { useStats } from '@/hooks/useStats';
import { loadQuizHistory, QuizHistoryEntry } from '@/services/stats-storage';
import { theme, Spacing, Durations, Radius } from '@/constants/theme';
import { Text } from '@/components/primitives';

export default function ProgressScreen() {
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(Durations.normal).springify()}>
          <Text variant="title" color="primary">Progress</Text>
        </Animated.View>

        {/* Tier Header - Enhanced card with wine accent */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger).duration(Durations.normal).springify()}
          style={[
            styles.tierCard,
            {
              backgroundColor: theme.colors.surface.brand,
              borderColor: theme.colors.brand.primary,
              borderBottomColor: theme.colors.brand.primaryDark,
            },
          ]}
        >
          <View style={[styles.tierBadge, { backgroundColor: theme.colors.brand.primary }]}>
            <Text variant="tiny" color="inverse" weight="extrabold" style={styles.tierBadgeText}>
              LEVEL {tier.tier}
            </Text>
          </View>
          <Text variant="heading" color="brand" weight="bold" style={styles.tierName}>
            {tier.name}
          </Text>
          <Text variant="footnote" color="secondary" style={styles.tierSubtext}>
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
          <Text variant="tiny" color="muted" style={styles.sectionTitle}>YOUR STATS</Text>
          <View style={[styles.sectionLine, { backgroundColor: theme.colors.border.default }]} />
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
              icon="trophy"
              description="personal best"
            />
            <StatsCard
              label="Accuracy"
              value={`${accuracy}%`}
              icon="target"
              description="overall score"
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard
              label="Games Played"
              value={stats.gamesPlayed}
              icon="gamepad"
              description="total sessions"
            />
            <StatsCard
              label="Best Streak"
              value={`${stats.bestStreak}x`}
              icon="fire"
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
  tierCard: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    padding: Spacing.xl,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginBottom: Spacing.xs,
  },
  tierBadgeText: {
    letterSpacing: 1.5,
  },
  tierName: {
    fontSize: 26,
  },
  tierSubtext: {
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
