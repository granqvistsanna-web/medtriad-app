import { useState, useMemo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { theme, Spacing, Durations } from '@/constants/theme';
import { getAllTriads, getTriadsByCategory } from '@/services/triads';
import { TriadCategory } from '@/types';
import { SearchBar } from '@/components/library/SearchBar';
import { FilterChips } from '@/components/library/FilterChips';
import { TriadCard } from '@/components/library/TriadCard';
import { Text } from '@/components/primitives';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

// All 10 medical categories in display order
const CATEGORIES: TriadCategory[] = [
  'cardiology',
  'neurology',
  'endocrine',
  'pulmonary',
  'gastroenterology',
  'infectious',
  'hematology',
  'rheumatology',
  'renal',
  'obstetrics',
];

export default function LibraryScreen() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TriadCategory | null>(null);

  // Debounce search to prevent lag on every keystroke
  const searchQuery = useDebouncedValue(searchInput, 300);

  const allTriads = useMemo(() => getAllTriads(), []);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<TriadCategory, number> = {} as Record<TriadCategory, number>;
    CATEGORIES.forEach((cat) => {
      counts[cat] = getTriadsByCategory(cat).length;
    });
    return counts;
  }, []);

  // Filter triads based on search and category
  const filteredTriads = useMemo(() => {
    let triads = selectedCategory ? getTriadsByCategory(selectedCategory) : allTriads;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      triads = triads.filter(
        (triad) =>
          triad.condition.toLowerCase().includes(query) ||
          triad.findings.some((f) => f.toLowerCase().includes(query))
      );
    }

    return triads;
  }, [allTriads, selectedCategory, searchQuery]);

  const showEmptyState = filteredTriads.length === 0;
  const hasFilters = searchInput.trim() || selectedCategory;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]} edges={['top']}>
      {/* Fixed header with search and filters */}
      <View style={styles.header}>
        <Animated.View entering={FadeInUp.duration(Durations.normal).springify()} style={styles.titleRow}>
          <Text variant="titleLarge" color="primary">Library</Text>
          <Text variant="footnote" color="muted">{allTriads.length} triads</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(Durations.stagger).duration(Durations.normal).springify()} style={styles.searchContainer}>
          <SearchBar
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Search conditions or findings..."
          />
        </Animated.View>

        <FilterChips
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />
      </View>

      {/* Virtualized list results */}
      <FlashList
        data={filteredTriads}
        renderItem={({ item, index }) => (
          <TriadCard
            triad={item}
            index={index}
            searchQuery={searchQuery}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          hasFilters && !showEmptyState ? (
            <Animated.View entering={FadeIn.duration(200)} style={styles.resultsHeader}>
              <Text variant="footnote" color="primary" weight="medium">
                {filteredTriads.length} {filteredTriads.length === 1 ? 'result' : 'results'}
              </Text>
            </Animated.View>
          ) : null
        }
        ListEmptyComponent={
          showEmptyState ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
              <Image
                source={require('@/assets/images/tri-thinking.png')}
                style={styles.emptyMascot}
                resizeMode="contain"
              />
              <Text variant="body" color="primary" weight="semibold" style={styles.emptyTitle}>
                No triads found
              </Text>
              <Text variant="caption" color="muted" align="center">
                {searchInput
                  ? `No results for "${searchInput}"`
                  : 'Try adjusting your filters'}
              </Text>
            </Animated.View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        estimatedItemSize={140}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.md,
    gap: Spacing.lg, // Increased for better breathing room
    paddingBottom: Spacing.base,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
  },
  content: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  resultsHeader: {
    marginBottom: Spacing.base,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  emptyMascot: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.xs,
  },
});
