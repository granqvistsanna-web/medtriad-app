import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Star, Fire } from '@solar-icons/react-native/Bold';
import { theme, Spacing, Durations } from '@/constants/theme';
import { Text, Badge } from '@/components/primitives';

/**
 * Get time-based greeting with optional name personalization
 */
function getGreeting(userName?: string | null): string {
  const hour = new Date().getHours();
  let timeGreeting: string;

  if (hour < 12) {
    timeGreeting = 'Good morning';
  } else if (hour < 17) {
    timeGreeting = 'Good afternoon';
  } else {
    timeGreeting = 'Good evening';
  }

  // Add name if available
  if (userName && userName.trim()) {
    return `${timeGreeting}, ${userName}`;
  }

  return timeGreeting;
}

type HomeHeaderProps = {
  delay?: number;
  totalPoints?: number;
  dailyStreak?: number;
  userName?: string | null;
};

export function HomeHeader({ delay = 0, totalPoints = 0, dailyStreak = 0, userName }: HomeHeaderProps) {
  const greeting = getGreeting(userName);

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.container}
    >
      <Text variant="titleLarge" color="primary" numberOfLines={1} style={styles.greeting}>
        {greeting}
      </Text>

      {/* Gamification badges - 3D pill style with numbers */}
      <View style={styles.badges}>
        {/* Star/XP Badge - Gold themed */}
        <Badge
          label={totalPoints.toLocaleString()}
          icon={Star}
          variant="gold"
          size="sm"
        />

        {/* Streak Badge - only show if streak > 0 */}
        {dailyStreak > 0 && (
          <Badge
            label={dailyStreak.toString()}
            icon={Fire}
            variant="streak"
            size="sm"
          />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  greeting: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexShrink: 0,
  },
});
