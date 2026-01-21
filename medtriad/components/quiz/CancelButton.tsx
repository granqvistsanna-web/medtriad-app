import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CloseCircle } from '@solar-icons/react-native/Bold';
import { Icon } from '@/components/primitives';
import { theme, Easings } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CancelButtonProps {
  onPress?: () => void;
}

export function CancelButton({ onPress }: CancelButtonProps) {
  const router = useRouter();
  const scale = useSharedValue(1);

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
    if (onPress) {
      onPress();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[styles.button, animatedStyle]}
    >
      <Icon icon={CloseCircle} size="lg" color={theme.colors.text.secondary} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
