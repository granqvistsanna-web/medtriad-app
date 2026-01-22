import { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { HomeHeader } from '@/components/home/HomeHeader';
import { HeroCard } from '@/components/home/HeroCard';
import { DailyChallengeCard } from '@/components/home/DailyChallengeCard';
import { ActionButtons } from '@/components/home/ActionButtons';
import { CategoryMastery } from '@/components/home/CategoryMastery';
import { useStats } from '@/hooks/useStats';
import { theme, Spacing, Radius, Durations, Easings } from '@/constants/theme';
import { Text } from '@/components/primitives';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
    dailyChallengeState,
    dailyChallengeLoading,
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

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

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

  // Button animation for Start Quiz - must be before conditional return
  const buttonScale = useSharedValue(1);
  const buttonBorderBottom = useSharedValue(5);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    borderBottomWidth: buttonBorderBottom.value,
  }));

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

  const handleShare = () => {
    router.push('/challenge');
  };

  const handleDailyChallenge = () => {
    router.push('/daily-challenge');
  };

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.98, Easings.press);
    buttonBorderBottom.value = withSpring(2, Easings.press);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, Easings.press);
    buttonBorderBottom.value = withSpring(5, Easings.press);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.brand.primary}
            colors={[theme.colors.brand.primary]}
          />
        }
      >
        {/* Header with greeting */}
        <HomeHeader
          delay={0}
          userName={userName}
        />

        {/* Hero card with mascot, tier info, and badges */}
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
          showTierUpGlow={showTierUpGlow}
          onXPPress={() => router.push('/(tabs)/progress')}
          onStreakPress={() => router.push('/(tabs)/progress')}
        />

        {/* Daily Challenge Card - prominent position */}
        {dailyChallengeLoading ? (
          <Animated.View
            entering={FadeInUp.delay(Durations.stagger * 1.5).duration(Durations.normal).springify()}
            style={styles.skeletonCard}
          >
            <View style={styles.skeletonContent}>
              <View style={styles.skeletonLabel} />
              <View style={styles.skeletonTitle} />
            </View>
            <View style={styles.skeletonIcon} />
          </Animated.View>
        ) : dailyChallengeState && (
          <DailyChallengeCard
            displayName={dailyChallengeState.challengeConfig.displayName}
            completed={dailyChallengeState.completedToday}
            onPress={handleDailyChallenge}
            delay={Durations.stagger * 1.5}
          />
        )}

        {/* Start Quiz button - below hero card */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 2).duration(Durations.normal).springify()}
        >
          <AnimatedPressable
            onPress={handleStartQuiz}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.startButton, buttonAnimatedStyle]}
          >
            <Text variant="label" color="inverse" weight="bold" style={styles.startButtonText}>
              START QUIZ
            </Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Action buttons - Study and Share */}
        <ActionButtons
          onStudy={() => router.push('/quiz/study-filter')}
          onShare={handleShare}
          delay={Durations.stagger * 2.5}
        />

        {/* Category mastery progress */}
        <CategoryMastery
          categoryMastery={{
            cardiology: getCategoryPercent('cardiology'),
            neurology: getCategoryPercent('neurology'),
            pulmonary: getCategoryPercent('pulmonary'),
            endocrine: getCategoryPercent('endocrine'),
            gastroenterology: getCategoryPercent('gastroenterology'),
            infectious: getCategoryPercent('infectious'),
            hematology: getCategoryPercent('hematology'),
            rheumatology: getCategoryPercent('rheumatology'),
            renal: getCategoryPercent('renal'),
            obstetrics: getCategoryPercent('obstetrics'),
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
  startButton: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
    borderBottomColor: theme.colors.brand.primaryDark,
    ...theme.shadows.lg,
    shadowColor: theme.colors.brand.primary,
    shadowOpacity: 0.3,
  },
  startButtonText: {
    letterSpacing: 1.5,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    backgroundColor: theme.colors.surface.card,
    borderColor: theme.colors.border.default,
    borderBottomColor: theme.colors.border.strong,
  },
  skeletonContent: {
    flex: 1,
    gap: 6,
  },
  skeletonLabel: {
    height: 10,
    width: 100,
    borderRadius: 5,
    backgroundColor: `${theme.colors.text.secondary}15`,
  },
  skeletonTitle: {
    height: 14,
    width: 160,
    borderRadius: 7,
    backgroundColor: `${theme.colors.text.secondary}15`,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: `${theme.colors.text.secondary}15`,
    marginLeft: Spacing.sm,
  },
});
