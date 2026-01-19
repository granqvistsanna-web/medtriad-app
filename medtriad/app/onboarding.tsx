import { View, FlatList, useWindowDimensions, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeInUp,
  runOnJS,
} from 'react-native-reanimated';
import { useState, useCallback } from 'react';

import { TriMascot, MascotMood } from '@/components/home/TriMascot';
import { PaginationDots } from '@/components/onboarding/PaginationDots';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, Durations } from '@/constants/theme';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<PageData>);

type PageData = {
  id: string;
  title: string;
  subtitle: string;
  mascotMood: MascotMood;
};

const PAGES: PageData[] = [
  {
    id: '1',
    title: 'Welcome to MedTriads',
    subtitle: 'Test your knowledge of classic medical triads',
    mascotMood: 'neutral',
  },
  {
    id: '2',
    title: 'How It Works',
    subtitle: 'See three findings, name the diagnosis. Quick 10-question rounds.',
    mascotMood: 'happy',
  },
  {
    id: '3',
    title: 'Ready to Start?',
    subtitle: 'Build streaks, climb tiers, master all 15 triads!',
    mascotMood: 'streak',
  },
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = Colors.light;

  const scrollX = useSharedValue(0);
  const [currentPage, setCurrentPage] = useState(0);

  const updateCurrentPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const page = Math.round(event.contentOffset.x / width);
      runOnJS(updateCurrentPage)(page);
    },
  });

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  const isLastPage = currentPage === PAGES.length - 1;

  const renderPage = ({ item, index }: { item: PageData; index: number }) => (
    <View style={[styles.page, { width, paddingTop: insets.top + 80 }]}>
      <Animated.View
        entering={FadeInUp.delay(index * Durations.stagger)
          .duration(Durations.normal)
          .springify()}
      >
        <TriMascot mood={item.mascotMood} size="xl" />
      </Animated.View>

      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {item.subtitle}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button - always visible */}
      <Pressable
        onPress={handleSkip}
        style={[
          styles.skipButton,
          { top: insets.top + Spacing.sm, right: Spacing.lg },
        ]}
      >
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>
          Skip
        </Text>
      </Pressable>

      {/* Pages */}
      <AnimatedFlatList
        data={PAGES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={renderPage}
      />

      {/* Bottom section: Pagination dots + Get Started button */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <PaginationDots scrollX={scrollX} count={PAGES.length} width={width} />

        {/* Show Get Started button on last page */}
        {isLastPage && (
          <Animated.View
            entering={FadeInUp.duration(Durations.normal).springify()}
            style={styles.buttonContainer}
          >
            <Button
              label="Get Started"
              icon="play.fill"
              onPress={handleGetStarted}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    ...Typography.label,
  },
  page: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    ...Typography.title,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  bottomSection: {
    paddingHorizontal: Spacing.lg,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
});
