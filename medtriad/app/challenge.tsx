import { StyleSheet, View, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { ShareCard } from '@/components/share/ShareCard';
import { Text } from '@/components/primitives';
import { useShareCard } from '@/hooks/useShareCard';
import { useStats } from '@/hooks/useStats';
import { theme, Spacing, Radius } from '@/constants/theme';

const CARD_WIDTH = 360;
const CARD_HEIGHT = 450;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ChallengeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { cardRef, share, isSharing } = useShareCard();
  const { highScore, userName } = useStats();

  // Scale preview to fit screen with generous padding
  const previewWidth = Math.min(CARD_WIDTH, screenWidth * 0.82);
  const previewScale = previewWidth / CARD_WIDTH;
  const previewHeight = CARD_HEIGHT * previewScale;

  // Button animation
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleShare = async () => {
    await share('Challenge a Friend');
  };

  const handleDismiss = () => {
    router.back();
  };

  return (
    <Pressable style={styles.backdrop} onPress={handleDismiss}>
      <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {/* Pull handle */}
        <Animated.View
          entering={FadeIn.delay(100).duration(300)}
          style={styles.handleContainer}
        >
          <View style={styles.handle} />
        </Animated.View>

        {/* The Card - the hero */}
        <Animated.View
          entering={FadeInUp.delay(50).duration(400).springify().damping(20)}
          style={[
            styles.cardContainer,
            {
              width: previewWidth,
              height: previewHeight,
            },
          ]}
        >
          <View
            style={[
              styles.cardScaler,
              {
                transform: [{ scale: previewScale }],
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
              },
            ]}
          >
            <ShareCard score={highScore} variant="highscore" userName={userName} />
          </View>
        </Animated.View>

        {/* Share button */}
        <AnimatedPressable
          entering={FadeInUp.delay(200).duration(400).springify()}
          onPress={handleShare}
          onPressIn={() => {
            buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
          }}
          onPressOut={() => {
            buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
          }}
          disabled={isSharing}
          style={[
            styles.shareButton,
            buttonAnimatedStyle,
            isSharing && styles.shareButtonDisabled,
          ]}
        >
          <Text variant="label" weight="bold" color={theme.colors.text.inverse}>
            {isSharing ? 'SHARING...' : 'SHARE'}
          </Text>
        </AnimatedPressable>

        {/* Dismiss text */}
        <Animated.View entering={FadeIn.delay(400).duration(300)}>
          <Pressable onPress={handleDismiss} hitSlop={20}>
            <Text variant="caption" color="tertiary" style={styles.dismissText}>
              Tap anywhere to close
            </Text>
          </Pressable>
        </Animated.View>

        {/* Hidden off-screen card for capture */}
        <View style={styles.offscreen}>
          <View ref={cardRef} collapsable={false}>
            <ShareCard score={highScore} variant="highscore" userName={userName} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.surface.primary,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  handleContainer: {
    paddingVertical: Spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border.default,
  },
  cardContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    // Elegant shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    backgroundColor: theme.colors.surface.primary,
  },
  cardScaler: {
    position: 'absolute',
    top: 0,
    left: 0,
    transformOrigin: 'top left',
  },
  shareButton: {
    backgroundColor: theme.colors.brand.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl * 2,
    borderRadius: Radius.full,
    marginBottom: Spacing.lg,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  dismissText: {
    marginBottom: Spacing.md,
  },
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
});
