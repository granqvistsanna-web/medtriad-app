import { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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
    tier,
    tierProgress,
    nextTier,
    totalPoints,
    pointsToNextTier,
    pendingTierUp,
    clearPendingTierUp,
    getCategoryPercent,
    refresh,
    userName,
  } = useStats();

  // Refresh stats when screen gains focus (after quiz completion)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Track if we're showing the tier-up catch-up glow
  const [showTierUpGlow, setShowTierUpGlow] = useState(false);
  const tierUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearPendingTierUpRef = useRef(clearPendingTierUp);

  // Keep ref in sync with latest callback
  useEffect(() => {
    clearPendingTierUpRef.current = clearPendingTierUp;
  }, [clearPendingTierUp]);

  // Detect pendingTierUp and trigger glow, then clear
  useEffect(() => {
    if (pendingTierUp && !showTierUpGlow) {
      setShowTierUpGlow(true);

      // Clear any existing timer to prevent race conditions
      if (tierUpTimerRef.current) {
        clearTimeout(tierUpTimerRef.current);
      }

      // Clear the pending flag after showing glow
      // Delay to let the glow animation complete (3 pulses x 1.6s = ~5s)
      tierUpTimerRef.current = setTimeout(() => {
        clearPendingTierUpRef.current();
        setShowTierUpGlow(false);
        tierUpTimerRef.current = null;
      }, 5000);
    }

    return () => {
      if (tierUpTimerRef.current) {
        clearTimeout(tierUpTimerRef.current);
        tierUpTimerRef.current = null;
      }
    };
  }, [pendingTierUp, showTierUpGlow]);

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

  const handleChallenge = () => {
    router.push('/challenge');
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
          userName={userName}
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
          onChallenge={handleChallenge}
          delay={Durations.stagger * 2.5}
        />

        {/* Category mastery progress */}
        <CategoryMastery
          categoryMastery={{
            cardiology: getCategoryPercent('cardiology'),
            neurology: getCategoryPercent('neurology'),
            pulmonary: getCategoryPercent('pulmonary'),
            endocrine: getCategoryPercent('endocrine'),
          }}
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
