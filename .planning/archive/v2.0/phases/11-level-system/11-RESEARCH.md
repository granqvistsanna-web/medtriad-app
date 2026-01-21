# Phase 11: Level System - Research

**Researched:** 2026-01-19
**Domain:** User progression system, React Native UI components
**Confidence:** HIGH

## Summary

Phase 11 implements a 6-tier progression system (Student -> Chief) based on games played, replacing the existing 11-tier mastery system based on questions answered. The research confirms the existing codebase provides solid foundations: `mastery.ts` already has tier calculation logic (needs modification for new thresholds), `useStats` hook exposes level data to components, and `MasteryBar` provides an animated progress bar component (needs thin styling update).

The scope is intentionally constrained by user decisions: no tier-specific colors (all tiers use `colors.primary`), thin progress bar style (~4-6px), no percentage display. The tier system should feel like natural progression, not gamification overload.

**Primary recommendation:** Modify `mastery.ts` to use 6 game-based tiers, create a thin `TierProgressBar` component, then integrate tier name display into Results and Progress screens. Keep implementation minimal and understated.

## Standard Stack

The existing codebase already has all required libraries installed.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | ~4.1.1 | Animated progress bar fill | Already used throughout app for motion |
| expo-symbols | ~1.0.8 | SF Symbols icons (if needed) | Already used for icons |
| @react-native-async-storage/async-storage | - | Stats persistence | Already used for `gamesPlayed` storage |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | No additional libraries required |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom progress bar | react-native-progress | Existing MasteryBar pattern works, no need for external lib |

**Installation:**
No new packages required.

## Architecture Patterns

### Existing Structure (Extend These)
```
medtriad/
├── services/
│   └── mastery.ts          # Tier logic - MODIFY for 6 game-based tiers
│   └── stats-storage.ts    # Already tracks gamesPlayed - no changes
├── hooks/
│   └── useStats.ts         # Already exposes masteryLevel, levelTitle - UPDATE exports
├── components/
│   └── home/
│       └── MasteryBar.tsx  # Reference for bar pattern - CREATE TierProgressBar
│   └── progress/
│       └── TierHeader.tsx  # NEW - tier name + progress bar for Progress screen
├── app/
│   └── quiz/
│       └── results.tsx     # ADD tier name display
│   └── (tabs)/
│       └── progress.tsx    # ADD TierHeader component
```

### Pattern 1: Tier Definition as Constants
**What:** Define tiers as a typed constant array with thresholds
**When to use:** When tier definitions need to be referenced in multiple places
**Example:**
```typescript
// services/mastery.ts
export interface TierDefinition {
  tier: number;
  name: string;
  gamesRequired: number;
}

export const TIERS: TierDefinition[] = [
  { tier: 1, name: 'Student', gamesRequired: 0 },
  { tier: 2, name: 'Intern', gamesRequired: 10 },
  { tier: 3, name: 'Resident', gamesRequired: 25 },
  { tier: 4, name: 'Doctor', gamesRequired: 50 },
  { tier: 5, name: 'Specialist', gamesRequired: 100 },
  { tier: 6, name: 'Chief', gamesRequired: 200 },
];

export function getTierForGames(gamesPlayed: number): TierDefinition {
  // Find highest tier where gamesRequired <= gamesPlayed
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (gamesPlayed >= TIERS[i].gamesRequired) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

export function getNextTier(currentTier: number): TierDefinition | null {
  const nextIndex = currentTier; // tier is 1-indexed, array is 0-indexed
  return nextIndex < TIERS.length ? TIERS[nextIndex] : null;
}

export function getProgressToNextTier(gamesPlayed: number): number {
  const currentTier = getTierForGames(gamesPlayed);
  const nextTier = getNextTier(currentTier.tier);

  if (!nextTier) return 1; // Max tier, always full

  const gamesInCurrentTier = gamesPlayed - currentTier.gamesRequired;
  const gamesNeededForNext = nextTier.gamesRequired - currentTier.gamesRequired;

  return gamesInCurrentTier / gamesNeededForNext;
}
```

### Pattern 2: Thin Progress Bar Component
**What:** Reusable thin progress bar with animated fill
**When to use:** Tier progress display on Progress screen
**Example:**
```typescript
// components/progress/TierProgressBar.tsx
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

const BAR_HEIGHT = 4; // Thin, understated

type TierProgressBarProps = {
  progress: number; // 0-1
};

export function TierProgressBar({ progress }: TierProgressBarProps) {
  const colors = Colors.light;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { backgroundColor: colors.border }]}>
      <Animated.View
        style={[styles.fill, { backgroundColor: colors.primary }, fillStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
```

### Pattern 3: useStats Hook Extension
**What:** Extend existing hook to expose game-based tier data
**When to use:** Components need tier info without direct service calls
**Example:**
```typescript
// useStats.ts additions
import { getTierForGames, getProgressToNextTier, getNextTier } from '@/services/mastery';

// In StatsData interface:
export interface StatsData {
  // ... existing fields ...
  tier: TierDefinition;
  tierProgress: number;      // 0-1 progress to next tier
  nextTier: TierDefinition | null;
}

// In derived values:
const gamesPlayed = stats?.gamesPlayed ?? 0;
const tier = getTierForGames(gamesPlayed);
const tierProgress = getProgressToNextTier(gamesPlayed);
const nextTier = getNextTier(tier.tier);
```

### Anti-Patterns to Avoid
- **Hardcoding tier names in components:** Always reference TIERS constant
- **Adding percentage text to progress bar:** User explicitly declined, keep bar-only
- **Per-tier colors:** User explicitly declined, use `colors.primary` everywhere
- **Complex animations for tier display:** Keep it subtle, not gamification overload

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animated progress fill | Manual animation logic | react-native-reanimated withTiming | Already proven in MasteryBar.tsx |
| Tier calculation | Multiple if-statements | Array.findLast pattern on TIERS array | Cleaner, easier to modify thresholds |
| State management for tier | New context/store | Extend existing useStats hook | Already has refresh, recordQuizResult patterns |

**Key insight:** The codebase already has patterns for everything needed. This phase is about refactoring existing mastery.ts and creating one thin progress bar component.

## Common Pitfalls

### Pitfall 1: Breaking Existing Mastery Functionality
**What goes wrong:** Old mastery functions still referenced elsewhere cause errors
**Why it happens:** mastery.ts is imported in multiple places
**How to avoid:**
1. Search codebase for all imports of mastery.ts functions
2. Update all call sites or maintain backward-compatible exports
3. The existing functions `calculateLevel`, `getProgressInLevel`, `getLevelTitle` are used in `useStats.ts`, `results.tsx`, `MasteryBar.tsx`, and `index.tsx`
**Warning signs:** TypeScript errors, undefined function calls

### Pitfall 2: Progress Calculation Edge Cases
**What goes wrong:** Division by zero at tier boundaries, incorrect progress at max tier
**Why it happens:** Math errors when user is at exact tier threshold or max tier
**How to avoid:**
- At tier boundary: progress should be 0 (just reached new tier)
- At max tier (Chief, 200+ games): progress should be 1 (bar stays full)
- Test: 0 games, 10 games (exactly Intern), 199 games, 200 games, 500 games
**Warning signs:** NaN in progress bar, bar overflowing

### Pitfall 3: Stale Stats After Quiz
**What goes wrong:** Results screen shows old tier after game increments gamesPlayed
**Why it happens:** Stats recorded but not re-fetched before displaying tier
**How to avoid:** Results screen already calls `recordQuizResult` which updates local state. Ensure tier display uses the updated stats, not a stale cache.
**Warning signs:** Tier doesn't update after hitting threshold game

### Pitfall 4: Visual Inconsistency with Design System
**What goes wrong:** Progress bar looks different from rest of app
**Why it happens:** Not following established spacing, colors, typography
**How to avoid:**
- Use `colors.primary` for fill (not a custom tier color)
- Use `colors.border` for track (matches app's border token)
- Use `Radius.full` for rounded ends
- Use `Typography.caption` or `Typography.footnote` for tier name
**Warning signs:** Jarring visual difference, breaks the "soft, weighted, physical" motion principle

## Code Examples

Verified patterns from existing codebase:

### Animated Width Fill (from MasteryBar.tsx)
```typescript
// Source: /medtriad/components/home/MasteryBar.tsx
const animatedProgress = useSharedValue(0);

useEffect(() => {
  animatedProgress.value = withTiming(progress, {
    duration: 800,
    easing: Easing.out(Easing.cubic),
  });
}, [progress]);

const fillStyle = useAnimatedStyle(() => ({
  width: `${animatedProgress.value * 100}%`,
}));

// Track and fill rendering
<View style={[styles.track, { backgroundColor: colors.border }]}>
  <Animated.View style={[styles.fill, { backgroundColor: colors.primary }, fillStyle]} />
</View>
```

### Section Header Pattern (from progress.tsx)
```typescript
// Source: /medtriad/app/(tabs)/progress.tsx
<View style={styles.sectionHeader}>
  <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>YOUR STATS</Text>
  <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
</View>

// Styles
sectionHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.md,
},
sectionTitle: {
  ...Typography.tiny,
  letterSpacing: 1,
},
sectionLine: {
  flex: 1,
  height: 1,
},
```

### Entry Animation Pattern (from design system)
```typescript
// Source: DESIGN-SYSTEM.md
entering={FadeInUp.delay(N * Durations.stagger).duration(Durations.normal).springify()}
```

### Existing Tier Name in Results (current approach)
```typescript
// Source: /medtriad/app/quiz/results.tsx line 186-191
<Animated.View
  entering={FadeInUp.delay(Durations.staggerMedium * 5).duration(Durations.normal).springify()}
  style={[styles.masteryBadge, { backgroundColor: colors.primaryLight }]}
>
  <Text style={[styles.masteryText, { color: colors.primary }]}>
    {questionsToNext > 0
      ? `+${QUESTION_COUNT} questions toward Level ${level + 1}`
      : `Level ${level} Master!`}
  </Text>
</Animated.View>
```
This will be replaced with tier name display (e.g., "Resident").

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 11 tiers based on questions answered | 6 tiers based on games played | Phase 11 | Simpler progression, medical-themed names |
| Generic level titles (Beginner, Novice, etc.) | Medical-themed tier names (Student, Intern, Resident, Doctor, Specialist, Chief) | Phase 11 | Better theme alignment |
| Thick progress bar (8px) with numbers | Thin progress bar (4-6px) without numbers | Phase 11 | Understated, non-gamified feel |

**Deprecated/outdated:**
- `calculateLevel(totalAnswered)`: Replace with `getTierForGames(gamesPlayed)`
- `getProgressInLevel(totalAnswered)`: Replace with `getProgressToNextTier(gamesPlayed)`
- `getLevelTitle(level)`: Replace with `tier.name` from `getTierForGames()`
- `MAX_LEVEL = 10`, `QUESTIONS_PER_LEVEL = 10`: Replace with TIERS constant

## Open Questions

No significant open questions. The scope is well-defined by user decisions in CONTEXT.md.

1. **MasteryBar.tsx disposition**
   - What we know: Exists in components/home/, uses old mastery system
   - What's unclear: Keep for backward compat or fully replace?
   - Recommendation: Create new TierProgressBar, update MasteryBar to use new system, or mark deprecated. Check if MasteryBar is actually used anywhere.

## Sources

### Primary (HIGH confidence)
- `/medtriad/services/mastery.ts` - Current tier logic implementation
- `/medtriad/services/stats-storage.ts` - gamesPlayed persistence
- `/medtriad/hooks/useStats.ts` - Data flow to components
- `/medtriad/components/home/MasteryBar.tsx` - Animated bar pattern
- `/medtriad/app/(tabs)/progress.tsx` - Progress screen structure
- `/medtriad/app/quiz/results.tsx` - Results screen structure
- `/medtriad/constants/theme.ts` - Design tokens
- `/medtriad/constants/DESIGN-SYSTEM.md` - Motion and styling patterns

### Secondary (MEDIUM confidence)
- Phase 11 CONTEXT.md - User decisions on colors, bar style, display locations

### Tertiary (LOW confidence)
- (none)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project
- Architecture: HIGH - Clear patterns from existing code
- Pitfalls: HIGH - Based on actual code review

**Research date:** 2026-01-19
**Valid until:** 60 days (stable, internal patterns)
