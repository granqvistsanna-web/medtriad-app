# Phase 21: Design System Foundation - Research

**Researched:** 2026-01-20
**Domain:** React Native design tokens, primitive components, icon systems
**Confidence:** HIGH

## Summary

This phase establishes a token-based design system for a React Native/Expo app. The codebase already has a solid foundation in `constants/theme.ts` with colors, typography, spacing, radius, shadows, and motion values. The work involves refactoring this into a more structured token system, adding a semantic theme layer, creating proper primitive components (Text, Surface, Button, Badge, Tag, Card), and implementing a Solar Icons wrapper.

The current implementation uses direct imports from the theme file with hardcoded color values scattered in components. The new system will enforce consistency through semantic tokens and component-level abstraction.

**Primary recommendation:** Keep the existing vanilla React Native + TypeScript approach (no Restyle library needed). Refactor `theme.ts` into separate token files, add semantic mapping, and create primitive components that consume tokens exclusively.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | ~4.1.1 | Animations | Already powers button press animations |
| react-native-svg | 15.12.1 | SVG rendering | Required for Solar Icons |
| expo-font | ~14.0.10 | Font loading | Load Figtree custom font |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @expo-google-fonts/figtree | latest | Figtree font family | CONTEXT.md specifies Figtree font |
| @solar-icons/react-native | latest | Solar Icons for React Native | CONTEXT.md specifies Solar filled icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @solar-icons/react-native | Manual SVG imports from icones.js.org | More control but manual maintenance |
| @shopify/restyle | Vanilla StyleSheet | Restyle adds complexity; current codebase already works well with direct token imports |
| NativeBase/Gluestack | Custom primitives | Third-party libraries add bundle size and learning curve |

**Installation:**
```bash
npx expo install @expo-google-fonts/figtree @solar-icons/react-native
```

**Note on Solar Icons:** If `@solar-icons/react-native` is unavailable or problematic, fallback to downloading individual SVGs from [icones.js.org/collection/solar](https://icones.js.org/collection/solar) and creating React Native SVG components manually.

## Architecture Patterns

### Recommended Project Structure
```
medtriad/
├── constants/
│   ├── tokens/
│   │   ├── colors.ts         # Raw color palette
│   │   ├── typography.ts     # Font sizes, weights, line heights
│   │   ├── spacing.ts        # Spacing scale
│   │   ├── radius.ts         # Border radius scale
│   │   ├── shadows.ts        # Shadow definitions
│   │   └── motion.ts         # Durations, easings
│   ├── theme.ts              # Semantic mapping (surface.primary, text.muted, etc.)
│   └── index.ts              # Barrel export
├── components/
│   └── primitives/
│       ├── Text.tsx          # Typography primitive
│       ├── Surface.tsx       # Background/container primitive
│       ├── Button.tsx        # Button with all states
│       ├── Badge.tsx         # Status indicator
│       ├── Tag.tsx           # Label/category
│       ├── Card.tsx          # Card container
│       └── Icon.tsx          # Solar Icons wrapper
```

### Pattern 1: Token Organization (Three-Layer System)

**What:** Separate raw tokens from semantic tokens from component usage
**When to use:** Always - this is the foundation

**Layer 1 - Raw Tokens:**
```typescript
// constants/tokens/colors.ts
export const palette = {
  wine: {
    50: '#FCF5F8',
    100: '#F8E8EE',
    500: '#8B2252',
    600: '#6B1A3F',
    700: '#4A1230',
  },
  pink: {
    100: '#FFE8EE',
    200: '#FFD1DD',
  },
  yellow: {
    100: '#FFF8E1',
    200: '#FFECB3',
    500: '#F5B800',
    600: '#D4A000',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F7F7F7',
    200: '#E5E5E5',
    300: '#CDCDCD',
    500: '#777777',
    600: '#3C3C3C',
    700: '#AFAFAF',
  },
  blue: {
    100: '#E3F2FD',
    500: '#1CB0F6',
    600: '#1899D6',
    700: '#0A5A7C',
  },
  purple: {
    100: '#F3E5F5',
    500: '#A855F7',
    600: '#9333EA',
    700: '#5B21B6',
  },
  success: {
    100: '#E5F9DB',
    500: '#58CC02',
    600: '#46A302',
    700: '#3D8B00',
  },
  error: {
    100: '#FFE5E5',
    500: '#FF4B4B',
    600: '#EA2B2B',
  },
} as const;
```

**Layer 2 - Semantic Tokens:**
```typescript
// constants/theme.ts
import { palette } from './tokens/colors';

export const theme = {
  colors: {
    // Surfaces
    surface: {
      primary: palette.neutral[0],
      secondary: palette.neutral[50],
      card: palette.neutral[0],
      brand: palette.wine[100],
      brandSubtle: palette.wine[50],
    },
    // Text
    text: {
      primary: palette.neutral[600],
      secondary: palette.neutral[500],
      muted: palette.neutral[700],
      inverse: palette.neutral[0],
      brand: palette.wine[700],
    },
    // Brand
    brand: {
      primary: palette.wine[500],
      primaryDark: palette.wine[600],
      accent: palette.pink[100],
    },
    // Semantic
    success: {
      main: palette.success[500],
      dark: palette.success[600],
      light: palette.success[100],
      text: palette.success[700],
    },
    warning: {
      main: palette.yellow[500],
      dark: palette.yellow[600],
      light: palette.yellow[100],
    },
    danger: {
      main: palette.error[500],
      dark: palette.error[600],
      light: palette.error[100],
    },
    // Borders
    border: {
      default: palette.neutral[200],
      strong: palette.neutral[300],
    },
  },
  // ... typography, spacing, radius, shadows, motion
} as const;
```

**Layer 3 - Component Usage:**
```typescript
// Components only import from theme.ts
import { theme } from '@/constants/theme';

// Use semantic tokens
backgroundColor: theme.colors.surface.primary
color: theme.colors.text.primary
borderColor: theme.colors.border.default
```

### Pattern 2: Duolingo-Style Hard Bottom Border

**What:** The characteristic raised/pressed button effect
**When to use:** Buttons, Cards, Badges - any interactive elevated element

**Implementation:**
```typescript
// Base elevated style
const elevatedStyle = {
  borderWidth: 2,
  borderColor: theme.colors.border.default,
  borderBottomWidth: 4,  // Thicker bottom creates 3D depth
  borderBottomColor: theme.colors.border.strong,
  borderRadius: theme.radius.md,
};

// Pressed state - compress the depth
const pressedStyle = {
  borderBottomWidth: 2,  // Reduce to simulate press
  transform: [{ translateY: 2 }],  // Move down to match
};
```

### Pattern 3: Icon Wrapper with Standardized Sizes

**What:** Consistent icon sizing across the app
**When to use:** Always use the Icon primitive, never raw icon components

```typescript
// components/primitives/Icon.tsx
import { SomeIcon } from '@solar-icons/react-native';

type IconSize = 'sm' | 'md' | 'lg';

const ICON_SIZES: Record<IconSize, number> = {
  sm: 16,  // Inline text, badges
  md: 20,  // Buttons
  lg: 24,  // Navigation, prominent
};

type IconProps = {
  name: string;
  size?: IconSize;
  color?: string;
};

export function Icon({ name, size = 'md', color }: IconProps) {
  const pixelSize = ICON_SIZES[size];
  // Render Solar Icon with these props
}
```

### Pattern 4: Text Primitive with Typography Tokens

**What:** Single source of truth for all text rendering
**When to use:** Replace all `<Text>` with `<DSText>`

```typescript
// components/primitives/Text.tsx
type TextVariant =
  | 'display'   // 64px - Hero numbers
  | 'title'     // 32px - Screen titles
  | 'heading'   // 22px - Section headers
  | 'body'      // 18px - Body text
  | 'label'     // 17px - Button labels
  | 'caption'   // 15px - Secondary info
  | 'footnote'  // 13px - Small details
  | 'tiny';     // 11px - Category labels

type TextProps = {
  variant?: TextVariant;
  color?: keyof typeof theme.colors.text;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  children: React.ReactNode;
};
```

### Anti-Patterns to Avoid

- **Hardcoded colors:** Never use `'#8B2252'` directly in components; always use `theme.colors.brand.primary`
- **Hardcoded font sizes:** Never use `fontSize: 16`; always use typography tokens
- **Mixed approaches:** Don't mix theme tokens with inline styles - pick one
- **Direct StyleSheet.create at component level:** For primitives, compute styles from props + tokens

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Button press animation | Custom gesture handlers | react-native-reanimated spring + Pressable | Correct spring physics, native driver |
| Loading spinner | Custom animated view | ActivityIndicator | Platform-native, accessible, performant |
| Font loading | Manual Asset.loadAsync | expo-font useFonts + SplashScreen | Handles async loading with splash screen |
| Icon rendering | Manual SVG path components | @solar-icons/react-native or SVG wrapper | Consistent API, tree-shaking |
| Press state management | useState for pressed | Pressable onPressIn/onPressOut | Built-in, no re-renders |

**Key insight:** React Native + Reanimated provides all the tools needed for Duolingo-style interactions. The existing codebase already demonstrates correct patterns (Button.tsx, Card.tsx, AnswerCard.tsx). Systematize, don't reinvent.

## Common Pitfalls

### Pitfall 1: Font Loading Race Condition
**What goes wrong:** Text renders with system font before custom font loads, causing layout shift
**Why it happens:** Async font loading completes after first render
**How to avoid:** Use expo-splash-screen to keep splash visible until fonts are loaded
**Warning signs:** Flash of unstyled text on app launch

```typescript
// Correct pattern in root layout
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Figtree-Regular': Figtree_400Regular,
    'Figtree-Medium': Figtree_500Medium,
    'Figtree-SemiBold': Figtree_600SemiBold,
    'Figtree-Bold': Figtree_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  // ...
}
```

### Pitfall 2: Token Type Safety Lost
**What goes wrong:** Autocomplete stops working, typos slip through
**Why it happens:** Using `string` types instead of `keyof typeof` patterns
**How to avoid:** Use `as const` assertions and derive types from token objects
**Warning signs:** `color: 'primaryy'` compiles without error

```typescript
// BAD
type TextColor = string;

// GOOD
const textColors = { primary: '#3C3C3C', secondary: '#777777' } as const;
type TextColor = keyof typeof textColors;
```

### Pitfall 3: Animated Border Width Causing Layout Thrash
**What goes wrong:** Button jiggles during press animation
**Why it happens:** borderBottomWidth change reflows layout
**How to avoid:** Use `transform: translateY` to simulate depth change, animate borderBottomWidth with reanimated useAnimatedStyle
**Warning signs:** Visible jitter on button press

### Pitfall 4: Semantic Token Naming Collisions
**What goes wrong:** `colors.primary` ambiguous - brand primary or text primary?
**Why it happens:** Flat token structure
**How to avoid:** Nest semantically: `colors.brand.primary`, `colors.text.primary`
**Warning signs:** Developers guessing which "primary" to use

### Pitfall 5: Inconsistent Shadow on Android
**What goes wrong:** Shadows look different on Android vs iOS
**Why it happens:** Android uses `elevation`, iOS uses shadow* props
**How to avoid:** Always provide both `elevation` and shadow* props in shadow tokens
**Warning signs:** Design looks flat on Android

## Code Examples

Verified patterns from official sources and existing codebase:

### Button with Loading State
```typescript
// Source: Existing codebase pattern + ActivityIndicator docs
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { theme } from '@/constants/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ label, onPress, variant = 'primary', loading, disabled }: ButtonProps) {
  const scale = useSharedValue(1);
  const borderBottom = useSharedValue(4);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
      borderBottom.value = withSpring(2, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    borderBottom.value = withSpring(4, { damping: 15, stiffness: 400 });
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        // Base styles from tokens
        {
          height: 56,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.brand.primary,
          borderBottomColor: theme.colors.brand.primaryDark,
          opacity: isDisabled ? 0.5 : 1,
        },
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.text.inverse} />
      ) : (
        <Text style={{ color: theme.colors.text.inverse, ...theme.typography.label }}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}
```

### Font Loading with Splash Screen
```typescript
// Source: Expo docs (https://docs.expo.dev/develop/user-interface/fonts/)
import { useFonts } from '@expo-google-fonts/figtree';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Figtree-Regular': Figtree_400Regular,
    'Figtree-Medium': Figtree_500Medium,
    'Figtree-SemiBold': Figtree_600SemiBold,
    'Figtree-Bold': Figtree_700Bold,
    'Figtree-ExtraBold': Figtree_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <Stack />;
}
```

### Icon Wrapper Component
```typescript
// Source: Solar Icons docs + react-native-svg patterns
// Note: Actual implementation depends on @solar-icons/react-native API
import { SvgProps } from 'react-native-svg';
import { theme } from '@/constants/theme';

type IconSize = 'sm' | 'md' | 'lg';
type IconColor = keyof typeof theme.colors.text | keyof typeof theme.colors.brand | string;

const SIZES: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

type IconProps = {
  name: string;
  size?: IconSize;
  color?: string;
  style?: SvgProps['style'];
};

export function Icon({ name, size = 'md', color = theme.colors.text.primary, style }: IconProps) {
  const pixelSize = SIZES[size];

  // If using @solar-icons/react-native:
  // const IconComponent = SolarIcons[name];
  // return <IconComponent size={pixelSize} color={color} style={style} />;

  // If using manual SVG approach, import and render the specific icon
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SF Symbols + MaterialIcons mapping | Solar Icons unified | 2025 | Consistent cross-platform look |
| System fonts | Custom Figtree via expo-google-fonts | 2025 | Brand identity, typography control |
| Flat color constants | Three-layer token system | 2025 | Type safety, semantic clarity |
| Styled-components/Emotion | Vanilla StyleSheet + tokens | Current | Smaller bundle, better perf |

**Deprecated/outdated:**
- `AppLoading` from Expo - deprecated in SDK 49+, use `expo-splash-screen` instead
- `useColorScheme` for dark mode - app is light mode only per v2.0 decisions

## Open Questions

Things that couldn't be fully resolved:

1. **@solar-icons/react-native package availability**
   - What we know: Package exists per GitHub docs, provides native SVG icons
   - What's unclear: Exact API, whether it's fully published to npm
   - Recommendation: Try `npm install @solar-icons/react-native` first; if unavailable, download SVGs from icones.js.org and create manual wrapper components

2. **Figtree font weights mapping**
   - What we know: Package provides Regular, Medium, SemiBold, Bold, ExtraBold
   - What's unclear: Whether fontWeight numeric values (400, 500, etc.) work with named font families in React Native
   - Recommendation: Use named font families (`Figtree-Bold`) instead of fontWeight prop for reliability

## Sources

### Primary (HIGH confidence)
- [Expo Fonts Documentation](https://docs.expo.dev/develop/user-interface/fonts/) - Font loading patterns
- [Expo Google Fonts - Figtree](https://www.npmjs.com/package/@expo-google-fonts/figtree) - Available weights
- [React Native ActivityIndicator](https://reactnative.dev/docs/activityindicator) - Loading state API
- [Shopify Restyle](https://shopify.github.io/restyle/) - Design token patterns (referenced, not used)

### Secondary (MEDIUM confidence)
- [Solar Icons Official](https://solar-icons.vercel.app/) - Icon library documentation
- [GitHub - Solar Icons](https://github.com/saoudi-h/solar-icons) - React Native package info
- [Duolingo Button CSS Patterns](https://medium.com/@lilskyjuicebytes/clone-the-ui-1-replicating-duolingos-button-in-pure-css-bd37a97edb7e) - Border-bottom technique

### Tertiary (LOW confidence)
- Web searches for design token patterns - Verified against official docs

### Existing Codebase (HIGH confidence)
- `medtriad/constants/theme.ts` - Current token structure
- `medtriad/components/ui/Button.tsx` - Working Duolingo-style button
- `medtriad/components/ui/Card.tsx` - Working card primitive
- `medtriad/components/ui/icon-symbol.tsx` - Current icon approach

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on existing dependencies and official Expo docs
- Architecture: HIGH - Based on existing codebase patterns and established design token practices
- Pitfalls: HIGH - Common issues well-documented in community

**Research date:** 2026-01-20
**Valid until:** 60 days (stable domain, existing patterns)
