import { SafeAreaView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { StatsCard } from '@/components/home/StatsCard';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  // Placeholder stats - Phase 5 will load from AsyncStorage
  const stats = {
    streak: 0,
    highScore: 0,
    totalQuizzes: 0,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header/Branding */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Med Triads</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Master medical triads
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatsCard
            value={stats.streak}
            label="Streak"
            icon={
              <IconSymbol
                name="flame.fill"
                size={24}
                color={colors.timerWarning}
              />
            }
          />
          <StatsCard
            value={stats.highScore}
            label="Best"
            icon={
              <IconSymbol
                name="trophy.fill"
                size={24}
                color={colors.timerWarning}
              />
            }
          />
          <StatsCard
            value={stats.totalQuizzes}
            label="Played"
            icon={
              <IconSymbol
                name="checkmark.circle.fill"
                size={24}
                color={colors.success}
              />
            }
          />
        </View>
      </View>

      {/* Footer with Start Button */}
      <View style={styles.footer}>
        <Button label="Start Quiz" onPress={() => router.push('/quiz')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.title,
    fontSize: 40,
  },
  subtitle: {
    ...Typography.caption,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
