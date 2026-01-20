import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { theme, Spacing, Radius, CardStyle } from '@/constants/theme';
import { Text, Card } from '@/components/primitives';
import { Triad } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from './FilterChips';

interface TriadCardProps {
  triad: Triad;
  index: number;
  searchQuery?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function highlightText(text: string, query: string) {
  if (!query.trim()) return <Text variant="caption" color="secondary">{text}</Text>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} variant="caption" color="secondary" style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={i} variant="caption" color="secondary">{part}</Text>
        )
      )}
    </>
  );
}

function highlightCondition(text: string, query: string) {
  if (!query.trim()) return <Text variant="body" color="primary" weight="semibold">{text}</Text>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} variant="body" color="primary" weight="semibold" style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={i} variant="body" color="primary" weight="semibold">{part}</Text>
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
        <View style={styles.content}>
          {/* Header row with condition and category badge */}
          <View style={styles.header}>
            <View style={styles.conditionContainer}>
              {highlightCondition(triad.condition, searchQuery)}
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor.bg }]}>
              <Text variant="tiny" color={categoryColor.text} weight="semibold">
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
                  { backgroundColor: theme.colors.surface.secondary },
                ]}
              >
                <View style={[styles.findingDot, { backgroundColor: categoryColor.activeBg }]} />
                <View style={styles.findingTextContainer}>
                  {highlightText(finding, searchQuery)}
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
    flexShrink: 0,
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
  findingTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
