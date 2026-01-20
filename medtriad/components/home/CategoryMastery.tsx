import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme, Radius, Spacing, Durations, Easings } from '@/constants/theme';
import { Text } from '@/components/primitives';
import { TriadCategory } from '@/types/triad';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Display names for categories - using unified color scheme
const CATEGORY_NAMES: Record<TriadCategory, string> = {
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

type CategoryCardProps = {
  category: TriadCategory;
  masteryPercent: number;
  delay: number;
  onPress?: () => void;
};

function CategoryCard({ category, masteryPercent, delay, onPress }: CategoryCardProps) {
  const categoryName = CATEGORY_NAMES[category];
  const scale = useSharedValue(1);
  const borderBottom = useSharedValue(4);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, Easings.press);
    borderBottom.value = withSpring(2, Easings.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Easings.press);
    borderBottom.value = withSpring(4, Easings.press);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.cardWrapper}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, animatedStyle]}
      >
        <Text variant="caption" color="primary" weight="semibold">
          {categoryName}
        </Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${masteryPercent}%` }
            ]}
          />
        </View>

        <Text variant="footnote" color="secondary" weight="semibold" align="right">
          {masteryPercent}%
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

type CategoryMasteryProps = {
  categoryMastery: Partial<Record<TriadCategory, number>>;
  delay?: number;
  onCategoryPress?: (category: TriadCategory) => void;
};

export function CategoryMastery({
  categoryMastery,
  delay = 0,
  onCategoryPress,
}: CategoryMasteryProps) {
  // Get top 4 categories to display (or all if less than 4)
  const categories: TriadCategory[] = ['cardiology', 'neurology', 'pulmonary', 'endocrine'];

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.container}
    >
      {/* Section heading */}
      <View style={styles.headingRow}>
        <Text variant="tiny" color="muted">
          CATEGORY MASTERY
        </Text>
        <View style={[styles.headingLine, { backgroundColor: theme.colors.border.default }]} />
      </View>

      {/* Category grid */}
      <View style={styles.grid}>
        <View style={styles.row}>
          <CategoryCard
            category={categories[0]}
            masteryPercent={categoryMastery[categories[0]] ?? 0}
            delay={delay + Durations.stagger}
            onPress={() => onCategoryPress?.(categories[0])}
          />
          <CategoryCard
            category={categories[1]}
            masteryPercent={categoryMastery[categories[1]] ?? 0}
            delay={delay + Durations.stagger * 2}
            onPress={() => onCategoryPress?.(categories[1])}
          />
        </View>
        <View style={styles.row}>
          <CategoryCard
            category={categories[2]}
            masteryPercent={categoryMastery[categories[2]] ?? 0}
            delay={delay + Durations.stagger * 3}
            onPress={() => onCategoryPress?.(categories[2])}
          />
          <CategoryCard
            category={categories[3]}
            masteryPercent={categoryMastery[categories[3]] ?? 0}
            delay={delay + Durations.stagger * 4}
            onPress={() => onCategoryPress?.(categories[3])}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headingLine: {
    flex: 1,
    height: 1,
  },
  grid: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    minHeight: 90,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface.card,
    borderColor: 'rgba(139, 34, 82, 0.15)',
    borderBottomColor: 'rgba(139, 34, 82, 0.3)',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: Spacing.xs,
    backgroundColor: theme.colors.surface.brand,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.colors.brand.primary,
  },
});
