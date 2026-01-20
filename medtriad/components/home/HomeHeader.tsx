import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Star, Fire } from '@solar-icons/react-native/Bold';
import { theme, Spacing, Durations } from '@/constants/theme';
import { Text, Badge } from '@/components/primitives';

/**
 * Get time-based greeting
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

type HomeHeaderProps = {
  delay?: number;
  totalPoints?: number;
  dailyStreak?: number;
};

export function HomeHeader({ delay = 0, totalPoints = 0, dailyStreak = 0 }: HomeHeaderProps) {
  const greeting = getGreeting();

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.container}
    >
      <Text variant="titleLarge" color="primary">
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
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
