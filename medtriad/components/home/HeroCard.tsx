import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { TriMascot, MascotMood } from './TriMascot';
import { TierSection } from './TierSection';
import { TierDefinition } from '@/services/mastery';
import { Colors, Typography, Radius, Spacing, Durations } from '@/constants/theme';

type HeroCardProps = {
  isNewUser: boolean;
  accuracy: number;
  dailyStreak: number;
  lastPlayed?: Date | null;
  delay?: number;
  masteryLevel?: number;
  tier: TierDefinition;
  tierProgress: number;
  onTierPress?: () => void;
};

/**
 * Get dynamic hero content based on user state
 */
function getHeroContent(
  isNewUser: boolean,
  accuracy: number,
  dailyStreak: number,
  lastPlayed?: Date | null
): { title: string; subtitle: string } {
  if (isNewUser) {
    return {
      title: '15 medical triads',
      subtitle: 'Name the diagnosis from three classic symptoms',
    };
  }

  // Check if returning after break
  if (lastPlayed) {
    const daysSince = Math.floor(
      (Date.now() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince >= 3) {
      return {
        title: 'Welcome back!',
        subtitle: `It's been ${daysSince} days. Let's pick up where you left off`,
      };
    }
  }

  // Streak-based messages
  if (dailyStreak >= 7) {
    return {
      title: `${dailyStreak} day streak!`,
      subtitle: "You're on fire. Keep the momentum going",
    };
  }

  if (dailyStreak >= 3) {
    return {
      title: `${dailyStreak} day streak`,
      subtitle: 'Great consistency! Keep it up',
    };
  }

  // Accuracy-based messages
  if (accuracy >= 90) {
    return {
      title: 'Expert level!',
      subtitle: "You're mastering these triads",
    };
  }

  if (accuracy >= 70) {
    return {
      title: 'Solid progress',
      subtitle: 'Your knowledge is growing strong',
    };
  }

  return {
    title: 'Keep practicing',
    subtitle: 'Each quiz makes you stronger',
  };
}

/**
 * Determine mascot mood based on user state
 */
function getMascotMood(
  isNewUser: boolean,
  accuracy: number,
  dailyStreak: number
): MascotMood {
  if (isNewUser) return 'neutral';
  if (dailyStreak >= 7) return 'streak';
  if (accuracy >= 70 || dailyStreak >= 3) return 'happy';
  return 'neutral';
}

export function HeroCard({
  isNewUser,
  accuracy,
  dailyStreak,
  lastPlayed,
  delay = 0,
  masteryLevel = 0,
  tier,
  tierProgress,
  onTierPress,
}: HeroCardProps) {
  const colors = Colors.light;

  const { title, subtitle } = getHeroContent(isNewUser, accuracy, dailyStreak, lastPlayed);
  const mascotMood = getMascotMood(isNewUser, accuracy, dailyStreak);

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
    >
      <LinearGradient
        colors={[colors.primaryLight, '#F0FDFB', colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Mascot centered at top */}
        <View style={styles.mascotContainer}>
          <TriMascot
            mood={mascotMood}
            size="lg"
            masteryLevel={masteryLevel}
            tier={tier.tier}
            context="home"
          />
        </View>

        {/* Tier section below mascot */}
        <Animated.View
          entering={FadeInUp.delay(delay + Durations.stagger).duration(Durations.normal).springify()}
          style={styles.tierContainer}
        >
          <TierSection
            tier={tier}
            tierProgress={tierProgress}
            onPress={onTierPress}
          />
        </Animated.View>

        {/* Content centered below */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    ...Typography.heading,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    textAlign: 'center',
  },
});
