import { StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors, Typography } from '@/constants/theme';

type FloatingPointsProps = {
  points: number;
  onComplete: () => void;
};

export function FloatingPoints({ points, onComplete }: FloatingPointsProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-60, { duration: 700 });
    opacity.value = withTiming(0, { duration: 700 }, (finished) => {
      if (finished) {
        runOnJS(onComplete)();
      }
    });
  }, [onComplete, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.Text style={[styles.points, { color: colors.success }]}>
        +{points}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    alignSelf: 'center',
    top: 80,
  },
  points: {
    ...Typography.heading,
    fontWeight: '700',
  },
});
