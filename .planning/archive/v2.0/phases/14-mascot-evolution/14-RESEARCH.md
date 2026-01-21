# Phase 14: Mascot Evolution - Research

**Researched:** 2026-01-19
**Domain:** React Native image assets, tier-based state management, celebration animations
**Confidence:** HIGH

## Summary

The mascot evolution feature builds on a well-established codebase with clear patterns. The app already uses `react-native-reanimated` for animations, `react-native-confetti-cannon` for celebrations, and a mature tier system (`mastery.ts`) with hook support (`useStats`). The current `TriMascot` component loads images via `require()` at module level and selects based on `masteryLevel` prop.

The key implementation challenge is tier-up detection: determining when a game completion crosses a tier threshold. This must work both in real-time (Results screen celebration) and for catch-up scenarios (Home screen glow when user missed celebration).

**Primary recommendation:** Extend `TriMascot` with a `tier` prop for tier-based image selection, add tier-up detection to the quiz flow, and create a `TierUpCelebration` component that combines confetti + mascot transition.

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | ~4.1.1 | Scale out/in transitions, glow effects | Already used throughout app for all animations |
| react-native-confetti-cannon | ^1.5.2 | Tier-up celebration confetti | Already used in Results screen for perfect rounds |
| react-native | 0.81.5 | Image component for PNG rendering | Standard RN image handling |

### Supporting (Already Available)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-native-async-storage/async-storage | ^2.2.0 | Persist "pending tier-up" flag | For catch-up celebration detection |
| expo-router | ~6.0.21 | Pass tier-up params between screens | Navigate with tier-up indicator |

### No New Dependencies Needed

All required animation and celebration primitives are already in the project.

## Architecture Patterns

### Recommended Project Structure

```
medtriad/
├── assets/images/
│   ├── tri-tier-1.png      # Student (new - user provides)
│   ├── tri-tier-2.png      # Intern with bandaid (new)
│   ├── tri-tier-3.png      # Resident with clipboard (new)
│   ├── tri-tier-4.png      # Doctor with stethoscope (new)
│   ├── tri-tier-5.png      # Specialist with head mirror (new)
│   ├── tri-tier-6.png      # Chief with gold badge (new)
│   ├── tri-neutral.png     # Keep for quiz/non-tier contexts
│   ├── tri-success.png     # Keep for happy mood
│   ├── tri-master.png      # DEPRECATED - remove after migration
│   └── tri-supermaster.png # DEPRECATED - remove after migration
├── components/
│   └── home/
│       └── TriMascot.tsx   # Extended with tier prop
├── components/
│   └── results/
│       └── TierUpCelebration.tsx  # New celebration overlay
├── hooks/
│   ├── useStats.ts         # Already exposes tier info
│   └── useTierUp.ts        # New: tier-up detection hook
└── services/
    ├── mastery.ts          # Already has tier logic
    └── stats-storage.ts    # Add pendingTierUp flag
```

### Pattern 1: Tier-Based Image Selection

**What:** Select mascot image based on tier number rather than arbitrary mastery level
**When to use:** Home screen mascot display (tier-aware)

```typescript
// Current approach (masteryLevel-based, to be replaced):
const getImageSource = () => {
  if (masteryLevel >= 10) return triSupermaster;
  if (masteryLevel >= 7) return triMaster;
  // ...
};

// New approach (tier-based):
const TIER_IMAGES = {
  1: require('@/assets/images/tri-tier-1.png'),
  2: require('@/assets/images/tri-tier-2.png'),
  3: require('@/assets/images/tri-tier-3.png'),
  4: require('@/assets/images/tri-tier-4.png'),
  5: require('@/assets/images/tri-tier-5.png'),
  6: require('@/assets/images/tri-tier-6.png'),
} as const;

const getImageSource = (tier: number, mood: MascotMood, context: 'home' | 'quiz') => {
  // Home screen uses tier-specific images
  if (context === 'home') {
    return TIER_IMAGES[tier as keyof typeof TIER_IMAGES] || TIER_IMAGES[1];
  }
  // Quiz/results use mood-based images (existing behavior)
  if (mood === 'happy' || mood === 'streak') return triHappy;
  return triNeutral;
};
```

**Key insight:** Images MUST be `require()`d at module level in React Native for Metro bundler to include them. Dynamic `require()` paths do not work.

### Pattern 2: Tier-Up Detection

**What:** Detect when a completed game crosses a tier threshold
**When to use:** After quiz completion, before navigating to Results

```typescript
// In mastery.ts - add helper function:
export function didTierUp(
  gamesPlayedBefore: number,
  gamesPlayedAfter: number
): { didTierUp: boolean; newTier: TierDefinition | null } {
  const tierBefore = getTierForGames(gamesPlayedBefore);
  const tierAfter = getTierForGames(gamesPlayedAfter);

  if (tierAfter.tier > tierBefore.tier) {
    return { didTierUp: true, newTier: tierAfter };
  }
  return { didTierUp: false, newTier: null };
}

// In quiz/index.tsx - check tier-up when game ends:
const tierBeforeGame = getTierForGames(stats?.gamesPlayed ?? 0);
// ... after recordQuizResult ...
const tierAfterGame = getTierForGames((stats?.gamesPlayed ?? 0) + 1);
const tierUp = tierAfterGame.tier > tierBeforeGame.tier;

router.replace({
  pathname: '/quiz/results',
  params: {
    // ... existing params ...
    tierUp: tierUp ? 'true' : 'false',
    newTierName: tierUp ? tierAfterGame.name : '',
    newTierNumber: tierUp ? tierAfterGame.tier.toString() : '',
  },
});
```

### Pattern 3: Catch-Up Celebration (Persisted Flag)

**What:** Show celebration on Home when user missed the Results tier-up
**When to use:** App was closed/crashed during tier-up moment

```typescript
// In stats-storage.ts - add to StoredStats:
interface StoredStats {
  // ... existing fields ...
  pendingTierUp: { tier: number; name: string } | null;
}

// In updateAfterQuiz - set pending flag:
const tierBefore = getTierForGames(currentStats.gamesPlayed);
const tierAfter = getTierForGames(currentStats.gamesPlayed + 1);
const updatedStats: StoredStats = {
  // ... existing ...
  pendingTierUp: tierAfter.tier > tierBefore.tier
    ? { tier: tierAfter.tier, name: tierAfter.name }
    : currentStats.pendingTierUp,
};

// Results screen clears the flag after showing celebration
// Home screen checks for flag and shows glow if present
```

### Pattern 4: Scale Out/In Transition with Confetti

**What:** Mascot shrinks to 0, confetti fires, mascot grows back with new tier image
**When to use:** Tier-up celebration on Results screen

```typescript
// Using react-native-reanimated
const mascotScale = useSharedValue(1);
const [displayedTier, setDisplayedTier] = useState(oldTier);

const triggerTierUpAnimation = () => {
  // Scale out
  mascotScale.value = withTiming(0, { duration: 300 }, (finished) => {
    if (finished) {
      runOnJS(setDisplayedTier)(newTier);
      // Fire confetti while scaled out
      runOnJS(startConfetti)();
      // Scale in with spring
      mascotScale.value = withSpring(1, Easings.bouncy);
    }
  });
};
```

### Pattern 5: Glow Effect on First View

**What:** Subtle shimmer/glow around mascot when first viewed after tier-up
**When to use:** Home screen after tier-up (including catch-up)

```typescript
// Glow animation (already exists in TriMascot for streak mood)
const glow = useSharedValue(0);

useEffect(() => {
  if (showNewTierGlow) {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      3, // Run 3 times then stop
      false
    );
  }
}, [showNewTierGlow]);
```

### Anti-Patterns to Avoid

- **Dynamic require paths:** `require(`@/assets/images/tri-tier-${tier}.png`)` does NOT work - Metro bundler cannot resolve dynamic paths
- **Tier detection in useStats only:** The hook re-fetches stats, so tier comparison happens after the update. Must capture tier BEFORE calling recordQuizResult
- **Confetti during mascot visible:** Scale mascot to 0 first, then fire confetti, then scale back - creates dramatic reveal
- **Instant mascot swap:** Use scale transition, not opacity fade or instant swap per CONTEXT.md decision

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confetti particles | Custom particle system | react-native-confetti-cannon (installed) | Physics, performance, customization already handled |
| Image loading | Dynamic import wrapper | Static require() map | Metro bundler requirement |
| Tier calculations | Inline threshold logic | mastery.ts functions | Already centralized, tested |
| Spring physics | Manual easing curves | reanimated springs | Consistent with rest of app |

**Key insight:** The celebration animation primitives already exist (confetti in Results, glow in TriMascot streak mode). This phase composes existing patterns.

## Common Pitfalls

### Pitfall 1: Race Condition in Tier Detection

**What goes wrong:** Calling `didTierUp` after `recordQuizResult` compares new stats to themselves
**Why it happens:** `recordQuizResult` updates storage, then `useStats` refetches, all before comparison
**How to avoid:** Capture `gamesPlayed` from stats BEFORE calling recordQuizResult, compare to `gamesPlayed + 1`
**Warning signs:** Tier-up never triggers despite crossing threshold

### Pitfall 2: Dynamic require() Fails Silently

**What goes wrong:** App bundles without tier images, shows broken image on tier-up
**Why it happens:** Metro cannot trace dynamic `require()` paths at build time
**How to avoid:** Static require() at module level, stored in object with tier keys
**Warning signs:** Works in development (cache), fails in production builds

### Pitfall 3: Missing Catch-Up Clear

**What goes wrong:** Glow shows on every Home visit indefinitely
**Why it happens:** `pendingTierUp` flag never cleared after showing celebration
**How to avoid:** Clear flag in Home after glow animation completes, OR in Results after celebration shows
**Warning signs:** Glow keeps appearing after multiple app opens

### Pitfall 4: Confetti Timing Off

**What goes wrong:** Confetti fires while old mascot visible, or new mascot appears before confetti
**Why it happens:** Animation sequences not properly chained
**How to avoid:** Use reanimated `withTiming` callback to sequence: scale out -> set new tier -> confetti -> scale in
**Warning signs:** Anticlimactic reveal, mascot visible during confetti

## Code Examples

### Tier Image Map (Static Requires)

```typescript
// At module level in TriMascot.tsx
const TIER_IMAGES = {
  1: require('@/assets/images/tri-tier-1.png'),
  2: require('@/assets/images/tri-tier-2.png'),
  3: require('@/assets/images/tri-tier-3.png'),
  4: require('@/assets/images/tri-tier-4.png'),
  5: require('@/assets/images/tri-tier-5.png'),
  6: require('@/assets/images/tri-tier-6.png'),
} as const;

// Usage
const tierImage = TIER_IMAGES[tier as keyof typeof TIER_IMAGES];
```

### Confetti Cannon Configuration (Existing Pattern)

```typescript
// From results.tsx - already proven configuration
<ConfettiCannon
  ref={confettiRef}
  count={150}
  origin={{ x: width / 2, y: -10 }}
  fallSpeed={3500}
  fadeOut
  autoStart={false}
  colors={['#3B82F6', '#22C55E', '#FACC15', '#F97316', '#EC4899']}
/>
```

### Scale Transition with Callback

```typescript
// Source: react-native-reanimated patterns + existing app Easings
import { runOnJS } from 'react-native-reanimated';

const triggerTransition = () => {
  mascotScale.value = withTiming(0, { duration: 300 }, (finished) => {
    if (finished) {
      runOnJS(onMidpointCallback)(); // Set new tier image, trigger confetti
    }
  });
};

// Then in callback:
const onMidpointCallback = () => {
  setDisplayedTier(newTier);
  confettiRef.current?.start();
  // Scale back up after small delay for confetti to be visible
  setTimeout(() => {
    mascotScale.value = withSpring(1, Easings.bouncy);
  }, 200);
};
```

### Tier-Up Detection Helper

```typescript
// In mastery.ts
export function checkTierUp(
  gamesPlayedBefore: number
): { willTierUp: boolean; newTier: TierDefinition | null } {
  const gamesPlayedAfter = gamesPlayedBefore + 1;
  const tierBefore = getTierForGames(gamesPlayedBefore);
  const tierAfter = getTierForGames(gamesPlayedAfter);

  return {
    willTierUp: tierAfter.tier > tierBefore.tier,
    newTier: tierAfter.tier > tierBefore.tier ? tierAfter : null,
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| masteryLevel-based images (0-10 scale) | tier-based images (1-6 tiers) | Phase 11 | TriMascot needs tier prop |
| Legacy question-based levels | Game-based tiers | Phase 11 | Use `tier` from useStats, not `masteryLevel` |
| No celebration system | Confetti for perfect rounds | Phase 5 | Extend for tier-up |

**Deprecated/outdated:**
- `masteryLevel` prop on TriMascot: Replace with `tier` prop
- `triMaster.png` and `triSupermaster.png`: Replace with tier-specific images

## Open Questions

None - all implementation details resolved by CONTEXT.md decisions.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `TriMascot.tsx`, `mastery.ts`, `useStats.ts`, `results.tsx`
- Package.json verified: react-native-confetti-cannon ^1.5.2, react-native-reanimated ~4.1.1
- CONTEXT.md: User decisions on 6 pre-composed PNGs, scale out/in transition, catch-up celebration

### Secondary (MEDIUM confidence)
- React Native Metro bundler documentation: Static require() requirement

### Tertiary (LOW confidence)
- None - all patterns verified against existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and in use
- Architecture: HIGH - patterns derived from existing codebase
- Pitfalls: HIGH - based on actual code analysis and React Native fundamentals

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (stable - no external API dependencies)
