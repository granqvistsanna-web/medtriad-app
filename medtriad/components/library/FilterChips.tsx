import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius, Easings } from '@/constants/theme';
import { TriadCategory } from '@/types';

// Category colors - soft, medical-inspired palette
const CATEGORY_COLORS: Record<TriadCategory, { bg: string; text: string; activeBg: string }> = {
  cardiology: { bg: '#FEE2E2', text: '#DC2626', activeBg: '#DC2626' },
  neurology: { bg: '#E0E7FF', text: '#4F46E5', activeBg: '#4F46E5' },
  endocrine: { bg: '#FEF3C7', text: '#D97706', activeBg: '#D97706' },
  pulmonary: { bg: '#DBEAFE', text: '#2563EB', activeBg: '#2563EB' },
  gastroenterology: { bg: '#D1FAE5', text: '#059669', activeBg: '#059669' },
  infectious: { bg: '#FCE7F3', text: '#DB2777', activeBg: '#DB2777' },
  hematology: { bg: '#FEE2E2', text: '#B91C1C', activeBg: '#B91C1C' },
  rheumatology: { bg: '#F3E8FF', text: '#7C3AED', activeBg: '#7C3AED' },
  renal: { bg: '#CFFAFE', text: '#0891B2', activeBg: '#0891B2' },
  obstetrics: { bg: '#FDF2F8', text: '#BE185D', activeBg: '#BE185D' },
};

// Display names for categories
const CATEGORY_LABELS: Record<TriadCategory, string> = {
  cardiology: 'Cardiology',
  neurology: 'Neurology',
  endocrine: 'Endocrine',
  pulmonary: 'Pulmonary',
  gastroenterology: 'GI',
  infectious: 'Infectious',
  hematology: 'Hematology',
  rheumatology: 'Rheumatology',
  renal: 'Renal',
  obstetrics: 'OB/GYN',
};

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
  const colors = Colors.light;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const isAll = category === 'all';
  const categoryColor = isAll ? null : CATEGORY_COLORS[category];

  const backgroundColor = isSelected
    ? isAll
      ? colors.primary
      : categoryColor!.activeBg
    : isAll
    ? colors.backgroundSecondary
    : categoryColor!.bg;

  const textColor = isSelected
    ? colors.textInverse
    : isAll
    ? colors.text
    : categoryColor!.text;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.chip, { backgroundColor }, animatedStyle]}
    >
      <Text style={[styles.chipLabel, { color: textColor }]}>
        {isAll ? 'All' : CATEGORY_LABELS[category]}
      </Text>
      <View style={[styles.countBadge, { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)' }]}>
        <Text style={[styles.countText, { color: textColor }]}>{count}</Text>
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
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  chipLabel: {
    ...Typography.footnote,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    ...Typography.tiny,
    fontWeight: '700',
  },
});
