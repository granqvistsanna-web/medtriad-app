import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius, Shadows, Easings, CardStyle } from '@/constants/theme';
import { Triad } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from './FilterChips';

interface TriadCardProps {
  triad: Triad;
  index: number;
  searchQuery?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function highlightText(text: string, query: string) {
  if (!query.trim()) return <Text>{text}</Text>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <Text>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}

export const TriadCard = React.memo(function TriadCard({
  triad,
  index,
  searchQuery = '',
}: TriadCardProps) {
  const colors = Colors.light;
  const categoryColor = CATEGORY_COLORS[triad.category];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.99, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
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
            ...CardStyle,
          },
          animatedStyle,
        ]}
      >
        {/* Category accent bar */}
        <View style={[styles.accentBar, { backgroundColor: categoryColor.activeBg }]} />

        <View style={styles.content}>
          {/* Header row with condition and category badge */}
          <View style={styles.header}>
            <Text style={[styles.condition, { color: colors.text }]} numberOfLines={2}>
              {highlightText(triad.condition, searchQuery)}
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor.bg }]}>
              <Text style={[styles.categoryText, { color: categoryColor.text }]}>
                {CATEGORY_LABELS[triad.category]}
              </Text>
            </View>
          </View>

          {/* Findings - displayed as three pills */}
          <View style={styles.findingsContainer}>
            {triad.findings.map((finding, i) => (
              <View
                key={i}
                style={[
                  styles.findingPill,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <View style={[styles.findingDot, { backgroundColor: categoryColor.activeBg }]} />
                <Text style={[styles.findingText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {highlightText(finding, searchQuery)}
                </Text>
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
    flexDirection: 'row',
  },
  accentBar: {
    width: 4,
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
  condition: {
    ...Typography.body,
    fontWeight: '600',
    flex: 1,
  },
  highlight: {
    backgroundColor: '#FEF08A',
    borderRadius: 2,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  categoryText: {
    ...Typography.tiny,
    fontWeight: '600',
  },
  findingsContainer: {
    gap: Spacing.xs,
  },
  findingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    gap: Spacing.sm,
  },
  findingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  findingText: {
    ...Typography.caption,
    flex: 1,
  },
});
