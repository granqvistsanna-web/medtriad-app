import { StyleSheet, View, useColorScheme } from 'react-native';
import { useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  cancelAnimation,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

type TimerRingProps = {
  seconds: number;
  totalSeconds: number;
};

const SIZE = 88;
const STROKE_WIDTH = 5;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerRing({ seconds, totalSeconds }: TimerRingProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const progress = seconds / totalSeconds;

  // Shared value for smooth text color interpolation
  const secondsValue = useSharedValue(seconds);

  // Shared value for pulse animation in danger zone
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    secondsValue.value = withTiming(seconds, { duration: 200 });
  }, [seconds, secondsValue]);

  // Pulse animation when in danger zone (seconds <= 3 and > 0)
  useEffect(() => {
    if (seconds <= 3 && seconds > 0) {
      // Start continuous pulse: 1 -> 1.08 -> 1, 120ms each direction
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 120, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 120, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        false // Don't reverse (already handled in sequence)
      );
    } else {
      // Cancel animation and reset to 1 when out of danger zone
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1, { duration: 100 });
    }

    return () => {
      cancelAnimation(pulseScale);
    };
  }, [seconds, pulseScale]);

  // Animated text color that smoothly transitions
  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      secondsValue.value,
      [0, 3, 5, totalSeconds],
      [colors.timerDanger, colors.timerDanger, colors.timerWarning, colors.timerNormal]
    );
    return { color };
  });

  // Pulse style for the container
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Ring color uses threshold-based approach (SVG Circle doesn't easily animate)
  const getRingColor = () => {
    if (seconds <= 3) return colors.timerDanger;
    if (seconds <= 5) return colors.timerWarning;
    return colors.timerNormal;
  };

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <Animated.View style={[styles.container, pulseStyle]}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        {/* Background track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.border}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress ring */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={getRingColor()}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.seconds, textAnimatedStyle]}>
          {seconds}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seconds: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
