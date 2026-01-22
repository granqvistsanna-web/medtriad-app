import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CheckCircle, AltArrowRight } from '@solar-icons/react-native/Bold';
import { theme, Radius, Spacing, Durations, Easings } from '@/constants/theme';
import { Text, Icon } from '@/components/primitives';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DailyChallengeCardProps = {
  displayName: string;
  completed: boolean;
  onPress: () => void;
  delay?: number;
};

export function DailyChallengeCard({
  displayName,
  completed,
  onPress,
  delay = 0,
}: DailyChallengeCardProps) {
  const scale = useSharedValue(1);
  const borderBottom = useSharedValue(3);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const handlePressIn = () => {
    if (completed) return;
    scale.value = withSpring(0.98, Easings.press);
    borderBottom.value = withSpring(1.5, Easings.press);
  };

  const handlePressOut = () => {
    if (completed) return;
    scale.value = withSpring(1, Easings.press);
    borderBottom.value = withSpring(3, Easings.press);
  };

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
        {/* Labels - tighter spacing without icon */}
        <View style={styles.contentContainer}>
          <Text
            variant="tiny"
            color={completed ? 'muted' : 'teal'}
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
              size="sm"
              color={theme.colors.teal.main}
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
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    backgroundColor: `${theme.colors.teal.main}08`,
    borderColor: `${theme.colors.teal.main}60`,
    borderBottomColor: `${theme.colors.teal.dark}70`,
    ...theme.shadows.sm,
    shadowColor: theme.colors.teal.main,
    shadowOpacity: 0.1,
  },
  cardCompleted: {
    backgroundColor: `${theme.colors.success.main}08`,
    borderColor: `${theme.colors.success.main}40`,
    borderBottomColor: `${theme.colors.success.main}60`,
    shadowColor: theme.colors.success.main,
    shadowOpacity: 0.15,
  },
  contentContainer: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 10,
    letterSpacing: 1,
  },
  displayName: {
    fontSize: 14,
    letterSpacing: -0.2,
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
