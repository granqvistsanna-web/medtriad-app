import { View, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/primitives';
import { TriadCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/constants/tokens/category-colors';
import { theme, Spacing, Radius, Durations } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CategoryChipProps {
  category: TriadCategory;
  isSelected: boolean;
  count: number;
  onPress: () => void;
  index: number;
}

function CategoryChip({
  category,
  isSelected,
  count,
  onPress,
  index,
}: CategoryChipProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const categoryColor = CATEGORY_COLORS[category];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
    translateY.value = withSpring(2, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? categoryColor.bg : theme.colors.surface.card,
          borderColor: isSelected ? categoryColor.activeBg : theme.colors.border.default,
          borderBottomColor: isSelected ? categoryColor.activeBg : theme.colors.border.strong,
        },
        animatedStyle,
      ]}
      accessibilityRole="checkbox"
      accessibilityLabel={`${CATEGORY_LABELS[category]}, ${count} triads`}
      accessibilityState={{ checked: isSelected }}
      entering={FadeInDown.duration(250).delay(index * Durations.stagger)}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: isSelected
              ? categoryColor.activeBg
              : theme.colors.border.default,
          },
        ]}
      >
        {isSelected && (
          <Ionicons name="checkmark" size={14} color={theme.colors.text.inverse} />
        )}
      </View>
      <View style={styles.chipText}>
        <Text
          variant="footnote"
          weight="semibold"
          color={isSelected ? categoryColor.text : theme.colors.text.primary}
          numberOfLines={1}
        >
          {CATEGORY_LABELS[category]}
        </Text>
        <Text
          variant="tiny"
          color={isSelected ? categoryColor.text : theme.colors.text.secondary}
        >
          {count} {count === 1 ? 'triad' : 'triads'}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

interface StudyCategoryFilterProps {
  selectedCategories: Set<TriadCategory>;
  onToggleCategory: (category: TriadCategory) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  categoryCounts: Record<TriadCategory, number>;
}

export function StudyCategoryFilter({
  selectedCategories,
  onToggleCategory,
  onSelectAll,
  onDeselectAll,
  categoryCounts,
}: StudyCategoryFilterProps) {
  const categories = Object.keys(CATEGORY_LABELS) as TriadCategory[];
  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const selectedCount = categories
    .filter(c => selectedCategories.has(c))
    .reduce((sum, c) => sum + (categoryCounts[c] || 0), 0);
  const allSelected = selectedCategories.size === categories.length;
  const noneSelected = selectedCategories.size === 0;

  return (
    <View style={styles.container}>
      {/* Select All Toggle Row */}
      <Animated.View
        entering={FadeIn.duration(250)}
        style={styles.toggleRow}
      >
        <View>
          <Text variant="body" weight="semibold">
            All Categories
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            {totalCount} triads total
          </Text>
        </View>
        <Pressable
          onPress={allSelected ? onDeselectAll : onSelectAll}
          style={[
            styles.toggle,
            { backgroundColor: allSelected ? theme.colors.brand.primary : theme.colors.border.default },
          ]}
          accessibilityRole="switch"
          accessibilityLabel="Toggle all categories"
          accessibilityState={{ checked: allSelected }}
        >
          <View
            style={[
              styles.toggleKnob,
              { transform: [{ translateX: allSelected ? 20 : 0 }] },
            ]}
          />
        </Pressable>
      </Animated.View>

      {/* Category Grid */}
      <View style={styles.grid}>
        {categories.map((category, index) => (
          <CategoryChip
            key={category}
            category={category}
            isSelected={selectedCategories.has(category)}
            count={categoryCounts[category] || 0}
            onPress={() => onToggleCategory(category)}
            index={index}
          />
        ))}
      </View>

      {/* Selection Summary */}
      <Animated.View
        entering={FadeIn.duration(250).delay(categories.length * Durations.stagger)}
        style={[
          styles.summary,
          {
            backgroundColor: noneSelected
              ? theme.colors.danger.light
              : theme.colors.surface.brand,
            borderColor: noneSelected
              ? theme.colors.danger.main
              : theme.colors.brand.primary,
          },
        ]}
      >
        <Text
          variant="footnote"
          weight="medium"
          color={noneSelected ? theme.colors.danger.main : theme.colors.brand.primary}
        >
          {noneSelected
            ? 'No categories selected'
            : allSelected
            ? `All ${totalCount} triads selected`
            : `${selectedCount} triads from ${selectedCategories.size} ${
                selectedCategories.size === 1 ? 'category' : 'categories'
              }`}
        </Text>
        <Text
          variant="tiny"
          color={noneSelected ? theme.colors.danger.main : theme.colors.text.secondary}
        >
          {noneSelected
            ? 'Select at least one category to start'
            : `${Math.min(10, selectedCount)} questions per session`}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: theme.colors.surface.card,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: Radius.full,
    padding: 3,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    backgroundColor: theme.colors.surface.card,
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderBottomWidth: 3,
    gap: Spacing.base,
    width: '48%',
    flexGrow: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    flex: 1,
  },
  summary: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: Spacing.xs,
  },
});
