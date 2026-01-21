import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { theme, Spacing, Radius } from '@/constants/theme';
import { Text } from '@/components/primitives';
import { Triad } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/constants/tokens/category-colors';

interface TriadCardProps {
  triad: Triad;
  index: number;
  searchQuery?: string;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedText({
  text,
  query,
  variant,
  color,
  weight,
}: {
  text: string;
  query: string;
  variant: 'body' | 'caption';
  color: 'primary' | 'secondary';
  weight?: 'semibold' | 'medium';
}) {
  const parts = useMemo(() => {
    if (!query.trim()) return null;
    const escaped = escapeRegex(query);
    return text.split(new RegExp(`(${escaped})`, 'gi'));
  }, [text, query]);

  if (!parts) {
    return <Text variant={variant} color={color} weight={weight}>{text}</Text>;
  }

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={`${text}-${i}`} variant={variant} color={color} weight={weight} style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={`${text}-${i}`} variant={variant} color={color} weight={weight}>{part}</Text>
        )
      )}
    </>
  );
}

export const TriadCard = React.memo(function TriadCard({
  triad,
  index,
  searchQuery = '',
  onPress,
}: TriadCardProps) {
  const categoryColor = CATEGORY_COLORS[triad.category];
  const categoryLabel = CATEGORY_LABELS[triad.category];
  const findingsText = triad.findings.join(', ');

  // Press animation
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
    translateY.value = withSpring(2, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 350 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 350 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${triad.condition}, ${categoryLabel}. Findings: ${findingsText}`}
    >
      <Animated.View
        entering={FadeInUp.delay(Math.min(index * 25, 200))
          .duration(250)
          .damping(18)
          .stiffness(180)}
      >
        <View style={[styles.card, { borderBottomColor: theme.colors.border.strong }]}>
          {/* Left accent strip - wider for better visual presence */}
          <View style={[styles.accentStrip, { backgroundColor: categoryColor.activeBg }]} />

          <View style={styles.content}>
            {/* Header row with condition and category badge */}
            <View style={styles.header}>
              <View style={styles.conditionContainer}>
                <HighlightedText
                  text={triad.condition}
                  query={searchQuery}
                  variant="body"
                  color="primary"
                  weight="semibold"
                />
              </View>
              <View style={[
                styles.categoryBadge,
                {
                  backgroundColor: categoryColor.bg,
                  borderColor: categoryColor.activeBg,
                }
              ]}>
                <Text variant="tiny" color={categoryColor.text} weight="semibold">
                  {categoryLabel}
                </Text>
              </View>
            </View>

            {/* Findings - refined numbered list with circular badges */}
            <View style={styles.findingsContainer}>
              {triad.findings.map((finding, i) => (
                <View key={`${triad.id}-finding-${i}`} style={styles.findingRow}>
                  <View style={[styles.numberBadge, { backgroundColor: categoryColor.bg }]}>
                    <Text
                      variant="tiny"
                      color={categoryColor.activeBg}
                      weight="semibold"
                      style={styles.numberText}
                    >
                      {i + 1}
                    </Text>
                  </View>
                  <View style={styles.findingTextContainer}>
                    <HighlightedText
                      text={finding}
                      query={searchQuery}
                      variant="caption"
                      color="secondary"
                      weight="medium"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.card,
    // Duolingo-style 3D border treatment
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    borderBottomWidth: 4,
    borderRadius: Radius.lg,
    // Subtle shadow for depth
    ...theme.shadows.sm,
  },
  accentStrip: {
    width: 6, // Wider for better visual presence
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
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  highlight: {
    backgroundColor: theme.colors.warning.light,
    borderRadius: 3,
    paddingHorizontal: 2,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    flexShrink: 0,
  },
  findingsContainer: {
    gap: Spacing.sm,
  },
  findingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numberText: {
    lineHeight: 20,
    textAlign: 'center',
  },
  findingTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 1, // Align text with number badge center
  },
});
