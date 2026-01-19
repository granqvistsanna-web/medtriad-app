import { Image, StyleSheet, View } from 'react-native';
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

export type MascotMood = 'neutral' | 'happy' | 'reassuring' | 'streak';
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
const triMaster = require('@/assets/images/tri-master.png');
const triSupermaster = require('@/assets/images/tri-supermaster.png');

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
    if (masteryLevel >= 10) return triSupermaster;
    if (masteryLevel >= 7) return triMaster;
    if (mood === 'happy' || mood === 'streak') return triHappy;
    return triNeutral;
  };
  const imageSource = getImageSource();

  useEffect(() => {
    if (!animate) return;

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

    // Rise animation for happy mood
    if (mood === 'happy') {
      rise.value = withSpring(1, { damping: 12, stiffness: 100 });
    } else {
      rise.value = withSpring(0, { damping: 12, stiffness: 100 });
    }

    // Glow animation for streak
    if (mood === 'streak') {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [mood, animate]);

  const animatedStyle = useAnimatedStyle(() => {
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
    if (mood !== 'streak') return { opacity: 0 };

    return {
      opacity: interpolate(glow.value, [0, 1], [0, 0.4]),
    };
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
          resizeMode="contain"
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
