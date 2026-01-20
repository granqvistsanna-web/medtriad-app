import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme, Radius, Spacing, Durations, Easings, FrameCardStyle, FrameCardInnerStyle } from '@/constants/theme';
import { Text } from '@/components/primitives';

type StatCardData = {
  label: string;
  value: string | number;
  description?: string;       // Optional - not shown in frame style
  frameColor?: string;        // Background color for frame
  frameDarkColor?: string;    // Darker shade for bottom of frame
  valueColor?: string;        // Color for the value text
  onPress?: () => void;
};

type StatCardProps = StatCardData & {
  delay: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Duolingo-style frame card with colored border and white inner area
 */
function StatCard({
  label,
  value,
  frameColor,
  frameDarkColor,
  valueColor,
  onPress,
  delay,
}: StatCardProps) {
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
        style={[
          styles.frameCard,
          {
            backgroundColor: frameColor || theme.colors.brand.primary,
            borderBottomColor: frameDarkColor || theme.colors.brand.primaryDark,
          },
          animatedStyle,
        ]}
      >
        {/* Label above inner card */}
        <Text variant="tiny" color={valueColor || theme.colors.text.primary} weight="extrabold" style={styles.frameLabel}>
          {label.toUpperCase()}
        </Text>

        {/* White inner area with rounded corners */}
        <View style={styles.frameInner}>
          <Text
            variant="stat"
            color={valueColor || theme.colors.text.primary}
            weight="extrabold"
            style={styles.frameValue}
          >
            {value}
          </Text>
        </View>
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
  // Using Duolingo frame-style cards with colored borders
  const cards: StatCardData[] = isNewUser
    ? [
        {
          label: 'Triads',
          value: '15',
          frameColor: theme.colors.brand.primary,
          frameDarkColor: theme.colors.brand.primaryDark,
          valueColor: theme.colors.brand.primaryDarker,
        },
        {
          label: 'Timer',
          value: '15s',
          frameColor: theme.colors.streak.main,
          frameDarkColor: theme.colors.streak.dark,
          valueColor: theme.colors.streak.text,
        },
        {
          label: 'Choices',
          value: '4',
          frameColor: theme.colors.purple.main,
          frameDarkColor: theme.colors.purple.dark,
          valueColor: theme.colors.purple.text,
        },
        {
          label: 'Mode',
          value: 'Quick',
          frameColor: theme.colors.blue.main,
          frameDarkColor: theme.colors.blue.dark,
          valueColor: theme.colors.blue.text,
        },
      ]
    : [
        {
          label: 'Accuracy',
          value: `${accuracy}%`,
          frameColor: theme.colors.brand.primary,
          frameDarkColor: theme.colors.brand.primaryDark,
          valueColor: theme.colors.brand.primaryDarker,
          onPress: () => onStatPress?.('accuracy'),
        },
        {
          label: 'Streak',
          value: dailyStreak.toString(),
          frameColor: theme.colors.streak.main,
          frameDarkColor: theme.colors.streak.dark,
          valueColor: theme.colors.streak.text,
          onPress: () => onStatPress?.('streak'),
        },
        {
          label: 'High Score',
          value: highScore.toLocaleString(),
          frameColor: theme.colors.purple.main,
          frameDarkColor: theme.colors.purple.dark,
          valueColor: theme.colors.purple.text,
          onPress: () => onStatPress?.('score'),
        },
        {
          label: 'Answered',
          value: totalAnswered.toString(),
          frameColor: theme.colors.blue.main,
          frameDarkColor: theme.colors.blue.dark,
          valueColor: theme.colors.blue.text,
          onPress: () => onStatPress?.('answered'),
        },
      ];

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.container}
    >
      {/* Section heading */}
      <View style={styles.headingRow}>
        <Text variant="tiny" color="muted">
          {isNewUser ? 'WHAT TO EXPECT' : 'YOUR PROGRESS'}
        </Text>
        <View style={[styles.headingLine, { backgroundColor: theme.colors.border.default }]} />
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
  // Duolingo-style frame card
  frameCard: {
    ...FrameCardStyle,
    flex: 1,
    minHeight: 90,
    borderBottomWidth: 4,
    alignItems: 'center',
  },
  frameLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 2,
    paddingVertical: Spacing.xs,
  },
  frameInner: {
    ...FrameCardInnerStyle,
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  frameValue: {
    fontSize: 28,
    lineHeight: 34,
  },
});
