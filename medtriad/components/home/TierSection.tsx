import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { TierBadge } from './TierBadge';
import { TierProgressBar } from '@/components/progress/TierProgressBar';
import { TierDefinition } from '@/services/mastery';
import { Colors, Typography, Spacing, Easings } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TierSectionProps = {
  tier: TierDefinition;
  tierProgress: number;
  onPress?: () => void;
};

/**
 * Tier display section for HeroCard showing badge, tier name, and progress bar.
 *
 * Features:
 * - Shield badge with tier number
 * - Tier name text
 * - TierProgressBar below (animates from 0 on mount)
 * - Press animation (scale 0.97) with tap-to-navigate
 * - Progress bar animates from empty to current progress after 300ms delay
 *
 * Usage:
 *   <TierSection
 *     tier={tier}
 *     tierProgress={tierProgress}
 *     onPress={() => router.push('/(tabs)/progress')}
 *   />
 */
export function TierSection({ tier, tierProgress, onPress }: TierSectionProps) {
  const colors = Colors.light;
  const scale = useSharedValue(1);

  // Guard against undefined tier (can happen during hot reload)
  if (!tier) {
    return null;
  }

  // Animate progress from 0 to actual value on mount
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // Delay progress fill animation so it happens after entry animation
    const timer = setTimeout(() => {
      setDisplayProgress(tierProgress);
    }, 300);
    return () => clearTimeout(timer);
  }, [tierProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, Easings.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Easings.press);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      {/* Badge and tier name row */}
      <View style={styles.row}>
        <TierBadge tierNumber={tier.tier} />
        <Text style={[styles.tierName, { color: colors.text }]}>
          {tier.name}
        </Text>
      </View>

      {/* Progress bar below */}
      <View style={styles.progressContainer}>
        <TierProgressBar progress={displayProgress} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tierName: {
    ...Typography.label,
  },
  progressContainer: {
    marginTop: Spacing.xs,
    // Match width of badge + gap + reasonable name width
    width: 120,
  },
});
