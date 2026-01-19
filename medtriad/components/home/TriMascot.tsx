import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { MascotSizes, Colors } from '@/constants/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type MascotMood = 'neutral' | 'happy' | 'reassuring' | 'streak' | 'tierUp';
export type MascotSize = 'sm' | 'md' | 'lg' | 'xl';
export type MascotContext = 'home' | 'quiz' | 'results';

type TriMascotProps = {
  mood?: MascotMood;
  size?: MascotSize;
  animate?: boolean;
  masteryLevel?: number;  // Keep for backward compat
  tier?: number;          // 1-6 tier number
  context?: MascotContext;  // Determines image selection logic
};

const triNeutral = require('@/assets/images/tri-neutral.png');
const triHappy = require('@/assets/images/tri-success.png');

// Tier-specific mascot images (static requires for Metro bundler)
// Naming: tri-lvl1.png through tri-lvl6.png (lvl3 missing, falls back to lvl2)
const TIER_IMAGES: Record<number, ReturnType<typeof require>> = {
  1: require('@/assets/images/tri-lvl1.png'),
  2: require('@/assets/images/tri-lvl2.png'),
  3: require('@/assets/images/tri-lvl2.png'),  // Fallback: lvl3 not provided
  4: require('@/assets/images/tri-lvl4.png'),
  5: require('@/assets/images/tri-lvl5.png'),
  6: require('@/assets/images/tri-lvl6.png'),
};

export function TriMascot({ mood = 'neutral', size = 'lg', animate = true, masteryLevel = 0, tier, context }: TriMascotProps) {
  const colors = Colors.light;
  const pixelSize = MascotSizes[size];
  const reduceMotion = useReducedMotion();

  // Animation values
  const breathe = useSharedValue(0);
  const float = useSharedValue(0);
  const rise = useSharedValue(0);
  const glow = useSharedValue(0);

  // Select image based on context, tier, mastery level, and mood
  const getImageSource = () => {
    // Home screen uses tier-specific images
    if (context === 'home' && tier) {
      return TIER_IMAGES[tier] || TIER_IMAGES[1];
    }
    // Quiz/results continue using mood-based images (existing behavior)
    if (masteryLevel >= 7) return TIER_IMAGES[6];
    if (mood === 'happy' || mood === 'streak' || mood === 'tierUp') return triHappy;
    return triNeutral;
  };
  const imageSource = getImageSource();

  useEffect(() => {
    if (!animate) return;

    // Reduced motion: skip continuous animations, use simple fades
    if (reduceMotion) {
      breathe.value = 0;
      float.value = 0;
      rise.value = mood === 'happy' ? 1 : 0;
      // Static glow for streak/tierUp moods (no pulsing)
      glow.value = (mood === 'streak' || mood === 'tierUp')
        ? withTiming(0.6, { duration: 300 })
        : withTiming(0, { duration: 150 });
      return;
    }

    // Breathing animation - subtle scale pulse
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Floating animation - gentle up/down movement
    if (mood === 'reassuring') {
      float.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }

    // Rise animation for happy mood (tuned spring: damping 20, stiffness 90)
    if (mood === 'happy') {
      rise.value = withSpring(1, { damping: 20, stiffness: 90 });
    } else {
      rise.value = withSpring(0, { damping: 20, stiffness: 90 });
    }

    // Glow animation for streak (infinite) or tierUp (finite)
    if (mood === 'streak') {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite for streak
        false
      );
    } else if (mood === 'tierUp') {
      // Finite glow for tier-up celebration (3 pulses)
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        3, // Run 3 times then stop
        false
      );
    } else {
      glow.value = withTiming(0, { duration: 300 });
    }
  }, [mood, animate, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    // Reduced motion: no scale/translate, just static
    if (reduceMotion) {
      return {
        transform: [{ scale: 1 }, { translateY: 0 }],
      };
    }

    const breatheScale = interpolate(breathe.value, [0, 1], [1, 1.03]);
    const floatY = interpolate(float.value, [0, 1], [0, -8]);
    const riseY = interpolate(rise.value, [0, 1], [0, -6]);

    return {
      transform: [
        { scale: breatheScale },
        { translateY: floatY + riseY },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    // Glow disabled for cleaner look on neutral backgrounds
    return { opacity: 0 };
  });

  return (
    <View style={[styles.container, { width: pixelSize, height: pixelSize }]}>
      {/* Glow effect for streak mood */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: pixelSize * 1.3,
            height: pixelSize * 1.3,
            borderRadius: pixelSize * 0.65,
            backgroundColor: colors.primary,
          },
          glowStyle,
        ]}
      />

      {/* Mascot image */}
      <Animated.View style={animatedStyle}>
        <Image
          source={imageSource}
          style={{
            width: pixelSize,
            height: pixelSize,
          }}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
});
