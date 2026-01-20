import { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Magnifer, BookBookmark } from '@solar-icons/react-native/Bold';
import { theme, Spacing, Radius } from '@/constants/theme';
import { getAllTriads, getTriadsByCategory } from '@/services/triads';
import { TriadCategory } from '@/types';
import { SearchBar } from '@/components/library/SearchBar';
import { FilterChips } from '@/components/library/FilterChips';
import { TriadCard } from '@/components/library/TriadCard';
import { Text, Icon } from '@/components/primitives';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TriadCategory | null>(null);

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
  const hasFilters = searchQuery.trim() || selectedCategory;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]} edges={['top']}>
      {/* Fixed header with search and filters */}
      <View style={styles.header}>
        <Animated.View entering={FadeIn.duration(250)} style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <View style={styles.titleIcon}>
              <Icon icon={BookBookmark} size="lg" color={theme.colors.brand.primary} />
            </View>
            <Text variant="title" color="primary">Library</Text>
          </View>
          <View style={styles.countBadge}>
            <Text variant="label" color={theme.colors.brand.primary} weight="bold">
              {allTriads.length}
            </Text>
            <Text variant="tiny" color="secondary">
              triads
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(250).delay(30)} style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
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
        estimatedItemSize={140}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          hasFilters && !showEmptyState ? (
            <Animated.View entering={FadeIn.duration(200)} style={styles.resultsHeader}>
              <Text variant="footnote" color="secondary">
                {filteredTriads.length} {filteredTriads.length === 1 ? 'result' : 'results'}
              </Text>
            </Animated.View>
          ) : null
        }
        ListEmptyComponent={
          showEmptyState ? (
            <Animated.View entering={FadeIn.duration(200)} style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.colors.brand.accent }]}>
                <Icon icon={Magnifer} size="lg" color={theme.colors.brand.primary} />
              </View>
              <Text variant="heading" color="primary" style={styles.emptyTitle}>
                No triads found
              </Text>
              <Text variant="caption" color="secondary" align="center">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : 'Try adjusting your filters'}
              </Text>
            </Animated.View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.base,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    paddingBottom: Spacing.md,
    backgroundColor: theme.colors.surface.primary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: theme.colors.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    alignItems: 'flex-end',
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
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.brand.primary,
  },
  emptyTitle: {
    marginBottom: Spacing.xs,
  },
});
