import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Book, Bolt } from '@solar-icons/react-native/Bold';
import { theme, Radius, Spacing, Durations } from '@/constants/theme';
import { Text, Icon } from '@/components/primitives';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ActionButtonProps = {
  icon: typeof Book;
  label: string;
  onPress: () => void;
};

function ActionButton({ icon, label, onPress }: ActionButtonProps) {
  const scale = useSharedValue(1);
  const borderBottom = useSharedValue(4);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    borderBottom.value = withSpring(2, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    borderBottom.value = withSpring(4, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.actionButton, animatedStyle]}
    >
      <Icon icon={icon} size="md" color={theme.colors.brand.primary} />
      <Text variant="footnote" color="secondary" weight="extrabold" style={styles.actionLabel}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

type ActionButtonsProps = {
  onStudy: () => void;
  onChallenge: () => void;
  delay?: number;
};

export function ActionButtons({
  onStudy,
  onChallenge,
  delay = 0,
}: ActionButtonsProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.container}
    >
      <View style={styles.actionRow}>
        <ActionButton
          icon={Book}
          label="STUDY"
          onPress={onStudy}
        />
        <ActionButton
          icon={Bolt}
          label="CHALLENGE"
          onPress={onChallenge}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    backgroundColor: theme.colors.surface.card,
    borderColor: theme.colors.border.default,
    borderBottomColor: theme.colors.border.strong,
  },
  actionLabel: {
    fontSize: 13,
    letterSpacing: 0.8,
  },
});
