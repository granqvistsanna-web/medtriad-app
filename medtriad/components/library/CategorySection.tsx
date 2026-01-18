import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography, Spacing, Radius, Durations } from '@/constants/theme';
import { Triad, TriadCategory } from '@/types';
import { TriadItem } from './TriadItem';

interface CategorySectionProps {
  category: TriadCategory;
  triads: Triad[];
}

export function CategorySection({ category, triads }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = Colors.light;

  // Animation for accordion height
  const contentHeight = useSharedValue(0);
  const animatedHeight = useDerivedValue(() =>
    withTiming(isExpanded ? contentHeight.value : 0, { duration: Durations.normal })
  );

  const containerStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: 'hidden',
  }));

  // Chevron rotation animation
  const chevronRotation = useDerivedValue(() =>
    withTiming(isExpanded ? 90 : 0, { duration: Durations.normal })
  );

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0 && contentHeight.value !== height) {
      contentHeight.value = height;
    }
  };

  // Capitalize category name for display
  const displayName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={({ pressed }) => [
          styles.header,
          {
            backgroundColor: colors.backgroundSecondary,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.categoryName, { color: colors.text }]}>
            {displayName}
          </Text>
          <Text style={[styles.count, { color: colors.textSecondary }]}>
            {triads.length}
          </Text>
        </View>
        <Animated.View style={chevronStyle}>
          <IconSymbol
            name="chevron.right"
            size={18}
            color={colors.textSecondary}
          />
        </Animated.View>
      </Pressable>

      <Animated.View style={containerStyle}>
        <View
          style={styles.contentMeasure}
          onLayout={handleLayout}
        >
          <View style={[styles.triadsContainer, { backgroundColor: colors.background }]}>
            {triads.map((triad) => (
              <TriadItem key={triad.id} triad={triad} />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryName: {
    ...Typography.heading,
  },
  count: {
    ...Typography.footnote,
  },
  contentMeasure: {
    position: 'absolute',
    width: '100%',
  },
  triadsContainer: {
    paddingTop: Spacing.xs,
  },
});
