import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { Magnifer, CloseCircle } from '@solar-icons/react-native/Bold';
import { theme, Typography, Spacing, Radius } from '@/constants/theme';
import { Icon } from '@/components/primitives';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function SearchBar({ value, onChangeText, placeholder = 'Search triads...' }: SearchBarProps) {
  const focus = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focus.value,
      [0, 1],
      [theme.colors.border.default, theme.colors.brand.primary]
    );
    const borderBottomColor = interpolateColor(
      focus.value,
      [0, 1],
      [theme.colors.border.strong, theme.colors.brand.primaryDark]
    );
    return { borderColor, borderBottomColor };
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
    <AnimatedView style={[styles.container, containerStyle]}>
      <View style={styles.iconContainer}>
        <Icon icon={Magnifer} size="md" color={theme.colors.text.muted} />
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.muted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search triads"
        accessibilityHint="Enter keywords to filter medical triads by condition or finding"
      />
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={8}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Icon icon={CloseCircle} size="sm" color={theme.colors.text.muted} />
        </Pressable>
      )}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    // Duolingo-style 3D border treatment
    borderWidth: 2,
    borderBottomWidth: 4,
    paddingHorizontal: Spacing.md,
    height: 52,
    backgroundColor: theme.colors.surface.card,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.caption,
    color: theme.colors.text.primary,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
});
