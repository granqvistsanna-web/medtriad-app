import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography, Spacing, Radius, Shadows, Easings } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function SearchBar({ value, onChangeText, placeholder = 'Search triads...' }: SearchBarProps) {
  const colors = Colors.light;
  const focus = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focus.value,
      [0, 1],
      [colors.border, colors.primary]
    );
    return {
      borderColor,
    };
  });

  const handleFocus = () => {
    focus.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const handleBlur = () => {
    focus.value = withSpring(0, { damping: 20, stiffness: 300 });
  };

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <AnimatedView style={[styles.container, { backgroundColor: colors.backgroundSecondary }, containerStyle]}>
      <View style={styles.iconContainer}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
      </View>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} style={styles.clearButton} hitSlop={8}>
          <View style={[styles.clearIcon, { backgroundColor: colors.textMuted }]}>
            <IconSymbol name="xmark" size={10} color={colors.backgroundCard} />
          </View>
        </Pressable>
      )}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 2,
    paddingHorizontal: Spacing.base,
    height: 52,
    ...Shadows.light.sm,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.caption,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: Spacing.sm,
  },
  clearIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
