import { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Durations } from '@/constants/theme';
import { getAllTriads, getTriadsByCategory } from '@/services/triads';
import { TriadCategory } from '@/types';
import { SearchBar } from '@/components/library/SearchBar';
import { FilterChips } from '@/components/library/FilterChips';
import { TriadCard } from '@/components/library/TriadCard';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
  const colors = Colors.light;
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Fixed header with search and filters */}
      <View style={styles.header}>
        <Animated.View entering={FadeIn.duration(250)} style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>Library</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {allTriads.length} triads
          </Text>
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
              <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                {filteredTriads.length} {filteredTriads.length === 1 ? 'result' : 'results'}
              </Text>
            </Animated.View>
          ) : null
        }
        ListEmptyComponent={
          showEmptyState ? (
            <Animated.View entering={FadeIn.duration(200)} style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
                <IconSymbol name="magnifyingglass" size={32} color={colors.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No triads found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
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
    paddingTop: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    paddingBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.title,
  },
  subtitle: {
    ...Typography.footnote,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
  },
  content: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  resultsCount: {
    ...Typography.footnote,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.heading,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.caption,
    textAlign: 'center',
  },
});
