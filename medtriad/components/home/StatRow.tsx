import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Durations } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

type StatItem = {
  value: string | number;
  label: string;
  icon?: string;
  suffix?: string;
};

type StatRowProps = {
  stats: StatItem[];
  delay?: number;
};

export function StatRow({ stats, delay = 0 }: StatRowProps) {
  const colors = Colors.light;

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.container}
    >
      {stats.map((stat, index) => (
        <View key={index} style={styles.statWrapper}>
          {/* Divider (except for first item) */}
          {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}

          <View style={styles.stat}>
            {/* Icon + Value */}
            <View style={styles.valueRow}>
              {stat.icon && (
                <IconSymbol
                  name={stat.icon as any}
                  size={18}
                  color={colors.primary}
                  style={styles.icon}
                />
              )}
              <Text style={[styles.value, { color: colors.text }]}>
                {stat.value}
                {stat.suffix && <Text style={styles.suffix}>{stat.suffix}</Text>}
              </Text>
            </View>

            {/* Label */}
            <Text style={[styles.label, { color: colors.textMuted }]}>{stat.label}</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

/**
 * Pre-configured stat row for new users
 */
export function NewUserStatRow({ delay = 0 }: { delay?: number }) {
  return (
    <StatRow
      delay={delay}
      stats={[
        { value: 15, label: 'TRIADS' },
        { value: '15s', label: 'PER QUESTION' },
        { value: 4, label: 'CHOICES' },
      ]}
    />
  );
}

/**
 * Pre-configured stat row for returning users
 * Shows: Day Streak | High Score | Accuracy
 */
export function ReturningUserStatRow({
  accuracy,
  bestStreak,
  totalAnswered,
  dailyStreak,
  highScore,
  delay = 0,
}: {
  accuracy: number;
  bestStreak: number;
  totalAnswered: number;
  dailyStreak: number;
  highScore: number;
  delay?: number;
}) {
  return (
    <StatRow
      delay={delay}
      stats={[
        { value: dailyStreak, label: 'DAY STREAK', icon: 'flame.fill' },
        { value: highScore.toLocaleString(), label: 'HIGH SCORE', icon: 'trophy.fill' },
        { value: accuracy, suffix: '%', label: 'ACCURACY', icon: 'checkmark.circle.fill' },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
  },
  statWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: Spacing.lg,
  },
  stat: {
    alignItems: 'center',
    minWidth: 70,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  value: {
    ...Typography.stat,
  },
  suffix: {
    ...Typography.stat,
  },
  label: {
    ...Typography.tiny,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
  },
});
