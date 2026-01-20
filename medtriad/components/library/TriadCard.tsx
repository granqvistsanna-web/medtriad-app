import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { theme, Spacing, Radius } from '@/constants/theme';
import { Text } from '@/components/primitives';
import { Triad } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from './FilterChips';

interface TriadCardProps {
  triad: Triad;
  index: number;
  searchQuery?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function highlightText(text: string, query: string, color: string) {
  if (!query.trim()) return <Text variant="caption" color={color} weight="medium">{text}</Text>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} variant="caption" color={color} weight="medium" style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={i} variant="caption" color={color} weight="medium">{part}</Text>
        )
      )}
    </>
  );
}

function highlightCondition(text: string, query: string) {
  if (!query.trim()) return <Text variant="body" color="primary" weight="bold">{text}</Text>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} variant="body" color="primary" weight="bold" style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={i} variant="body" color="primary" weight="bold">{part}</Text>
        )
      )}
    </>
  );
}

export const TriadCard = React.memo(function TriadCard({
  triad,
  index,
  searchQuery = '',
}: TriadCardProps) {
  const categoryColor = CATEGORY_COLORS[triad.category];
  const scale = useSharedValue(1);
  const borderBottom = useSharedValue(4);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
    borderBottom.value = withSpring(2, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    borderBottom.value = withSpring(4, { damping: 20, stiffness: 400 });
  };

  // Subtle fade-in with minimal stagger
  return (
    <Animated.View
      entering={FadeInUp.delay(Math.min(index * 25, 200))
        .duration(250)
        .damping(20)
        .stiffness(200)}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            borderColor: categoryColor.bg,
            borderBottomColor: categoryColor.activeBg,
          },
          animatedStyle,
        ]}
      >
        {/* Top accent bar with category color */}
        <View style={[styles.accentBar, { backgroundColor: categoryColor.activeBg }]} />

        <View style={styles.content}>
          {/* Header row with condition and category badge */}
          <View style={styles.header}>
            <View style={styles.conditionContainer}>
              {highlightCondition(triad.condition, searchQuery)}
            </View>
            <View style={[
              styles.categoryBadge,
              {
                backgroundColor: categoryColor.bg,
                borderColor: categoryColor.activeBg,
              }
            ]}>
              <Text variant="tiny" color={categoryColor.text} weight="bold">
                {CATEGORY_LABELS[triad.category]}
              </Text>
            </View>
          </View>

          {/* Findings - displayed as a visual triad with numbers */}
          <View style={styles.findingsContainer}>
            {triad.findings.map((finding, i) => (
              <View
                key={i}
                style={[
                  styles.findingPill,
                  {
                    backgroundColor: categoryColor.bg,
                    borderColor: `${categoryColor.activeBg}20`,
                  },
                ]}
              >
                <View style={[styles.findingNumber, { backgroundColor: categoryColor.activeBg }]}>
                  <Text variant="tiny" color={theme.colors.text.inverse} weight="bold">
                    {i + 1}
                  </Text>
                </View>
                <View style={styles.findingTextContainer}>
                  {highlightText(finding, searchQuery, categoryColor.text)}
                </View>
              </View>
            ))}
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: theme.colors.surface.card,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: Radius.lg,
    ...theme.shadows.sm,
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  content: {
    flex: 1,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  conditionContainer: {
    flex: 1,
  },
  highlight: {
    backgroundColor: theme.colors.warning.light,
    borderRadius: 2,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  findingsContainer: {
    gap: Spacing.sm,
  },
  findingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.md,
    borderWidth: 1,
  },
  findingNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findingTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
