import { StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Spacing, Durations } from '@/constants/theme';
import { Text } from '@/components/primitives';

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
  userName?: string | null;
};

export function HomeHeader({ delay = 0, userName }: HomeHeaderProps) {
  const greeting = getGreeting(userName);

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.container}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel={greeting}
    >
      <Text variant="titleLarge" color="primary" numberOfLines={2}>
        {greeting}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.sm,
  },
});
