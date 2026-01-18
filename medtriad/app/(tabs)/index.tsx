import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { TriMascot } from '@/components/home/TriMascot';
import { ProgressRing } from '@/components/home/ProgressRing';
import { NewUserStatRow, ReturningUserStatRow } from '@/components/home/StatRow';
import { MasteryBar } from '@/components/home/MasteryBar';
import { Button } from '@/components/ui/Button';
import { useStats } from '@/hooks/useStats';
import { Colors, Typography, Spacing, Durations } from '@/constants/theme';

/**
 * Get motivational message based on user performance
 */
function getMotivationalMessage(isNewUser: boolean, accuracy: number): string {
  if (isNewUser) return 'Ready to test your knowledge?';
  if (accuracy >= 90) return "You're crushing it!";
  if (accuracy >= 70) return 'Great progress! Keep going';
  if (accuracy >= 50) return "You're learning fast!";
  return 'Practice makes perfect!';
}

/**
 * Determine mascot mood based on accuracy
 */
function getMascotMood(isNewUser: boolean, accuracy: number): 'neutral' | 'happy' {
  if (isNewUser) return 'neutral';
  return accuracy >= 70 ? 'happy' : 'neutral';
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = Colors.light;

  const {
    stats,
    loading,
    isNewUser,
    accuracy,
    masteryLevel,
    dailyStreak,
    highScore,
  } = useStats();

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

  const message = getMotivationalMessage(isNewUser, accuracy);
  const mascotMood = getMascotMood(isNewUser, accuracy);
  const ringSize = isNewUser ? 0 : 180; // No ring for new users
  const mascotSize = isNewUser ? 'xl' : 'lg';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Mascot Section */}
        <Animated.View
          entering={FadeInUp.delay(0).duration(Durations.normal).springify()}
          style={styles.mascotSection}
        >
          {isNewUser ? (
            // New user: Large mascot without ring
            <TriMascot mood={mascotMood} size={mascotSize} />
          ) : (
            // Returning user: Mascot inside progress ring
            <ProgressRing size={ringSize} progress={accuracy / 100} strokeWidth={8}>
              <TriMascot mood={mascotMood} size={mascotSize} />
            </ProgressRing>
          )}
        </Animated.View>

        {/* Title */}
        <Animated.View
          entering={FadeInUp.delay(Durations.stagger).duration(Durations.normal).springify()}
          style={styles.titleSection}
        >
          <Text style={[styles.title, { color: colors.text }]}>MedTriads</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{message}</Text>
        </Animated.View>

        {/* Stats Row */}
        {isNewUser ? (
          <NewUserStatRow delay={Durations.stagger * 2} />
        ) : (
          <ReturningUserStatRow
            accuracy={accuracy}
            bestStreak={stats?.bestStreak ?? 0}
            totalAnswered={stats?.totalAnswered ?? 0}
            dailyStreak={dailyStreak}
            highScore={highScore}
            delay={Durations.stagger * 2}
          />
        )}

        {/* Mastery Bar (returning users only) */}
        {!isNewUser && (
          <MasteryBar
            totalAnswered={stats?.totalAnswered ?? 0}
            delay={Durations.stagger * 3}
          />
        )}
      </View>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.delay(Durations.stagger * 4).duration(Durations.normal).springify()}
        style={styles.footer}
      >
        <Button
          label={isNewUser ? 'Start Quiz' : 'Continue'}
          onPress={() => router.push('/quiz')}
        />
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Three findings → One diagnosis → Beat the clock
        </Text>
      </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  mascotSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    ...Typography.titleLarge,
  },
  subtitle: {
    ...Typography.caption,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  hint: {
    ...Typography.footnote,
    textAlign: 'center',
  },
});
