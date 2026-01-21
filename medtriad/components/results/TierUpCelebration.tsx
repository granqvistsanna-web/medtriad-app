import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Image } from 'expo-image';
import { Text, Button } from '@/components/primitives';
import { theme, Spacing, Easings } from '@/constants/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Tier-specific mascot images for sharp rendering
const TIER_IMAGES = {
  1: require('@/assets/images/tri-lvl1.png'),
  2: require('@/assets/images/tri-lvl2.png'),
  3: require('@/assets/images/tri-lvl3.png'),
  4: require('@/assets/images/tri-lvl4.png'),
  5: require('@/assets/images/tri-lvl5.png'),
  6: require('@/assets/images/tri-lvl6.png'),
} as const;

// Large celebration size for visual impact (accounts for pixel ratio)
const CELEBRATION_MASCOT_SIZE = 180;

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
  const [canDismiss, setCanDismiss] = useState(false);

  // Animation values
  const mascotScale = useSharedValue(1);
  const mascotOpacity = useSharedValue(1); // For reduced motion cross-fade
  const messageOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  const triggerConfetti = () => {
    // Skip confetti for reduced motion users
    if (!reduceMotion) {
      confettiRef.current?.start();
    }
  };

  const enableDismiss = () => {
    setCanDismiss(true);
    buttonOpacity.value = withDelay(400, withSpring(1, Easings.gentle));
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
            // Enable dismiss after animation settles
            runOnJS(enableDismiss)();
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
              // Enable dismiss after animation completes
              runOnJS(enableDismiss)();
            }, 200);
          }
        });
      }
    }, 500); // Initial delay to let results screen settle

    return () => clearTimeout(timer);
  }, [newTier, reduceMotion]);

  const handleDismiss = () => {
    if (canDismiss) {
      onComplete?.();
    }
  };

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

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const imageSource = TIER_IMAGES[displayedTier as keyof typeof TIER_IMAGES] ?? TIER_IMAGES[1];

  return (
    <View style={styles.container}>
      {/* Confetti - positioned absolutely to cover full screen */}
      {/* DESIGN SYSTEM EXCEPTION: Confetti colors are celebration-specific */}
      <View style={styles.confettiContainer} pointerEvents="none">
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

      {/* Content area - centered vertically */}
      <View style={styles.contentArea}>
        {/* Mascot with scale animation - using Image directly for sharper rendering */}
        <Animated.View style={[styles.mascotWrapper, mascotAnimatedStyle]}>
          <Image
            source={imageSource}
            style={styles.mascotImage}
            contentFit="contain"
            cachePolicy="memory-disk"
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
      </View>

      {/* Continue button - fixed at bottom with strong visual weight */}
      {canDismiss && (
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <Button
            label="Continue"
            onPress={handleDismiss}
            style={styles.continueButton}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: CELEBRATION_MASCOT_SIZE,
    height: CELEBRATION_MASCOT_SIZE,
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  levelUpText: {
    fontSize: 36,
  },
  tierName: {
    marginTop: Spacing.sm,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  continueButton: {
    minWidth: 200,
  },
});
