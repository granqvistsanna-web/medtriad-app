# Phase 20: Performance - Research

**Researched:** 2026-01-19
**Domain:** React Native/Expo performance optimization, animations, memory management
**Confidence:** HIGH

## Summary

Phase 20 focuses on achieving smooth, responsive user experience with specific targets: cold launch < 1.5s, quiz loads < 100ms, no dropped frames during animations, and memory under 100MB. The app uses Expo SDK 54 with React Native 0.81 (New Architecture enabled), react-native-reanimated 4.1.1 for animations, and AsyncStorage for persistence.

The codebase analysis reveals several optimization opportunities:
1. **Library screen uses ScrollView with 45 items** - should be virtualized
2. **Stats loading blocks root layout** - creates visible loading delay
3. **Mascot images use standard Image component** - should use expo-image with preloading
4. **No memoization patterns** - some components could benefit from React.memo

**Primary recommendation:** Profile the app in release mode to establish baselines, then apply targeted optimizations starting with the Library screen virtualization and image preloading.

## Standard Stack

The established libraries/tools for React Native performance optimization:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | 4.x | UI thread animations | Native worklets bypass JS thread |
| expo-image | 3.0.11 | Image loading/caching | Built-in prefetch, disk/memory cache |
| FlashList | 2.x | Virtualized lists | 10x faster than FlatList, cell recycling |

### Already In Use
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| react-native-reanimated | 4.1.1 | Animations | Good - already using worklets |
| expo-image | 3.0.11 | Images | Good - need to leverage prefetch |
| hermes | Built-in | JS engine | Auto-enabled in RN 0.81+ |

### Supporting (If Needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @shopify/flash-list | 2.0.x | Fast lists | Library screen with 45+ items |
| react-native-mmkv | 3.x | Fast storage | Only if AsyncStorage is bottleneck |

### Not Needed
| Library | Why Skip |
|---------|----------|
| react-native-mmkv | AsyncStorage sufficient for simple key-value (~5KB) |
| react-native-skia | No complex graphics/100+ animations |

**Installation (if FlashList needed):**
```bash
npx expo install @shopify/flash-list
```

## Architecture Patterns

### Recommended Optimization Strategy

```
Performance Optimization Order:
1. Profile first (release mode)
2. Fix hot paths (lists, images)
3. Memoize expensive computations
4. Preload critical assets
5. Defer non-critical work
```

### Pattern 1: Image Preloading with expo-image

**What:** Preload tier mascot images during app initialization
**When to use:** App launch, before Home screen displays

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/image/
import { Image } from 'expo-image';

// Preload all tier images at startup
const TIER_IMAGES = [
  require('@/assets/images/tri-lvl1.png'),
  require('@/assets/images/tri-lvl2.png'),
  // ... etc
];

async function preloadMascotImages() {
  const uris = TIER_IMAGES.map(img => Image.resolveAssetSource(img).uri);
  await Image.prefetch(uris, { cachePolicy: 'memory-disk' });
}
```

### Pattern 2: Virtualized Library List

**What:** Replace ScrollView with FlashList for 45+ triad cards
**When to use:** Lists with > 10 items that render complex components

```typescript
// Source: https://shopify.github.io/flash-list/
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={filteredTriads}
  renderItem={({ item, index }) => (
    <TriadCard triad={item} index={index} searchQuery={searchQuery} />
  )}
  estimatedItemSize={120} // Approximate card height
  keyExtractor={(item) => item.id}
/>
```

### Pattern 3: InteractionManager for Deferred Work

**What:** Defer non-critical work until after navigation animations
**When to use:** Quiz initialization, post-navigation data loading

```typescript
// Source: https://reactnative.dev/docs/performance
import { InteractionManager } from 'react-native';

useEffect(() => {
  const handle = InteractionManager.runAfterInteractions(() => {
    // Heavy work that can wait
    const questions = generateQuestionSet(QUESTION_COUNT);
    dispatch({ type: 'START_QUIZ', questions });
  });

  return () => handle.cancel();
}, []);
```

### Pattern 4: React.memo for Static Components

**What:** Prevent unnecessary re-renders of pure components
**When to use:** Child components with stable props in lists or frequently updating parents

```typescript
// Only re-render if triad data or searchQuery changes
export const TriadCard = React.memo(function TriadCard({
  triad,
  index,
  searchQuery
}: TriadCardProps) {
  // ... component code
});
```

### Anti-Patterns to Avoid

- **Anonymous functions in render:** Creates new function reference each render, breaks memoization
- **Inline styles in lists:** Creates new object each render, use StyleSheet
- **Reading .value on JS thread:** Blocks JS thread waiting for UI thread sync
- **Animating layout properties:** `top/left/width/height` cause layout recalculation; prefer `transform`

## Don't Hand-Roll

Problems that have existing optimized solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fast lists | Custom virtualization | FlashList | Cell recycling, 10x faster |
| Image caching | Manual cache | expo-image prefetch | Native SDWebImage/Glide |
| Memory profiling | Guessing | Hermes heap profiler | Accurate leak detection |
| Animation timing | setTimeout loops | Reanimated worklets | UI thread, 60fps |
| Bundle size analysis | Manual inspection | `npx expo-optimize` | Tree shaking, dead code |

**Key insight:** React Native's JavaScript bridge is the performance bottleneck. Use libraries that run on native/UI threads (Reanimated, expo-image, FlashList) instead of custom JS solutions.

## Common Pitfalls

### Pitfall 1: Development Mode Performance Testing

**What goes wrong:** Performance appears much worse than reality
**Why it happens:** Debug builds include runtime type checking, verbose logging, no optimization
**How to avoid:** ALWAYS test performance in release builds
**Warning signs:** 5-10x slower than expected, inconsistent frame rates

```bash
# Build release for testing
npx expo run:ios --configuration Release
# or
eas build --profile preview --platform ios
```

### Pitfall 2: Console.log in Production

**What goes wrong:** JS thread bottleneck, visible lag
**Why it happens:** Console statements remain in production bundle
**How to avoid:** Use babel-plugin-transform-remove-console
**Warning signs:** Lag correlates with logging activity

```json
// babel.config.js
{
  "env": {
    "production": {
      "plugins": ["transform-remove-console"]
    }
  }
}
```

### Pitfall 3: AsyncStorage Blocking App Launch

**What goes wrong:** Splash screen hangs, slow cold start
**Why it happens:** Awaiting storage before rendering
**How to avoid:** Show placeholder UI, load data asynchronously
**Warning signs:** > 500ms before first render

```typescript
// Current pattern (blocking)
if (loading) return null; // Bad - user sees nothing

// Better pattern
if (loading) return <SkeletonScreen />; // Show immediate feedback
```

### Pitfall 4: ScrollView for Long Lists

**What goes wrong:** Memory grows unbounded, initial render slow
**Why it happens:** ScrollView renders ALL children immediately
**How to avoid:** Use FlashList/FlatList for > 10 items
**Warning signs:** Memory grows as user scrolls, initial load > 100ms

### Pitfall 5: Animating Width/Height

**What goes wrong:** Animation drops frames, UI jank
**Why it happens:** Layout properties trigger expensive recalculation
**How to avoid:** Use transform (scale, translate) instead
**Warning signs:** UI thread drops to < 60 FPS during animation

```typescript
// Bad - causes layout recalculation
style={{ width: animatedWidth }}

// Good - GPU-accelerated transform
style={{ transform: [{ scaleX: animatedScale }] }}
```

### Pitfall 6: Too Many Simultaneous Animations

**What goes wrong:** Frame drops, jank on low-end devices
**Why it happens:** Even UI thread has limits
**How to avoid:** Limit to ~100 animated components (Android), ~500 (iOS)
**Warning signs:** Reanimated docs explicitly warn about this limit

## Code Examples

Verified patterns from official sources:

### Measuring Performance

```typescript
// Source: https://reactnative.dev/docs/performance
// Use the Performance Monitor in Dev Menu

// Or programmatic timing:
const start = performance.now();
// ... operation ...
const duration = performance.now() - start;
console.log(`Operation took ${duration.toFixed(2)}ms`);
```

### Preloading Images at App Start

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/image/
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync();

// In root layout
useEffect(() => {
  async function prepare() {
    // Preload mascot images
    await Image.prefetch([
      require('@/assets/images/tri-lvl1.png'),
      require('@/assets/images/tri-lvl2.png'),
      // ... etc
    ].map(img => Image.resolveAssetSource(img).uri));

    await SplashScreen.hideAsync();
  }
  prepare();
}, []);
```

### FlashList Migration

```typescript
// Source: https://shopify.github.io/flash-list/
// Before (ScrollView with map)
<ScrollView>
  {filteredTriads.map((triad, index) => (
    <TriadCard key={triad.id} triad={triad} index={index} />
  ))}
</ScrollView>

// After (FlashList)
<FlashList
  data={filteredTriads}
  renderItem={({ item, index }) => (
    <TriadCard triad={item} index={index} />
  )}
  estimatedItemSize={120}
  keyExtractor={(item) => item.id}
/>
```

### Reanimated Non-Layout Animation

```typescript
// Source: https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/
// Good - animates transform (GPU-accelerated)
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { scale: scale.value },
    { translateY: translateY.value },
  ],
  opacity: opacity.value,
}));

// Avoid - animates layout properties
const badStyle = useAnimatedStyle(() => ({
  width: width.value,  // Causes layout recalculation
  marginTop: margin.value,  // Causes layout recalculation
}));
```

### Memoizing Gestures and Callbacks

```typescript
// Source: https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/
import { useCallback, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';

// Memoize gesture for FlatList items
const tapGesture = useMemo(() =>
  Gesture.Tap().onEnd(() => {
    // handle tap
  }),
[]);

// Memoize frame callback
const frameCallback = useCallback((frameInfo) => {
  // worklet code
}, []);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| FlatList | FlashList 2.x | 2024 | 10x performance for lists |
| React Native Image | expo-image | 2023 | Native caching, no flicker |
| Manual memoization | React Compiler | 2025 | Auto-memoization (experimental) |
| Reanimated 2/3 | Reanimated 4.x | 2025 | New Architecture optimizations |

**Current Best Practices (2025):**
- Expo SDK 54 with New Architecture enabled (app.json: `"newArchEnabled": true`) - ALREADY SET
- Hermes engine default in RN 0.81+ - ALREADY ENABLED
- React Compiler enabled (experimental) - ALREADY SET in app.json
- expo-image for all image loading with prefetch
- FlashList for any list > 10 items

**Deprecated/outdated:**
- react-native-fast-image: Replaced by expo-image
- Reanimated 3.x: Upgrade to 4.x for RN 0.81+ support
- AsyncStorage for large data: Use MMKV or SQLite

## Open Questions

Things that couldn't be fully resolved:

1. **Exact cold launch baseline**
   - What we know: Expo SDK 54 optimized for iOS startup
   - What's unclear: Current app baseline measurement
   - Recommendation: Measure in release build before optimizing

2. **Memory baseline**
   - What we know: Hermes heap profiler available
   - What's unclear: Current memory usage under typical use
   - Recommendation: Profile with Flipper before setting optimization targets

3. **React Compiler effectiveness**
   - What we know: Already enabled in app.json
   - What's unclear: Whether it's actually optimizing components
   - Recommendation: May not need manual memoization; test first

## Sources

### Primary (HIGH confidence)
- [React Native Performance Docs](https://reactnative.dev/docs/performance) - Frame rates, profiling, optimization patterns
- [Reanimated Performance Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/) - Animation limits, UI thread
- [expo-image Documentation](https://docs.expo.dev/versions/latest/sdk/image/) - Prefetch, caching

### Secondary (MEDIUM confidence)
- [FlashList Documentation](https://shopify.github.io/flash-list/) - Cell recycling, migration
- [Callstack React Native Optimization Guide 2025](https://www.callstack.com/ebooks/the-ultimate-guide-to-react-native-optimization) - Comprehensive strategies
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54) - Performance improvements

### Tertiary (LOW confidence)
- WebSearch results on MMKV vs AsyncStorage - May be overkill for this app's data size
- WebSearch results on 120 FPS support - iOS specific, may not be relevant

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation verified
- Architecture patterns: HIGH - From official sources
- Pitfalls: HIGH - Well-documented in React Native/Reanimated docs
- Performance targets: MEDIUM - Success criteria provided, need baseline measurement

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - stable ecosystem)

---

## App-Specific Analysis

### Current Performance Characteristics

Based on codebase review:

| Area | Current State | Risk | Priority |
|------|---------------|------|----------|
| Library screen | ScrollView with 45 items | HIGH | 1 |
| Root layout | Blocks on stats loading | MEDIUM | 2 |
| Mascot images | Standard Image, no preload | MEDIUM | 3 |
| Quiz generation | Sync on mount | LOW | 4 |
| Animations | Good - using Reanimated worklets | LOW | - |

### Specific Recommendations

1. **Library Screen (HIGH priority)**
   - Current: `ScrollView` with `.map()` over 45 triads
   - Issue: Renders all 45 cards immediately, no virtualization
   - Fix: Replace with FlashList, add `estimatedItemSize`

2. **Root Layout Loading (MEDIUM priority)**
   - Current: Returns `null` while loading stats
   - Issue: Delays Time to Interactive
   - Fix: Show skeleton/loading state immediately, not blank screen

3. **Image Preloading (MEDIUM priority)**
   - Current: Uses standard `Image` component
   - Issue: Mascot may flash on first render
   - Fix: Switch to expo-image, prefetch tier images during splash

4. **Quiz Generation (LOW priority)**
   - Current: Synchronous in useEffect on mount
   - Issue: May delay quiz interactivity
   - Fix: Use InteractionManager if needed (measure first)

### What's Already Good

- React Compiler enabled (auto-memoization)
- Hermes engine (automatic with RN 0.81+)
- Reanimated 4.x for animations
- New Architecture enabled
- Springs use worklets (UI thread)
- Small data set (45 triads, ~5KB stats)
