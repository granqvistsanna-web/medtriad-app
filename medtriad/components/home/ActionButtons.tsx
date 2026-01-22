import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Book, Bolt, Refresh } from '@solar-icons/react-native/Bold';
import { theme, Radius, Spacing, Durations } from '@/constants/theme';
import { Text, Icon } from '@/components/primitives';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ActionButtonProps = {
  icon: typeof Book;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  badge?: number;
};

function ActionButton({ icon, label, onPress, disabled = false, badge }: ActionButtonProps) {
  const scale = useSharedValue(1);
  const borderBottom = useSharedValue(2);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    borderBottom.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    borderBottom.value = withSpring(2, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.actionButton,
        animatedStyle,
        disabled && styles.actionButtonDisabled,
      ]}
    >
      <View style={styles.buttonContent}>
        <Icon
          icon={icon}
          size="md"
          color={disabled ? theme.colors.text.muted : theme.colors.brand.primary}
        />
        <Text
          variant="footnote"
          color={disabled ? 'muted' : 'secondary'}
          weight="extrabold"
          style={styles.actionLabel}
        >
          {label}
        </Text>
      </View>
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text variant="tiny" color="inverse" weight="bold">
            {badge}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

type ActionButtonsProps = {
  onStudy: () => void;
  onChallenge: () => void;
  onReview: () => void;
  dueCount: number;
  delay?: number;
};

export function ActionButtons({
  onStudy,
  onChallenge,
  onReview,
  dueCount,
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
      <View style={styles.actionRow}>
        <ActionButton
          icon={Refresh}
          label="REVIEW"
          onPress={onReview}
          disabled={dueCount === 0}
          badge={dueCount}
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderBottomWidth: 2,
    backgroundColor: theme.colors.surface.card,
    borderColor: theme.colors.border.default,
    borderBottomColor: theme.colors.border.strong,
    opacity: 0.9,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionLabel: {
    fontSize: 13,
    letterSpacing: 0.8,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.brand.primary,
    borderRadius: Radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    borderWidth: 2,
    borderColor: theme.colors.surface.primary,
  },
});
