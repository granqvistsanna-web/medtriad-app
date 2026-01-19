import { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { HomeHeader } from '@/components/home/HomeHeader';
import { HeroCard } from '@/components/home/HeroCard';
import { StatsGrid } from '@/components/home/StatsGrid';
import { Button } from '@/components/ui/Button';
import { useStats } from '@/hooks/useStats';
import { Colors, Spacing, Durations } from '@/constants/theme';
import { calculateLevel } from '@/services/mastery';

export default function HomeScreen() {
  const router = useRouter();
  const colors = Colors.light;

  const {
    stats,
    loading,
    isNewUser,
    accuracy,
    dailyStreak,
    highScore,
    tier,
    tierProgress,
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const handleStartQuiz = () => {
    router.push('/quiz');
  };

  const handleStatPress = (stat: string) => {
    router.push('/(tabs)/progress');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with greeting */}
        <HomeHeader delay={0} />

        {/* Hero card with mascot and message */}
        <HeroCard
          isNewUser={isNewUser}
          accuracy={accuracy}
          dailyStreak={dailyStreak}
          lastPlayed={stats?.lastPlayedAt ? new Date(stats.lastPlayedAt) : null}
          delay={Durations.stagger}
          masteryLevel={calculateLevel(stats?.totalAnswered ?? 0)}
          tier={tier}
          tierProgress={tierProgress}
          onTierPress={() => router.push('/(tabs)/progress')}
          showTierUpGlow={showTierUpGlow}
        />

        {/* Start Quiz button */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger * 2).duration(Durations.normal).springify()}
        >
          <Button
            label="Start Quiz"
            icon="play.fill"
            onPress={handleStartQuiz}
          />
        </Animated.View>

        {/* Stats grid */}
        <StatsGrid
          isNewUser={isNewUser}
          accuracy={accuracy}
          dailyStreak={dailyStreak}
          bestStreak={stats?.bestStreak ?? 0}
          highScore={highScore}
          totalAnswered={stats?.totalAnswered ?? 0}
          onStatPress={handleStatPress}
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
