import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Play } from '@solar-icons/react-native/Bold';

import { Text, Button } from '@/components/primitives';
import { CancelButton } from '@/components/quiz/CancelButton';
import { StudyCategoryFilter } from '@/components/quiz/StudyCategoryFilter';
import { useStudyCategoryPreferences } from '@/hooks/useStudyCategoryPreferences';
import { getAllTriads } from '@/services/triads';
import { TriadCategory } from '@/types';

import { theme, Spacing, Radius, Durations } from '@/constants/theme';

/**
 * Study Mode Category Filter Screen
 *
 * Allows users to select which medical categories they want to practice
 * before starting a study session. Selection persists across sessions.
 */
export default function StudyFilterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    selectedCategories,
    isLoading,
    toggleCategory,
    selectAll,
    deselectAll,
    getSelectedArray,
  } = useStudyCategoryPreferences();

  // Calculate category counts from actual triads data
  const categoryCounts = useMemo(() => {
    const triads = getAllTriads();
    const counts: Record<TriadCategory, number> = {
      cardiology: 0,
      neurology: 0,
      endocrine: 0,
      pulmonary: 0,
      gastroenterology: 0,
      infectious: 0,
      hematology: 0,
      rheumatology: 0,
      renal: 0,
      obstetrics: 0,
    };
    triads.forEach(triad => {
      counts[triad.category]++;
    });
    return counts;
  }, []);

  // Calculate total selected triads
  const selectedTriadCount = useMemo(() => {
    return [...selectedCategories].reduce(
      (sum, category) => sum + (categoryCounts[category] || 0),
      0
    );
  }, [selectedCategories, categoryCounts]);

  const canStart = selectedCategories.size > 0;

  const handleStartStudy = () => {
    if (!canStart) return;

    // Navigate to study mode with selected categories as params
    const categories = getSelectedArray();
    router.push({
      pathname: '/quiz/study',
      params: {
        categories: categories.join(','),
      },
    });
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, Spacing.lg),
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <CancelButton onPress={handleCancel} />
        <Text variant="body" weight="semibold">
          Study Mode
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View
          entering={FadeIn.duration(Durations.normal)}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Ionicons
              name="book-outline"
              size={32}
              color={theme.colors.text.inverse}
            />
          </View>
          <Text variant="title" weight="bold" style={styles.heroTitle}>
            Choose Your Focus
          </Text>
          <Text
            variant="body"
            color={theme.colors.text.secondary}
            style={styles.heroSubtitle}
          >
            Select categories to practice. Train on everything or narrow your focus.
          </Text>
        </Animated.View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <StudyCategoryFilter
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            categoryCounts={categoryCounts}
          />
        </View>
      </ScrollView>

      {/* Fixed Footer with Start Button */}
      <Animated.View
        entering={FadeInDown.duration(Durations.normal).delay(300)}
        style={styles.footer}
      >
        <Button
          label={
            canStart
              ? `Start Studying${selectedTriadCount < 10 ? ` (${selectedTriadCount} available)` : ''}`
              : 'Select Categories'
          }
          variant="primary"
          size="lg"
          onPress={handleStartStudy}
          disabled={!canStart}
          icon={canStart ? Play : undefined}
          style={styles.startButton}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerSpacer: {
    width: 40, // Match CancelButton width
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100, // Space for fixed footer
  },
  hero: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    // 3D effect
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.brand.primaryDark,
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  heroSubtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  filterSection: {
    marginTop: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface.primary,
  },
  startButton: {
    width: '100%',
  },
});
