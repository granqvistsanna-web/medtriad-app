import { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { HomeHeader } from '@/components/home/HomeHeader';
import { HeroCard } from '@/components/home/HeroCard';
import { ActionButtons } from '@/components/home/ActionButtons';
import { CategoryMastery } from '@/components/home/CategoryMastery';
import { useStats } from '@/hooks/useStats';
import { theme, Spacing, Durations } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  const {
    stats,
    loading,
    isNewUser,
    accuracy,
    dailyStreak,
    highScore,
    tier,
    tierProgress,
    nextTier,
    totalPoints,
    pointsToNextTier,
    pendingTierUp,
    clearPendingTierUp,
  } = useStats();

  // Track if we're showing the tier-up catch-up glow
  const [showTierUpGlow, setShowTierUpGlow] = useState(false);

  // Detect pendingTierUp and trigger glow, then clear
  useEffect(() => {
    if (pendingTierUp && !showTierUpGlow) {
      setShowTierUpGlow(true);
      // Clear the pending flag after showing glow
      // Delay to let the glow animation complete (3 pulses x 1.6s = ~5s)
      const clearTimer = setTimeout(async () => {
        await clearPendingTierUp();
        setShowTierUpGlow(false);
      }, 5000);
      return () => clearTimeout(clearTimer);
    }
  }, [pendingTierUp, showTierUpGlow, clearPendingTierUp]);

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const handleStartQuiz = () => {
    router.push('/quiz');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with greeting and gamification badges */}
        <HomeHeader
          delay={0}
          totalPoints={totalPoints}
          dailyStreak={dailyStreak}
        />

        {/* Hero card with mascot, tier info, and start button */}
        <HeroCard
          isNewUser={isNewUser}
          accuracy={accuracy}
          dailyStreak={dailyStreak}
          lastPlayed={stats?.lastPlayedAt ? new Date(stats.lastPlayedAt) : null}
          delay={Durations.stagger}
          tier={tier}
          tierProgress={tierProgress}
          nextTier={nextTier}
          totalPoints={totalPoints}
          pointsToNextTier={pointsToNextTier}
          onTierPress={() => router.push('/(tabs)/progress')}
          onStartQuiz={handleStartQuiz}
          showTierUpGlow={showTierUpGlow}
        />

        {/* Action buttons - Study and Challenge */}
        <ActionButtons
          onStudy={() => router.push('/quiz/study')}
          onChallenge={() => router.push('/quiz')}
          delay={Durations.stagger * 2.5}
        />

        {/* Category mastery progress */}
        <CategoryMastery
          categoryMastery={{}}
          onCategoryPress={(category) => router.push('/(tabs)/progress')}
          delay={Durations.stagger * 3}
        />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
});
