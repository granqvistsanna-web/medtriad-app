import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Bookmark as BookmarkFilled } from '@solar-icons/react-native/Bold';
import { Bookmark as BookmarkOutline } from '@solar-icons/react-native/Linear';
import { Text } from '@/components/primitives';
import { useHaptics } from '@/hooks/useHaptics';
import { theme, Spacing, Radius, Easings } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TrickyButtonProps = {
  /** Whether the question is marked as tricky */
  isMarked: boolean;
  /** Callback when user toggles the tricky status */
  onToggle: () => void;
};

/**
 * Toggle button for marking questions as "tricky" for later review.
 * Shows filled bookmark when marked, outline when not.
 */
export function TrickyButton({ isMarked, onToggle }: TrickyButtonProps) {
  const scale = useSharedValue(1);
  const { triggerHaptic } = useHaptics();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, Easings.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Easings.press);
  };

  const handlePress = () => {
    triggerHaptic();
    onToggle();
  };

  const IconComponent = isMarked ? BookmarkFilled : BookmarkOutline;
  const iconColor = isMarked ? theme.colors.warning.main : theme.colors.text.secondary;
  const textColor = isMarked ? theme.colors.warning.text : theme.colors.text.secondary;
  const label = isMarked ? 'Marked as tricky' : 'Mark as tricky';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <IconComponent size={20} color={iconColor} />
      <Text variant="footnote" color={textColor} weight="medium">
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
});
