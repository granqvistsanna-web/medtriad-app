import { StyleSheet, View, useColorScheme } from 'react-native';
import { useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
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

  useEffect(() => {
    secondsValue.value = withTiming(seconds, { duration: 200 });
  }, [seconds, secondsValue]);

  // Animated text color that smoothly transitions
  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      secondsValue.value,
      [0, 3, 5, totalSeconds],
      [colors.timerDanger, colors.timerDanger, colors.timerWarning, colors.timerNormal]
    );
    return { color };
  });

  // Ring color uses threshold-based approach (SVG Circle doesn't easily animate)
  const getRingColor = () => {
    if (seconds <= 3) return colors.timerDanger;
    if (seconds <= 5) return colors.timerWarning;
    return colors.timerNormal;
  };

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
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
    </View>
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
