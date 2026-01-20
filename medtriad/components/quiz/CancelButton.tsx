import { Alert, Pressable, StyleSheet, Platform } from 'react-native';
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

export function CancelButton() {
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
    if (Platform.OS === 'web') {
      if (window.confirm('Quit Quiz?\n\nYour progress will be lost.')) {
        router.replace('/(tabs)');
      }
    } else {
      Alert.alert(
        'Quit Quiz?',
        'Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Quit',
            style: 'destructive',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
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
