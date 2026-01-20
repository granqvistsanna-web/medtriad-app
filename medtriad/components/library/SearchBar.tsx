import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  withTiming,
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
    const shadowOpacity = withTiming(focus.value * 0.15, { duration: 200 });
    return {
      borderColor,
      shadowOpacity,
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      focus.value,
      [0, 1],
      [theme.colors.text.secondary, theme.colors.brand.primary]
    );
    return { color };
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

  const iconColor = focus.value ? theme.colors.brand.primary : theme.colors.text.secondary;

  return (
    <AnimatedView style={[styles.container, containerStyle]}>
      <Animated.View style={styles.iconContainer}>
        <Icon icon={Magnifer} size="md" color={theme.colors.text.secondary} />
      </Animated.View>
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
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} style={styles.clearButton} hitSlop={8}>
          <Icon icon={CloseCircle} size="md" color={theme.colors.brand.primary} />
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
    borderWidth: 2,
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.border.strong,
    paddingHorizontal: Spacing.base,
    height: 54,
    backgroundColor: theme.colors.surface.card,
    shadowColor: theme.colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: theme.colors.text.primary,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
});
