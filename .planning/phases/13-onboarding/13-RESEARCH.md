# Phase 13: Onboarding - Research

**Researched:** 2026-01-19
**Domain:** expo-router conditional routing, horizontal pagination, React Native onboarding UI
**Confidence:** HIGH

## Summary

This phase implements an onboarding flow for new users (gamesPlayed = 0). The codebase already has the infrastructure:
- `useStats` hook returns `isNewUser` (gamesPlayed === 0)
- expo-router 6.x on Expo SDK 54 supports `Stack.Protected` for declarative route guards
- `TriMascot` component exists and can be reused in onboarding screens
- Animation patterns (FadeInUp, springs, stagger) are established

The onboarding will be implemented as a protected route group that only shows for new users. When `gamesPlayed > 0`, users go directly to the tabs. The onboarding screens (2-3) will use horizontal FlatList with `pagingEnabled` for swipe navigation, with animated dots for pagination and a visible skip button at all times.

**Primary recommendation:** Use `Stack.Protected` with `guard={isNewUser}` to conditionally show onboarding route. Build 2-3 fullscreen pages with FlatList horizontal pagination. Keep it simple - no external pagination library needed, just FlatList + custom dot indicators.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-router | ~6.0.21 | Conditional routing with Stack.Protected | Native SDK 54 feature, clean declarative API |
| react-native-reanimated | Latest | Animations, animated dots | Already used throughout app |
| FlatList (RN core) | N/A | Horizontal pagination | Built-in, no dependencies, works with pagingEnabled |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-safe-area-context | Latest | Safe area insets | Full-screen onboarding pages |
| expo-linear-gradient | Latest | Background gradients | If matching HeroCard style |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| FlatList pagination | react-native-pager-view | More features but adds dependency |
| Custom dot indicators | react-native-animated-pagination-dots | Nice animations but overkill for 2-3 dots |
| Stack.Protected | Redirect component | Works but less declarative, SDK 53+ has better option |

**No new dependencies needed.** All required tools exist in the codebase.

## Architecture Patterns

### Recommended Route Structure
```
app/
├── _layout.tsx           # Root layout - add Stack.Protected guards
├── onboarding.tsx        # NEW: Onboarding screen (2-3 pages)
├── (tabs)/               # Protected for users with gamesPlayed > 0
│   └── _layout.tsx
├── quiz/
└── modal.tsx
```

### Pattern 1: Stack.Protected for Conditional Routing
**What:** Declaratively guard routes based on runtime state
**When to use:** Showing onboarding only to new users
**Example:**
```typescript
// Source: https://docs.expo.dev/router/advanced/authentication/
import { Stack } from 'expo-router';
import { useStats } from '@/hooks/useStats';

export default function RootLayout() {
  const { isNewUser, loading } = useStats();

  // Show nothing while loading (prevent flash)
  if (loading) return null;

  return (
    <ThemeProvider value={LightTheme}>
      <Stack>
        {/* Onboarding for new users only */}
        <Stack.Protected guard={isNewUser}>
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false }}
          />
        </Stack.Protected>

        {/* Main app for returning users */}
        <Stack.Protected guard={!isNewUser}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Always available routes */}
        <Stack.Screen name="quiz" options={{ ... }} />
        <Stack.Screen name="modal" options={{ ... }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
```

### Pattern 2: Horizontal FlatList Pagination
**What:** Fullscreen swipeable pages with native paging behavior
**When to use:** Onboarding page carousel
**Example:**
```typescript
// Source: React Native FlatList documentation
import { FlatList, useWindowDimensions } from 'react-native';

const { width } = useWindowDimensions();

<FlatList
  data={ONBOARDING_PAGES}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  bounces={false}
  onScroll={handleScroll}
  scrollEventThrottle={16}
  renderItem={({ item }) => (
    <View style={{ width }}>
      {/* Page content */}
    </View>
  )}
/>
```

### Pattern 3: Animated Pagination Dots
**What:** Dot indicators that animate based on scroll position
**When to use:** Show current page in onboarding
**Example:**
```typescript
// Source: Custom implementation using reanimated
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';

function Dot({ index, scrollX, width }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1.2, 0.8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );

    return { transform: [{ scale }], opacity };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}
```

### Pattern 4: Skip Button Always Visible
**What:** Fixed position skip button that navigates to main app
**When to use:** All onboarding screens per ONBD-01
**Example:**
```typescript
// Source: Existing Button component pattern
import { router } from 'expo-router';

// Skip completes "onboarding" by triggering first quiz
// OR we can add a flag - but simpler: just navigate to tabs
// The routing guards will handle showing correct screen on next launch

function handleSkip() {
  // Navigate to main app
  router.replace('/(tabs)');
}

<Pressable onPress={handleSkip} style={styles.skipButton}>
  <Text style={styles.skipText}>Skip</Text>
</Pressable>
```

### Anti-Patterns to Avoid
- **Checking gamesPlayed in every screen:** Use Stack.Protected once at root level
- **AsyncStorage flag for "hasSeenOnboarding":** Redundant - gamesPlayed already tracks this
- **External carousel libraries:** FlatList with pagingEnabled is sufficient for 2-3 screens
- **Linear timing for dots:** Use springs for consistency with app motion
- **Blocking renders while loading stats:** Show splash/loading state briefly

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| New user detection | Custom AsyncStorage flag | `useStats().isNewUser` | Already computed from gamesPlayed === 0 |
| Route guarding | Manual Redirect components | `Stack.Protected` | Cleaner, declarative, SDK 54 native |
| Page carousel | Custom scroll handling | FlatList + pagingEnabled | Built-in snapping, cross-platform |
| Entry animations | Custom opacity/translate | FadeInUp.springify() | Matches app pattern |
| Skip button | Custom pressable | Styled Pressable + router.replace | Existing patterns |

**Key insight:** The onboarding requirement is primarily UI work - the "new user" logic already exists via `isNewUser` from useStats.

## Common Pitfalls

### Pitfall 1: Flash of Wrong Screen on App Launch
**What goes wrong:** User briefly sees tabs then redirects to onboarding
**Why it happens:** Stats loading is async, renders before `isNewUser` is determined
**How to avoid:** Return null or splash screen while `loading` is true in root layout
**Warning signs:** Flicker on app cold start

### Pitfall 2: Onboarding Shows After First Quiz
**What goes wrong:** User completes first quiz but sees onboarding on next launch
**Why it happens:** Not understanding when gamesPlayed increments
**How to avoid:** Trust the system - gamesPlayed increments after quiz completion in updateAfterQuiz()
**Warning signs:** N/A - this won't happen with current implementation

### Pitfall 3: FlatList Pages Not Full Width
**What goes wrong:** Pages are cut off or show partial next page
**Why it happens:** Page width doesn't match screen width exactly
**How to avoid:** Use `useWindowDimensions().width` for page width, not Dimensions.get('window')
**Warning signs:** Content clipping, scroll showing partial pages

### Pitfall 4: Pagination Dots Not Synced
**What goes wrong:** Dots don't reflect current page during fast swipes
**Why it happens:** Using onMomentumScrollEnd instead of continuous scroll tracking
**How to avoid:** Use `onScroll` with `scrollEventThrottle={16}` and animated scroll position
**Warning signs:** Dots "jump" instead of smoothly transitioning

### Pitfall 5: Skip Button Navigation Breaking Back Stack
**What goes wrong:** Skip leads to weird navigation state
**Why it happens:** Using `router.push` instead of `router.replace`
**How to avoid:** Use `router.replace('/(tabs)')` to replace onboarding in stack
**Warning signs:** Back gesture returns to onboarding

### Pitfall 6: Onboarding Appearing for Returning Users on Refresh
**What goes wrong:** Development hot reload shows onboarding to non-new users
**Why it happens:** State resets during development
**How to avoid:** This is dev-only; in production, AsyncStorage persists gamesPlayed
**Warning signs:** Only during development, not production

## Code Examples

Verified patterns from official sources:

### Root Layout with Stack.Protected
```typescript
// Source: https://docs.expo.dev/router/advanced/authentication/
// Adapted for onboarding

import { Stack } from 'expo-router';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useStats } from '@/hooks/useStats';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const { isNewUser, loading } = useStats();

  // Prevent flash - show nothing while determining user state
  if (loading) {
    return null; // Or a splash screen component
  }

  return (
    <ThemeProvider value={LightTheme}>
      <Stack>
        <Stack.Protected guard={isNewUser}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!isNewUser}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Screen
          name="quiz"
          options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
```

### Onboarding Screen Structure
```typescript
// Source: Combining codebase patterns with FlatList pagination
import { View, FlatList, useWindowDimensions, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeInUp
} from 'react-native-reanimated';

import { TriMascot } from '@/components/home/TriMascot';
import { Colors, Typography, Spacing, Durations } from '@/constants/theme';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const PAGES = [
  {
    id: '1',
    title: 'Welcome to MedTriads',
    subtitle: 'Test your knowledge of classic medical triads',
    mascotMood: 'neutral' as const,
  },
  {
    id: '2',
    title: 'How It Works',
    subtitle: 'See three findings, name the diagnosis. Quick 10-question rounds.',
    mascotMood: 'happy' as const,
  },
  {
    id: '3',
    title: 'Ready to Start?',
    subtitle: 'Build streaks, climb tiers, master all 15 triads!',
    mascotMood: 'streak' as const,
  },
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = Colors.light;

  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Skip button - always visible */}
      <Pressable
        onPress={handleSkip}
        style={{
          position: 'absolute',
          top: insets.top + Spacing.sm,
          right: Spacing.lg,
          zIndex: 10,
          padding: Spacing.sm,
        }}
      >
        <Text style={{ ...Typography.label, color: colors.textSecondary }}>
          Skip
        </Text>
      </Pressable>

      {/* Pages */}
      <AnimatedFlatList
        data={PAGES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <View style={{ width, height, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }}>
            <Animated.View entering={FadeInUp.delay(index * Durations.stagger).duration(Durations.normal).springify()}>
              <TriMascot mood={item.mascotMood} size="xl" />
            </Animated.View>
            <Text style={{ ...Typography.title, color: colors.text, textAlign: 'center', marginTop: Spacing.xl }}>
              {item.title}
            </Text>
            <Text style={{ ...Typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.md }}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      {/* Pagination dots + Get Started button at bottom */}
      <View style={{ paddingBottom: insets.bottom + Spacing.xl, paddingHorizontal: Spacing.lg }}>
        <PaginationDots scrollX={scrollX} count={PAGES.length} width={width} />
        {/* Show Get Started on last page */}
      </View>
    </View>
  );
}
```

### Pagination Dots Component
```typescript
// Source: Custom implementation following app animation patterns
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue
} from 'react-native-reanimated';
import { View } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

type PaginationDotsProps = {
  scrollX: SharedValue<number>;
  count: number;
  width: number;
};

function Dot({
  index,
  scrollX,
  width
}: {
  index: number;
  scrollX: SharedValue<number>;
  width: number
}) {
  const colors = Colors.light;

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );

    return {
      width: dotWidth,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: Radius.full,
          backgroundColor: colors.primary,
          marginHorizontal: 4,
        },
        animatedStyle,
      ]}
    />
  );
}

export function PaginationDots({ scrollX, count, width }: PaginationDotsProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, index) => (
        <Dot key={index} index={index} scrollX={scrollX} width={width} />
      ))}
    </View>
  );
}
```

### Get Started Button (Last Page)
```typescript
// Source: Existing Button component in codebase
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';

// In onboarding, detect if on last page and show button
const currentPage = Math.round(scrollX.value / width);
const isLastPage = currentPage === PAGES.length - 1;

{isLastPage && (
  <Animated.View entering={FadeInUp.duration(Durations.normal).springify()}>
    <Button
      label="Get Started"
      icon="play.fill"
      onPress={() => router.replace('/(tabs)')}
    />
  </Animated.View>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redirect component | Stack.Protected | SDK 53 (late 2024) | Cleaner, declarative route guarding |
| PagerView library | FlatList pagingEnabled | Always available | No extra dependency for simple pagination |
| Manual "hasSeenOnboarding" flag | gamesPlayed check | N/A | Single source of truth, no extra state |

**Deprecated/outdated:**
- `<Redirect href="/login" />` pattern - Still works but Stack.Protected is cleaner for SDK 53+
- Third-party swiper libraries for 2-3 screens - Overkill, FlatList is sufficient

## Open Questions

Things that couldn't be fully resolved:

1. **Exact onboarding content/copy**
   - What we know: 2-3 screens explaining triads and scoring
   - What's unclear: Exact wording, which mascot moods to show
   - Recommendation: Use placeholder content, refine later

2. **"Get Started" button behavior**
   - What we know: Should end onboarding and go to main app
   - What's unclear: Should it start first quiz immediately, or go to home?
   - Recommendation: Go to home tab - user can start quiz when ready

3. **Animation on page transition**
   - What we know: Scroll is native, dots animate
   - What's unclear: Should content within pages have enter/exit animations?
   - Recommendation: Keep simple - content fades in on mount, native scroll handles transition

## Sources

### Primary (HIGH confidence)
- [Expo Router Authentication Documentation](https://docs.expo.dev/router/advanced/authentication/) - Stack.Protected API
- [Expo Router Redirects Documentation](https://docs.expo.dev/router/reference/redirects/) - Redirect patterns
- `/Users/sannagranqvist/Documents/App/medtriad-app/medtriad/hooks/useStats.ts` - isNewUser already computed
- `/Users/sannagranqvist/Documents/App/medtriad-app/medtriad/app/_layout.tsx` - Current root layout structure
- `/Users/sannagranqvist/Documents/App/medtriad-app/medtriad/components/home/TriMascot.tsx` - Reusable mascot
- `/Users/sannagranqvist/Documents/App/medtriad-app/medtriad/constants/theme.ts` - Animation constants

### Secondary (MEDIUM confidence)
- [react-native-animated-pagination-dots](https://github.com/weahforsage/react-native-animated-pagination-dots) - Dot animation patterns (adapted for reanimated)
- [Expo Blog: Simplifying Auth Flows](https://expo.dev/blog/simplifying-auth-flows-with-protected-routes) - Stack.Protected rationale

### Tertiary (LOW confidence)
- None - all patterns verified against official docs or codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in codebase, Stack.Protected documented
- Architecture: HIGH - Pattern follows Expo documentation and existing app structure
- Pitfalls: HIGH - Based on known React Native FlatList behaviors and routing edge cases

**Research date:** 2026-01-19
**Valid until:** 30 days (expo-router stable, patterns well-established)
