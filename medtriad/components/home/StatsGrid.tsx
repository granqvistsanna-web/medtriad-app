import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Typography, Shadows, Radius, Spacing, Durations, Easings, CardStyle } from '@/constants/theme';

type StatCardData = {
  label: string;
  value: string | number;
  description: string;
  onPress?: () => void;
};

type StatCardProps = StatCardData & {
  delay: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function StatCard({
  label,
  value,
  description,
  onPress,
  delay,
}: StatCardProps) {
  const colors = Colors.light;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, Easings.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Easings.press);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.cardWrapper}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, animatedStyle]}
      >
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          {description}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

type StatsGridProps = {
  isNewUser: boolean;
  accuracy?: number;
  dailyStreak?: number;
  bestStreak?: number;
  highScore?: number;
  totalAnswered?: number;
  delay?: number;
  onStatPress?: (stat: string) => void;
};

export function StatsGrid({
  isNewUser,
  accuracy = 0,
  dailyStreak = 0,
  bestStreak = 0,
  highScore = 0,
  totalAnswered = 0,
  delay = 0,
  onStatPress,
}: StatsGridProps) {
  // Different data for new vs returning users
  const cards: StatCardData[] = isNewUser
    ? [
        {
          label: 'Triads',
          value: '15',
          description: 'conditions to learn',
        },
        {
          label: 'Timer',
          value: '15s',
          description: 'per question',
        },
        {
          label: 'Choices',
          value: '4',
          description: 'multiple choice',
        },
        {
          label: 'Mode',
          value: 'Quick',
          description: 'endless practice',
        },
      ]
    : [
        {
          label: 'Accuracy',
          value: `${accuracy}%`,
          description: 'overall score',
          onPress: () => onStatPress?.('accuracy'),
        },
        {
          label: 'Streak',
          value: dailyStreak.toString(),
          description: bestStreak > dailyStreak ? `best: ${bestStreak}` : 'day streak',
          onPress: () => onStatPress?.('streak'),
        },
        {
          label: 'High Score',
          value: highScore.toLocaleString(),
          description: 'personal best',
          onPress: () => onStatPress?.('score'),
        },
        {
          label: 'Answered',
          value: totalAnswered.toString(),
          description: 'total questions',
          onPress: () => onStatPress?.('answered'),
        },
      ];

  const colors = Colors.light;

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.container}
    >
      {/* Section heading */}
      <View style={styles.headingRow}>
        <Text style={[styles.heading, { color: colors.textMuted }]}>
          {isNewUser ? 'WHAT TO EXPECT' : 'YOUR PROGRESS'}
        </Text>
        <View style={[styles.headingLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Stats grid */}
      <View style={styles.grid}>
        <View style={styles.row}>
          <StatCard {...cards[0]} delay={delay + Durations.stagger} />
          <StatCard {...cards[1]} delay={delay + Durations.stagger * 2} />
        </View>
        <View style={styles.row}>
          <StatCard {...cards[2]} delay={delay + Durations.stagger * 3} />
          <StatCard {...cards[3]} delay={delay + Durations.stagger * 4} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heading: {
    ...Typography.tiny,
    letterSpacing: 1,
  },
  headingLine: {
    flex: 1,
    height: 1,
  },
  grid: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    ...CardStyle,
    flex: 1,
    padding: Spacing.base,
    gap: Spacing.xs,
    minHeight: 100,
  },
  label: {
    ...Typography.tiny,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  description: {
    ...Typography.footnote,
  },
});
