import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography, Spacing, Durations } from '@/constants/theme';
import { Triad } from '@/types';

interface TriadItemProps {
  triad: Triad;
}

export function TriadItem({ triad }: TriadItemProps) {
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

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={({ pressed }) => [
          styles.header,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[styles.condition, { color: colors.text }]}>
          {triad.condition}
        </Text>
        <Animated.View style={chevronStyle}>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={colors.textSecondary}
          />
        </Animated.View>
      </Pressable>

      <Animated.View style={containerStyle}>
        <View
          style={styles.contentMeasure}
          onLayout={handleLayout}
        >
          <View style={styles.findings}>
            {triad.findings.map((finding, index) => (
              <Text
                key={index}
                style={[styles.finding, { color: colors.textSecondary }]}
              >
                {finding}
              </Text>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  condition: {
    ...Typography.body,
    flex: 1,
  },
  contentMeasure: {
    position: 'absolute',
    width: '100%',
  },
  findings: {
    paddingHorizontal: Spacing.base,
    paddingLeft: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  finding: {
    ...Typography.caption,
  },
});
