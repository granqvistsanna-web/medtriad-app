import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Text } from '@/components/primitives';
import { TriMascot } from '@/components/home/TriMascot';
import { theme, Spacing, Easings } from '@/constants/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type TierUpCelebrationProps = {
  oldTier: number;
  newTier: number;
  newTierName: string;
  onComplete?: () => void;
};

export function TierUpCelebration({
  oldTier,
  newTier,
  newTierName,
  onComplete,
}: TierUpCelebrationProps) {
  const { width } = useWindowDimensions();
  const confettiRef = useRef<ConfettiCannon>(null);
  const reduceMotion = useReducedMotion();

  // Track which tier image to display
  const [displayedTier, setDisplayedTier] = useState(oldTier);
  const [showMessage, setShowMessage] = useState(false);

  // Animation values
  const mascotScale = useSharedValue(1);
  const mascotOpacity = useSharedValue(1); // For reduced motion cross-fade
  const messageOpacity = useSharedValue(0);

  const triggerConfetti = () => {
    // Skip confetti for reduced motion users
    if (!reduceMotion) {
      confettiRef.current?.start();
    }
    // Call onComplete after celebration finishes
    setTimeout(() => {
      onComplete?.();
    }, reduceMotion ? 1000 : 2500);
  };

  useEffect(() => {
    // Start the celebration sequence after a brief delay
    const timer = setTimeout(() => {
      if (reduceMotion) {
        // Reduced motion: simple opacity cross-fade (no scale, no confetti)
        mascotOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(setDisplayedTier)(newTier);
            mascotOpacity.value = withTiming(1, { duration: 200 });
            runOnJS(setShowMessage)(true);
            messageOpacity.value = withTiming(1, { duration: 200 });
            runOnJS(triggerConfetti)();
          }
        });
      } else {
        // Full motion: Scale mascot out
        mascotScale.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            // Phase 2: Switch to new tier image and fire confetti
            runOnJS(setDisplayedTier)(newTier);
            runOnJS(triggerConfetti)();

            // Phase 3: Scale mascot back in with spring after confetti starts
            setTimeout(() => {
              mascotScale.value = withSpring(1, Easings.bouncy);
              // Show "Level Up!" message
              runOnJS(setShowMessage)(true);
              messageOpacity.value = withSpring(1, Easings.gentle);
            }, 200);
          }
        });
      }
    }, 500); // Initial delay to let results screen settle

    return () => clearTimeout(timer);
  }, [newTier, reduceMotion]);

  const mascotAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      // Reduced motion: only opacity, no scale transform
      return {
        opacity: mascotOpacity.value,
        transform: [{ scale: 1 }],
      };
    }
    return {
      opacity: 1,
      transform: [{ scale: mascotScale.value }],
    };
  });

  const messageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Mascot with scale animation */}
      <Animated.View style={[styles.mascotWrapper, mascotAnimatedStyle]}>
        <TriMascot
          mood="happy"
          size="lg"
          tier={displayedTier}
          context="home"
        />
      </Animated.View>

      {/* Level Up message */}
      {showMessage && (
        <Animated.View style={[styles.messageContainer, messageAnimatedStyle]}>
          <Text variant="display" color={theme.colors.brand.primary} style={styles.levelUpText}>
            Level Up!
          </Text>
          <Text variant="heading" style={styles.tierName}>
            You're now a {newTierName}
          </Text>
        </Animated.View>
      )}

      {/* Confetti */}
      {/* DESIGN SYSTEM EXCEPTION: Confetti colors are celebration-specific */}
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: width / 2, y: -10 }}
        fallSpeed={3000}
        fadeOut
        autoStart={false}
        colors={['#3B82F6', '#22C55E', '#FACC15', '#F97316', '#EC4899', '#8B5CF6']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  levelUpText: {
    fontSize: 32,
  },
  tierName: {
    marginTop: Spacing.xs,
  },
});
