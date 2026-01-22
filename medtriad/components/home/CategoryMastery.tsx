import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AltArrowRight } from '@solar-icons/react-native/Linear';
import { theme, Radius, Spacing, Durations, Easings } from '@/constants/theme';
import { Text, Icon } from '@/components/primitives';
import { TriadCategory } from '@/types/triad';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/constants/tokens/category-colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CategoryCardProps = {
  category: TriadCategory;
  masteryPercent: number;
  delay: number;
  onPress?: () => void;
};

function CategoryCard({ category, masteryPercent, delay, onPress }: CategoryCardProps) {
  const categoryName = CATEGORY_LABELS[category];
  const colors = CATEGORY_COLORS[category];
  const scale = useSharedValue(1);
  const borderBottom = useSharedValue(3);
  const progressWidth = useSharedValue(0);

  // Animate progress bar on mount
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Trigger animation after component mounts
  React.useEffect(() => {
    progressWidth.value = withSpring(masteryPercent, {
      damping: 15,
      stiffness: 80,
    });
  }, [masteryPercent]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, Easings.press);
    borderBottom.value = withSpring(1.5, Easings.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Easings.press);
    borderBottom.value = withSpring(3, Easings.press);
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
        style={[
          styles.card,
          animatedStyle,
          {
            backgroundColor: colors.bg,
            borderColor: `${colors.text}20`,
            borderBottomColor: `${colors.text}40`,
          },
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${categoryName}, ${masteryPercent}% mastery`}
        accessibilityHint="Double tap to filter quizzes by this category"
      >
        <View style={styles.cardHeader}>
          <Text variant="caption" weight="semibold" style={[styles.categoryName, { color: colors.text }]}>
            {categoryName}
          </Text>
          <Icon icon={AltArrowRight} size="sm" color={colors.text} style={{ opacity: 0.35 }} />
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: `${colors.text}15` }]}>
          <Animated.View
            style={[
              styles.progressFill,
              progressAnimatedStyle,
              { backgroundColor: colors.activeBg }
            ]}
          />
        </View>

        <Text variant="footnote" weight="semibold" align="right" style={{ color: colors.text, opacity: 0.7 }}>
          {masteryPercent}%
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

// All available categories
const ALL_CATEGORIES: TriadCategory[] = [
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
  const [expanded, setExpanded] = useState(false);

  // Chevron rotation animation
  const chevronRotation = useSharedValue(0);

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const toggleExpanded = () => {
    setExpanded(!expanded);
    chevronRotation.value = withSpring(expanded ? 0 : 180, {
      damping: 15,
      stiffness: 150,
    });
  };

  // Sort categories by mastery percentage (highest first)
  const sortedCategories = [...ALL_CATEGORIES].sort((a, b) => {
    const aPercent = categoryMastery[a] ?? 0;
    const bPercent = categoryMastery[b] ?? 0;
    return bPercent - aPercent;
  });

  // Show top 6 by default, all when expanded
  const visibleCategories = expanded ? sortedCategories : sortedCategories.slice(0, 6);

  // Create rows of 2 categories each
  const rows: TriadCategory[][] = [];
  for (let i = 0; i < visibleCategories.length; i += 2) {
    rows.push(visibleCategories.slice(i, i + 2));
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
      style={styles.container}
    >
      {/* Section heading */}
      <View
        style={styles.headingRow}
        accessible={true}
        accessibilityRole="header"
      >
        <Text variant="tiny" color="muted">
          CATEGORY MASTERY
        </Text>
        <View style={[styles.headingLine, { backgroundColor: theme.colors.border.default }]} />
      </View>

      {/* Category grid */}
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((category, colIndex) => (
              <CategoryCard
                key={category}
                category={category}
                masteryPercent={categoryMastery[category] ?? 0}
                delay={expanded ? 0 : delay + Durations.stagger * (rowIndex * 2 + colIndex + 1)}
                onPress={() => onCategoryPress?.(category)}
              />
            ))}
            {/* Add empty spacer if odd number of items in last row */}
            {row.length === 1 && <View style={styles.cardWrapper} />}
          </View>
        ))}
      </View>

      {/* Show More / Show Less button */}
      <Pressable
        style={styles.showMoreButton}
        onPress={toggleExpanded}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Show fewer categories' : 'Show more categories'}
      >
        <Text variant="caption" color="secondary" weight="semibold">
          {expanded ? 'Show Less' : 'Show More'}
        </Text>
        <Animated.View style={chevronAnimatedStyle}>
          <Ionicons
            name="chevron-down"
            size={16}
            color={theme.colors.text.secondary}
          />
        </Animated.View>
      </Pressable>
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
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  categoryName: {
    flex: 1,
    flexWrap: 'wrap',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
});
