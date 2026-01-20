import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { StatsCard } from '@/components/progress/StatsCard';
import { QuizHistoryList } from '@/components/progress/QuizHistoryList';
import { TierProgressBar } from '@/components/progress/TierProgressBar';
import { TrickyQuestionsList } from '@/components/progress/TrickyQuestionsList';
import { useStats } from '@/hooks/useStats';
import { loadQuizHistory, QuizHistoryEntry } from '@/services/stats-storage';
import { theme, Spacing, Durations, Radius, CardStyle } from '@/constants/theme';
import { Text } from '@/components/primitives';

export default function ProgressScreen() {
  const { stats, loading, tier, tierProgress, nextTier, accuracy, refresh } = useStats();
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const loadedHistory = await loadQuizHistory();
      setHistory(loadedHistory);
      setHistoryLoading(false);
    };
    load();
  }, []);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(Durations.normal)}>
          <Text variant="title" color="primary">Progress</Text>
        </Animated.View>

        {/* Hero Card - matches Home style */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger).duration(Durations.normal).springify()}
          style={styles.heroCard}
        >
          {/* Accuracy hero stat */}
          <Text variant="tiny" color="secondary" style={styles.heroLabel}>
            ACCURACY
          </Text>
          <Text style={[styles.heroValue, { color: theme.colors.brand.primary }]}>
            {accuracy}%
          </Text>
          <Text variant="caption" color="secondary" style={styles.heroSubtext}>
            {stats.totalCorrect} of {stats.totalAnswered} correct
          </Text>

          {/* Progress to next level */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text variant="footnote" color="secondary">
                {tier.name}
              </Text>
              {nextTier && (
                <Text variant="footnote" color="secondary">
                  {nextTier.name}
                </Text>
              )}
            </View>
            <TierProgressBar progress={tierProgress} />
          </View>
        </Animated.View>

        {/* Stats Section Header */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 2).duration(Durations.normal).springify()}
          style={styles.sectionHeader}
        >
          <Text variant="tiny" color="muted" style={styles.sectionLabel}>
            YOUR STATS
          </Text>
          <View style={[styles.sectionLine, { backgroundColor: theme.colors.border.default }]} />
        </Animated.View>

        {/* Stats Grid - 3 column */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 2.5).duration(Durations.normal).springify()}
          style={styles.statsCard}
        >
          <StatsCard
            label="High Score"
            value={stats.highScore.toLocaleString()}
          />
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border.default }]} />
          <StatsCard
            label="Games"
            value={stats.gamesPlayed}
          />
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border.default }]} />
          <StatsCard
            label="Best Streak"
            value={`${stats.bestStreak}x`}
          />
        </Animated.View>

        {/* Quiz History */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 3).duration(Durations.normal).springify()}
        >
          <QuizHistoryList history={history} />
        </Animated.View>

        {/* Study Mode Section Header */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 3.5).duration(Durations.normal).springify()}
          style={styles.sectionHeader}
        >
          <Text variant="tiny" color="muted" style={styles.sectionLabel}>
            FOR REVIEW
          </Text>
          <View style={[styles.sectionLine, { backgroundColor: theme.colors.border.default }]} />
        </Animated.View>

        {/* Tricky Questions List */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 4).duration(Durations.normal).springify()}
        >
          <TrickyQuestionsList />
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
  heroCard: {
    ...CardStyle,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  heroLabel: {
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  heroValue: {
    fontSize: 64,
    fontWeight: '700',
    lineHeight: 72,
  },
  heroSubtext: {
    marginBottom: Spacing.lg,
  },
  progressSection: {
    width: '100%',
    gap: Spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sectionLabel: {
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  statsCard: {
    ...CardStyle,
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  statDivider: {
    width: 1,
    marginVertical: Spacing.sm,
  },
});
