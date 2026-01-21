import { ScrollView, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { theme, Spacing, Radius } from '@/constants/theme';
import { Text } from '@/components/primitives';
import { TriadCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/constants/tokens/category-colors';

interface FilterChipsProps {
  categories: TriadCategory[];
  selectedCategory: TriadCategory | null;
  onSelectCategory: (category: TriadCategory | null) => void;
  categoryCounts: Record<TriadCategory, number>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FilterChip({
  category,
  isSelected,
  count,
  onPress,
  index,
}: {
  category: TriadCategory | 'all';
  isSelected: boolean;
  count: number;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 20, stiffness: 400 });
    translateY.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 350 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 350 });
  };

  const isAll = category === 'all';
  const categoryColor = isAll ? null : CATEGORY_COLORS[category];

  // Colors based on selection state
  const backgroundColor = isSelected
    ? isAll
      ? theme.colors.brand.primary
      : categoryColor?.activeBg ?? theme.colors.brand.primary
    : theme.colors.surface.card;

  const borderColor = isSelected
    ? isAll
      ? theme.colors.brand.primaryDark
      : categoryColor?.activeBg ?? theme.colors.brand.primaryDark
    : theme.colors.border.default;

  const borderBottomColor = isSelected
    ? isAll
      ? theme.colors.brand.primaryDarker
      : categoryColor?.text ?? theme.colors.brand.primaryDarker
    : theme.colors.border.strong;

  const textColor = isSelected
    ? theme.colors.text.inverse
    : isAll
      ? theme.colors.text.secondary
      : categoryColor?.text ?? theme.colors.text.secondary;

  const countBgColor = isSelected
    ? 'rgba(255, 255, 255, 0.2)'
    : isAll
      ? theme.colors.surface.secondary
      : categoryColor?.bg ?? theme.colors.surface.secondary;

  const label = isAll ? 'All categories' : CATEGORY_LABELS[category];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor,
          borderBottomColor,
        },
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${count} ${count === 1 ? 'triad' : 'triads'}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        variant="footnote"
        color={textColor}
        weight={isSelected ? 'semibold' : 'medium'}
      >
        {isAll ? 'All' : CATEGORY_LABELS[category]}
      </Text>
      <View style={[styles.countBadge, { backgroundColor: countBgColor }]}>
        <Text
          variant="tiny"
          color={textColor}
          weight="semibold"
        >
          {count}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

export function FilterChips({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: FilterChipsProps) {
  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <Animated.View entering={FadeIn.duration(250).delay(60)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <FilterChip
          category="all"
          isSelected={selectedCategory === null}
          count={totalCount}
          onPress={() => onSelectCategory(null)}
          index={0}
        />
        {categories.map((category, index) => (
          <FilterChip
            key={category}
            category={category}
            isSelected={selectedCategory === category}
            count={categoryCounts[category] || 0}
            onPress={() => onSelectCategory(selectedCategory === category ? null : category)}
            index={index + 1}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

export { CATEGORY_COLORS, CATEGORY_LABELS };

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    // Duolingo-style 3D border treatment
    borderWidth: 2,
    borderBottomWidth: 3,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  countBadge: {
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
});
