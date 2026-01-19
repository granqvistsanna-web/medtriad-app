import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import { TriMascot } from '@/components/home/TriMascot';
import { Colors, Typography, Spacing, Easings } from '@/constants/theme';

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
  const colors = Colors.light;
  const { width } = useWindowDimensions();
  const confettiRef = useRef<ConfettiCannon>(null);

  // Track which tier image to display
  const [displayedTier, setDisplayedTier] = useState(oldTier);
  const [showMessage, setShowMessage] = useState(false);

  // Animation values
  const mascotScale = useSharedValue(1);
  const messageOpacity = useSharedValue(0);

  const triggerConfetti = () => {
    confettiRef.current?.start();
    // Call onComplete after celebration finishes
    setTimeout(() => {
      onComplete?.();
    }, 2500);
  };

  useEffect(() => {
    // Start the celebration sequence after a brief delay
    const timer = setTimeout(() => {
      // Phase 1: Scale mascot out
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
    }, 500); // Initial delay to let results screen settle

    return () => clearTimeout(timer);
  }, [newTier]);

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mascotScale.value }],
  }));

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
          <Text style={[styles.levelUpText, { color: colors.primary }]}>
            Level Up!
          </Text>
          <Text style={[styles.tierName, { color: colors.text }]}>
            You're now a {newTierName}
          </Text>
        </Animated.View>
      )}

      {/* Confetti */}
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
    ...Typography.display,
    fontSize: 32,
    fontWeight: '700',
  },
  tierName: {
    ...Typography.heading,
    marginTop: Spacing.xs,
  },
});
