import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Bolt, Book, Target, CheckCircle, AltArrowRight } from '@solar-icons/react-native/Bold';
import { DailyChallengeType } from '@/types/daily-challenge';
import { theme, Radius, Spacing, Durations, Easings } from '@/constants/theme';
import { Text, Icon } from '@/components/primitives';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DailyChallengeCardProps = {
  challengeType: DailyChallengeType;
  displayName: string;
  completed: boolean;
  onPress: () => void;
  delay?: number;
};

/**
 * Get icon component based on challenge type
 */
function getChallengeIcon(type: DailyChallengeType) {
  switch (type) {
    case 'speed':
      return Bolt;
    case 'category':
      return Book;
    case 'full':
      return Target;
    default:
      return Target;
  }
}

export function DailyChallengeCard({
  challengeType,
  displayName,
  completed,
  onPress,
  delay = 0,
}: DailyChallengeCardProps) {
  const scale = useSharedValue(1);
  const borderBottom = useSharedValue(4);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const handlePressIn = () => {
    if (completed) return;
    scale.value = withSpring(0.98, Easings.press);
    borderBottom.value = withSpring(2, Easings.press);
  };

  const handlePressOut = () => {
    if (completed) return;
    scale.value = withSpring(1, Easings.press);
    borderBottom.value = withSpring(4, Easings.press);
  };

  const ChallengeIcon = getChallengeIcon(challengeType);

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          animatedStyle,
          completed && styles.cardCompleted,
        ]}
        accessibilityLabel={`Daily Challenge: ${displayName}, ${completed ? 'Completed' : 'Tap to play'}`}
        accessibilityRole="button"
      >
        {/* Left: Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, completed && styles.iconCircleCompleted]}>
            <Icon
              icon={ChallengeIcon}
              size="md"
              color={completed ? theme.colors.text.muted : theme.colors.brand.primary}
            />
          </View>
        </View>

        {/* Center: Labels */}
        <View style={styles.contentContainer}>
          <Text
            variant="tiny"
            color={completed ? 'muted' : 'brand'}
            weight="extrabold"
            style={styles.label}
          >
            DAILY CHALLENGE
          </Text>
          <Text
            variant="body"
            color={completed ? 'secondary' : 'primary'}
            weight="bold"
            style={styles.displayName}
          >
            {displayName}
          </Text>
        </View>

        {/* Right: Status indicator */}
        <View style={styles.statusContainer}>
          {completed ? (
            <View style={styles.completedIndicator}>
              <View style={styles.checkCircle}>
                <Icon
                  icon={CheckCircle}
                  size="sm"
                  color={theme.colors.success.main}
                />
              </View>
              <Text
                variant="tiny"
                color="success"
                weight="extrabold"
                style={styles.doneText}
              >
                DONE
              </Text>
            </View>
          ) : (
            <Icon
              icon={AltArrowRight}
              size="md"
              color={theme.colors.brand.primary}
            />
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    backgroundColor: `${theme.colors.brand.primary}10`,
    borderColor: theme.colors.brand.primary,
    borderBottomColor: theme.colors.brand.primaryDark,
    ...theme.shadows.md,
    shadowColor: theme.colors.brand.primary,
    shadowOpacity: 0.15,
  },
  cardCompleted: {
    opacity: 0.7,
    backgroundColor: theme.colors.surface.card,
    borderColor: theme.colors.border.default,
    borderBottomColor: theme.colors.border.strong,
    shadowOpacity: 0.05,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: `${theme.colors.brand.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleCompleted: {
    backgroundColor: theme.colors.surface.secondary,
  },
  contentContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.2,
  },
  displayName: {
    fontSize: 16,
    letterSpacing: -0.3,
  },
  statusContainer: {
    marginLeft: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIndicator: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: `${theme.colors.success.main}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
});
